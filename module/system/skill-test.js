import { Dice3D } from "/modules/dice-so-nice/Dice3D.js"

export default class SkillTest
{
        constructor(data) {
            if (!data)
                return 
            this.data = {
                testData : {
                    title : data.title,
                    modifier : data.modifier,
                    proxy : data.proxy,
                    assister : data.assister,
                    state : data.state || "normal",
                    skillId : data.skillId
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
    
        async rollTest() {
            let terms = []
            let assisterDie = this.assisterDie()
            terms.push(assisterDie)
            terms.push(this.testData.modifier)
            terms.push(this.skill.rank)
            let mainDie = this.testData.proxy ? this.proxyDie() : "2d10xp"

            if (this.testData.state == "adv")
                mainDie = `{${mainDie},1d20}kh`
            if (this.testData.state == "dis")
                mainDie = `{${mainDie},1d20}kl`
            terms.unshift(mainDie)

            this.roll = new Roll(terms.filter(i=>!!i).join(" + "));  
            await this.roll.evaluate({async:true})  
            if (assisterDie)
                this.setAssistDieAppearance()
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
                return "d8"
            if (skill.rank >= 10)
                return "d6"
            if (skill.rank >= 5)
                return "d4"
            return ""
        }

        proxyDie() {
            return SkillTest.rankToDie(this.skill)
        }

        assisterDie() {
            if (this.testData.assister)
                return SkillTest.rankToDie(this.assister.items.getName(this.skill.name))
            else return ""
        }

        setAssistDieAppearance()
        {            
            const appearanceSettings = Dice3D.APPEARANCE(this.assisterUser);
            let appearance = appearanceSettings.global;
            if(appearance.hasOwnProperty(this.assisterDie()))
                appearance = apperanceSettings[this.assisterDie()];

            this.roll.dice[1].options.appearance = this.assisterUser.getFlag("dice-so-nice", "appearance")?.global;
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