import SkillCheck from "./skill-check.js"

export default class PowerCheck extends SkillCheck
{
        constructor(data) {
            super(data)
            if (!data)
                return 
            this.data.checkData.sourceId = data.sourceId
            this.data.checkData.itemId = data.itemId

        }   


        async rollCheck() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            if (this.requiresRoll)
                await this.roll.evaluate({async:true})  
            this.powerSource.update({"data.used.value" : true, "data.pool.current" : this.powerSource.pool.current - this.power.level.cost})
            this.data.result = this.roll.toJSON()
            game.user.updateTokenTargets([])
        }

        get item()
        {
            return this.actor.items.get(this.checkData.itemId)
        }

        get power() {
            return this.item
        }

        get tags () {
            return [game.pillars.config.powerSources[this.item.source.value]]
        }

        get requiresRoll() {
            return this.power.roll.value
        }

        get powerSource() {
            return this.actor.items.get(this.checkData.sourceId)
        }
}