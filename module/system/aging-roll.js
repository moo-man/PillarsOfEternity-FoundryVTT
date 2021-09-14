export default class AgingRoll
{
        constructor(data) {
            if (!data)
                return 
            this.data = {
                testData : {
                    title : data.title,
                    modifier : data.modifier,
                    lifestyle : data.lifestyle,
                },
                context : {
                    speaker : data.speaker,
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
            let lifestyleMod = game.pillars.config.lifestyleModifier[this.testData.lifestyle]
            if (isNaN(this.testData.modifier))
                this.testData.modifier = 0

            this.roll = new Roll("1d12 + @modifier + @lifeStyleMod", {modifier : this.testData.modifier, lifestyleMod : lifestyleMod})
            await this.roll.evaluate({async:true})  
        }
       
        async sendToChat()
        {
            this.roll.toMessage({flavor: this.testData.title, speaker : ChatMessage.getSpeaker({actor : this.actor}), flags : {"pillars-of-eternity.rollData" : this.data}})
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

}