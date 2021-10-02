export default class AgingRoll
{
        constructor(data) {
            if (!data)
                return 
            this.data = {
                checkData : {
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
            let check = new game.pillars.rollClass[data.context.rollClass]()
            check.data = data;
            return data
        }
    
        async rollCheck() {
            let lifestyleMod = game.pillars.config.lifestyleModifier[this.checkData.lifestyle]
            if (isNaN(this.checkData.modifier))
                this.checkData.modifier = 0

            this.roll = new Roll("1d12 + @modifier + @lifeStyleMod", {modifier : this.checkData.modifier, lifestyleMod : lifestyleMod})
            await this.roll.evaluate({async:true})  
        }
       
        async sendToChat()
        {
            this.roll.toMessage({flavor: this.checkData.title, speaker : ChatMessage.getSpeaker({actor : this.actor}), flags : {"pillars-of-eternity.rollData" : this.data}})
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

}