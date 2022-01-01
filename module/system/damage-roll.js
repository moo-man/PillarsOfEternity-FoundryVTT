export default class DamageRoll {
    constructor(damages, check, item)
    {
        this.check = check;
        this.item = item
        this.damages = this.consolidateDamages(damages)
    }

    async rollDice() {
        await this.rollDamages()
        return this.sendToChat()
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

            let existing = consolidated.find(d => d.base == damage.base && d.crit == damage.crit && d.label == damage.label)
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
            let defense = damage.defense.toLowerCase() || "deflection"
            let margin = this.check.result.total - token.actor.defenses[defense].value
            let crit = Math.floor(margin / 5)
            return {token : token.toObject(), crit}
        }
        catch (e)
        {
            console.error("Something went wrong when calculating damage crit on target", target, damage)
            return {token : null, crit : 0}
        }
    }


    async rollDamages()
    {
        for(let i = 0; i < this.damages.length; i++){
            let damage = this.damages[i]
            let multiplier = damage.mult
            let baseDice = [new Die({number : parseInt(damage.base.split("d")[0]), faces : parseInt(damage.base.split("d")[1]), options : {flavor: "Base", crit : "base", targets : damage.target.filter(t => t.crit == 0)}})]
            let critDice = []
            for(let i = 0 ; i < multiplier; i++)
            {
                critDice.push(new OperatorTerm({operator : "+"}))
                critDice.push(new Die({number : parseInt(damage.crit.split("d")[0]), faces : parseInt(damage.crit.split("d")[1]), options :  {flavor : `${i + 1}x Crit`, crit : i + 1, targets : damage.target.filter(t => t.crit == (i + 1))}}))
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

    async sendToChat() 
    {
        this.damages.forEach(async (damage, i) => {
            let type = game.pillars.config.damageTypes[damage.type]
            let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/damage.html", damage)

            let chatData = {
                flavor : damage.label ? `${damage.label} Damage - ${type}` : `${item.name} Damage ${damages.length > 1 ? i + 1 : ""} - ${type}`, 
                speaker : this.item.actor.speakerData(),
                content: html
            }
            return ChatMessage.create(chatData)
        })
    }
}