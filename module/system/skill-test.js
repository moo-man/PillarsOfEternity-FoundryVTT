export default class SkillTest
{
        constructor(data) {
            if (!data)
                return 
            this.data = {
                testData : {
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
            let test = new game.pillars.rollClass[data.context.rollClass]()
            test.data = data;
            return data
        }
    
        getTerms() 
        {
            let terms = []

            if(this.testData.state == "normal")
            {
                terms.push(new Die({number : 2, faces : 10, modifiers : ["xp"]}))
            }
            else 
            {
                let modifier = ""
                if (this.testData.state == "adv") modifier = "kh"
                else if (this.testData.state == "dis") modifier = "kl"

                terms.push(new PoolTerm({terms : ["2d10xp", "1d20"], modifiers : [modifier] }))
            }

            let assisterDie = this.assisterDie()
            
            if (assisterDie)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(assisterDie))
            }

            if (this.testData.modifier)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms = terms.concat(Roll.parse(this.testData.modifier))
            }

            if (this.testData.steps)
            {
                if (this.testData.steps > 0)
                    terms.push(new OperatorTerm({operator : "+"}))
                else if (this.testData.steps < 0)
                    terms.push(new OperatorTerm({operator : "-"}))

                terms.push(new Die(game.pillars.utility.stepsToDice(this.testData.steps)))
            }

            if (!this.testData.proxy && this.skill)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new NumericTerm({number : this.skill.rank}))
            }
            else if (this.testData.proxy)
            {
                terms.push(new OperatorTerm({operator : "+"}))
                terms.push(new Die(this.proxyDie()))
            }

            return terms

        }
    
        async rollTest() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            await this.roll.evaluate({async:true})  

            if (this.actor.type == "character")
                this.actor.use("skill", this.testData.skillName)
            //this.data.result = this._computeResult()   
        }
    
    
    
        _computeResult()
        {
            // let result = this._applyFocus();
            // return result
        }

    
        async sendToChat()
        {
            // const html = await renderTemplate("systems/pillars-of-eternity/template/chat/roll.html", this);
            // let chatData = {
            //     user: game.user.id,
            //     type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            //     roll: this.roll,
            //     rollMode: game.settings.get("core", "rollMode"),
            //     content: html,
            //     flags: {
            //         "pillars-of-eternity.rollData" : this.data
            //     }
            // };
            // if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            //     chatData.whisper = ChatMessage.getWhisperRecipients("GM");
            // } else if (chatData.rollMode === "selfroll") {
            //     chatData.whisper = [game.user];
            // }
            // ChatMessage.create(chatData);

            this.roll.toMessage({flavor: this.testData.title, speaker : ChatMessage.getSpeaker({actor : this.actor}), flags : {"pillars-of-eternity.rollData" : this.data}})
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
            return {number : 1, faces : SkillTest.rankToDie(this.skill)}
        }

        assisterDie() {
            if (this.testData.assister)
                return {number : 1, faces : SkillTest.rankToDie(this.assister.items.getName(this.skill.name)), options : {appearance : this.assistDieAppearance()}}
            else return ""
        }

        assisterDieString() {
            if (this.testData.assister)
                return `d${SkillTest.rankToDie(this.assister.items.getName(this.skill.name))}`
            else return ""
        }

        assistDieAppearance()
        {            
            return game.dice3d.DiceFactory.getAppearanceForDice(game.dice3d.constructor.APPEARANCE(this.assisterUser), this.assisterDieString())
        }
        
    
        get testData() { return this.data.testData }
        get context() { return this.data.context}
        get result() { return this.data.result}
    
        get actor() {
            return game.pillars.utility.getSpeaker(this.context.speaker)
        }
    
        get assister() {
            return game.actors.get(this.testData.assister)
        }

        get assisterUser() {
            let actor = game.actors.get(this.testData.assister)
            if (actor)
                return game.users.find(i => i.character?.id == actor.id)
        }

        get target() {
            return game.pillars.utility.getSpeaker(this.context.targetSpeaker)
        }

        get skill() {
            return this.actor.items.get(this.testData.skillId)
        }
}