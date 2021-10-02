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
                    targetSpeaker : data.targetSpeaker,
                    rollClass : this.constructor.name
                },
                result : {}
            }
        }
    
        static recreate(data)
        {
            let check = new game.pillars.rollClass[data.context.rollClass]()
            check.data = data;
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
                if (this.checkData.state == "adv") modifier = "kh"
                else if (this.checkData.state == "dis") modifier = "kl"

                terms.push(new PoolTerm({terms : ["2d10xp", "1d20"], modifiers : [modifier] }))
            }

            let assisterDie = this.assisterDie()
            
            if (assisterDie)
            {
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

                terms.push(new Die(game.pillars.utility.stepsToDice(this.checkData.steps)))
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
            // let result = this._applyFocus();
            // return result
        }

    
        async sendToChat()
        {
            this.roll.toMessage({flavor: this.checkData.title, speaker : ChatMessage.getSpeaker({actor : this.actor}), flags : {"pillars-of-eternity.rollData" : this.data}})
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
            return game.pillars.utility.getSpeaker(this.context.targetSpeaker)
        }

        get skill() {
            return this.actor.items.get(this.checkData.skillId)
        }
}