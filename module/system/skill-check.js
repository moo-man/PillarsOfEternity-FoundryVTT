import DamageRoll from "../system/damage-roll.js";

export default class SkillCheck
{
        constructor(data) {
            if (!data)
                return 
            this.data = {
                checkData : {
                    title : data.title,
                    modifier : data.modifier,
                    steps : data.steps,
                    proxy : data.proxy,
                    assister : data.assister,
                    state : data.state || "normal",
                    skillId : data.skillId,
                    skillName : data.skillName
                },
                context : {
                    speaker : data.speaker,
                    targetSpeakers : data.targetSpeakers || [],
                    rollClass : this.constructor.name,
                    rollMode : data.rollMode,
                    messageId : "",
                },
                result : {}
            }
        }
    
        static recreate(data)
        {
            let check = new game.pillars.rollClass[data.context.rollClass]()
            check.data = data;
            check.roll = Roll.fromData(check.data.result)
            return check
        }
    
        getTerms() 
        {
            let terms = []

            if(this.checkData.state == "normal")
            {
                terms.push(new Die({number : 2, faces : 10, modifiers : ["xp"]}))
            }
            else 
            {
                let modifier = ""
                let flavor = ""
                if (this.checkData.state == "adv") 
                {
                    modifier = "kh"
                    flavor = "Advantage"
                }
                else if (this.checkData.state == "dis") 
                {
                    flavor = "Disadvantage"
                    modifier = "kl"
                }



                terms.push(new PoolTerm({terms : ["2d10xp", `1d20xp[${flavor}]`], modifiers : [modifier] }))
            }

            let assisterDie = this.assisterDie()
            
            if (assisterDie)
            {
                assisterDie.options = {flavor : this.assister.name}
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(assisterDie))
            }

            if (this.checkData.modifier)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms = terms.concat(Roll.parse(this.checkData.modifier))
            }

            if (this.checkData.steps)
            {
                if (this.checkData.steps > 0)
                    terms.push(new OperatorTerm({operator : "+"}))
                else if (this.checkData.steps < 0)
                    terms.push(new OperatorTerm({operator : "-"}))

                let stepsDie = game.pillars.utility.stepsToDice(this.checkData.steps)

                if (this.checkData.steps > 0)
                    stepsDie.options = {flavor : "Bonus Die"}
                else if (this.checkData.steps < 0)
                    stepsDie.options = {flavor : "Penalty Die"}

                terms.push(new Die(stepsDie))
            }

            if (!this.checkData.proxy && this.skill)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new NumericTerm({number : this.skill.rank}))
            }
            else if (this.checkData.proxy)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(this.proxyDie()))
            }

            return terms

        }
    
        async rollCheck() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            await this.roll.evaluate({async:true})  

            if (this.actor.type == "character")
                this.actor.use("skill", this.checkData.skillName)
            this.data.result = this.roll.toJSON()
            game.user.updateTokenTargets([])
        }
    
    
    
        _computeResult()
        {   
        }

    
        async sendToChat()
        {
            let tooltip = await this.roll.getTooltip()
            let content = await renderTemplate("systems/pillars-of-eternity/templates/chat/check.html", {check : this, tooltip})
            let chatData = {
                content,
                speaker : this.context.speaker,
                "flags.pillars-of-eternity.rollData" : this.data,
                type : CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll : this.roll.toJSON()
            }
            ChatMessage.applyRollMode(chatData, this.context.rollMode)
            if (!this.message)
            {
                return ChatMessage.create(chatData).then(message => {
                    message.update({"flags.pillars-of-eternity.rollData.context.messageId" : message.id})
                })
            }
            else 
            {
                return this.message.update(chatData)
            }
            
        }

        static rankToDie(skill) {
            if (skill.rank >= 15)
                return 8
            if (skill.rank >= 10)
                return 6
            if (skill.rank >= 5)
                return 4
            return ""
        }

        proxyDie() {
            return {number : 1, faces : SkillCheck.rankToDie(this.skill)}
        }

        assisterDie() {
            if (this.checkData.assister)
                return {number : 1, faces : SkillCheck.rankToDie(this.assister.items.getName(this.skill.name)), options : {appearance : this.assistDieAppearance()}}
            else return ""
        }

        assisterDieString() {
            if (this.checkData.assister)
                return `d${SkillCheck.rankToDie(this.assister.items.getName(this.skill.name))}`
            else return ""
        }

        assistDieAppearance()
        {            
            return game.dice3d.DiceFactory.getAppearanceForDice(game.dice3d.constructor.APPEARANCE(this.assisterUser), this.assisterDieString())
        }

        async rollDamage() {

            let damages = await new Promise((resolve, reject) => {
                new game.pillars.apps.DamageDialog(this.item, this, this.targets).render(true, {resolve, reject})
            })

            let roll = new DamageRoll(damages, this);
            await roll.rollDice()
            game.user.updateTokenTargets([])
        }
        
        updateMessageFlags()
        {
            if (this.message)
                this.message.update({"flags.pillars-of-eternity.rollData" : this.data})
        }

        addTargets(targets) {
            this.context.targetSpeakers = this.context.targetSpeakers.concat(targets.map(t => t.actor.speakerData(t)))
            game.user.updateTokenTargets([])
            this.sendToChat()
        }


        get checkData() { return this.data.checkData }
        get context() { return this.data.context}
        get result() { return this.data.result}
    
        get actor() {
            return game.pillars.utility.getSpeaker(this.context.speaker)
        }
    
        get assister() {
            return game.actors.get(this.checkData.assister)
        }

        get assisterUser() {
            let actor = game.actors.get(this.checkData.assister)
            if (actor)
                return game.users.find(i => i.character?.id == actor.id)
        }

        get target() {
            return game.pillars.utility.getSpeaker(this.context.targetSpeakers[0])
        }

        get targets() {
            return this.context.targetSpeakers.map(speaker => game.scenes.get(speaker.scene)?.tokens.get(speaker.token))
        }

        get effects () {
            let effects = this.item?.base?.effects || []
            let effectObjects = []
            effects.map(e => {
                let effectObject 
                if (this.item?.effects)
                    effectObject = this.item.effects.get(e.value)
                if (!effectObject)
                    effectObject = {data : CONFIG.statusEffects.find(i => i.id == e.value), id : e.value}
                if (effectObject)
                    effectObjects.push(effectObject)
            })
            return effectObjects
        }

        get item() {
            return this.skill
        }

        get skill() {
            return this.actor.items.get(this.checkData.skillId)
        }

        get doesDamage() {
            return this.item?.damage?.value?.length  > 0
        }

        get hasEffects() {
            return this.effects.length
        }

        get tags() {
            return [this.skill.Category]
        }

        get message() {
            return game.messages.get(this.context.messageId)
        }

        get requiresRoll() {
            return true
        }
}
