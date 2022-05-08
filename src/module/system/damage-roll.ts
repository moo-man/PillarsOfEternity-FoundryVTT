export default class DamageRoll {
    constructor(damages, check)
    {
        this.data = {
            damages : damages,
            checkId : check?.message?.id,
            damageData : [],
            messageIds : [],
            healing : damages?.some(d => d.healing),
            usingShield : [] // index of target using shields
        }
        if (damages)
            this.damages = this.consolidateDamages(damages)
    }

    async rollDice() {
        await this.rollDamages()
        return this.sendToChat()
    }


    static recreate(data)
    {
        let roll = new DamageRoll()
        roll.data = data;
        roll.damages = roll.consolidateDamages(roll.data.damages)
        return roll
    }

    /**
     * Combine like damages (damage shouldn't be rerolled for different targets of the same damage source)
     * Damages are combined if they have the same base dice, crit dice, and label
     * Targets for each damage are combined into an array of objects containing the token and a number indicating the crit
     * 
     * @param {Array} damages   damage objects 
     */
    consolidateDamages(damages)
    {
        let consolidated = []

        for(let damage of damages)
        {
            if (!Array.isArray(damage.target))
            {
                damage.target = [this.calculateCrit(damage.target, damage)]
            }

            let existing
            if (damage.healing)
                existing = consolidated.find(d => d.value == damage.value && d.type == damage.type)
            else 
                existing = consolidated.find(d => d.base == damage.base && d.crit == damage.crit && d.label == damage.label)

            if (existing)
            {
                // Consolidated damage should have the highest multiplier
                if (damage.mult > existing.mult)
                    existing.mult = damage.mult

                if (damage.target)
                {
                    existing.target = existing.target.concat(damage.target)
                }
            }
            else
            {
                consolidated.push(damage)
            }
        }

        consolidated.forEach(damage => {
            damage.target = damage.target.filter(t => t.token)
            damage.target = damage.target.sort((a, b) => a.crit - b.crit)
        })
        return consolidated
    }

    calculateCrit(token, damage)
    {
        try {
            if (!token || damage.healing)
                return {token : token?.toObject(), crit: 0}
            let defense = damage.defense.toLowerCase() || "deflection"
            let margin = this.check.result.total - token.actor.defenses[defense].value
            let crit = Number.isNumeric(damage.mult) ? damage.mult : Math.floor(margin / 5)
            return {token : token.toObject(), crit, shield: !!token.actor.equippedShield}
        }
        catch (e)
        {
            console.error("Something went wrong when calculating damage crit on target", token, damage)
            return {token : null, crit : 0}
        }
    }


    async rollDamages()
    {
        for(let i = 0; i < this.damages.length; i++){
            let damage = this.damages[i]
            let baseDice = []
            let critDice = []
            if (!damage.healing)
            {
                let multiplier = damage.mult
                baseDice = [new Die({number : parseInt(damage.base.split("d")[0]), faces : parseInt(damage.base.split("d")[1]), options : {flavor: "Hit", crit : "base", targets : damage.target.filter(t => t.crit == 0)}})]
                for(let i = 0 ; i < multiplier; i++)
                {
                    critDice.push(new OperatorTerm({operator : "+"}))
                    critDice.push(new Die({number : parseInt(damage.crit.split("d")[0]), faces : parseInt(damage.crit.split("d")[1]), options :  {flavor : `${i + 1}x Crit`, crit : i + 1, targets : damage.target.filter(t => t.crit == (i + 1))}}))
                }
            }
            else  // If healing
            {
                if (!Number.isNumeric(damage.value)) // Is die roll
                    baseDice = [new Die({number : parseInt(damage.value.split("d")[0]), faces : parseInt(damage.value.split("d")[1]), options : {flavor: "Heal", crit : "base", targets : damage.target.filter(t => t.crit == 0)}})]
                else 
                    baseDice = [new NumericTerm({number : parseInt(damage.value), options : {flavor: "Heal", crit : "base", targets : damage.target.filter(t => t.crit == 0)}})]
            }

            let dice = baseDice.concat(critDice)
            let roll = Roll.fromTerms(dice)
            await roll.evaluate({async: true})

            let accumulatingTotal = 0
            roll.dice.forEach(die => {
                accumulatingTotal += die.total
                die.options.accumulator = accumulatingTotal
            })

            damage.parts = roll.dice.map(d => {
                let data = d.getTooltipData()
                data.options = d.options
                return data
            })

            damage.roll = roll
        }

    }

    toggleShield(id)
    {
        if (!canvas.tokens.get(id)?.actor?.isOwner)
            return 

        let html = $(this.message.data.content)
        let shield = html.find(`.shield[data-id="${id}"]`)[0]
        
        if (shield.classList.contains("active"))
        {
            this.data.usingShield = this.data.usingShield.filter(_id => _id != id)
            shield.classList.remove("active")
        }
        else 
        {
            this.data.usingShield.push(id)
            shield.classList.add("active")
        }

        let update = {content : html[0].outerHTML, "flags.pillars-of-eternity.damageData" : this.data}
        
        if (game.user.isGM)
            return this.message.update(update)
        else
            game.socket.emit("system.pillars-of-eternity", {type : "updateMessage", payload : {id: this.message.id, update}})
    }


    async sendToChat(newMessage = false) 
    {
        this.damages.forEach(async (damage, i) => {
            let type = game.pillars.config.damageTypes[damage.type]
            let label = "Damage"
            if (damage.healing)
            {
                type = damage.type[0].toUpperCase() + damage.type.substr(1);
                label = "Healing"
            }

            let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/damage.html", damage)

            let chatData = {
                flavor : damage.label ? `${damage.label} ${label} - ${type}` : `${item.name} ${label} ${damages.length > 1 ? i + 1 : ""} - ${type}`, 
                speaker : this.item.actor.speakerData(),
                content: html,
                type : CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll : damage.roll,
                flags : {"pillars-of-eternity.damageData" : this.data, "pillars-of-eternity.damageIndex" : i}
            }
            return ChatMessage.create(chatData).then(msg => {
                this.data.messageId = msg.id
                msg.update({"flags.pillars-of-eternity.damageData.messageId" : msg.id})
            })
        })
    }

    async applyDamage(index) {
      let html = ``
      let damage = this.damages[index]
      for(let part of damage.parts)
      {
        for(let t of part.options.targets)
        {
            let token = canvas.tokens.get(t.token._id)
            let msg = await token.actor.applyDamage(part.options.accumulator, damage.type, {shield : this.data.usingShield.includes(t.token._id)})
            html += `<b>${t.token.name}</b> : ${msg}<br><br>`  
        }
      }
      ChatMessage.create({content : html})
    }
    
    async applyHealing(index) {
        let html = ``
        let damage = this.damages[index]
        for (let target of damage.target)
        {
            let token = canvas.tokens.get(target.token._id)
            let msg = await token.actor.applyHealing(damage.roll.total, damage.type)
            html += `<b>${token.name}</b> : ${msg}<br><br>`  
        }
        ChatMessage.create({content : html})
      }

    get check() {
        return game.messages.get(this.data.checkId).getCheck()
    }

    get message() {
        return game.messages.get(this.data.messageId);
    }

    get item () {
        return this.check.item
    }
}