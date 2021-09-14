import SkillTest from "./skill-test.js"

export default class PowerTest extends SkillTest
{
        constructor(data) {
            super(data)
            if (!data)
                return 
            this.data.testData.sourceId = data.sourceId
            this.data.testData.itemId = data.itemId

        }   


        async rollTest() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            await this.roll.evaluate({async:true})  
            this.powerSource.update({"data.used.value" : true, "data.pool.current" : this.powerSource.pool.current - this.power.cost.value})
            //this.data.result = this._computeResult()   
        }

        get item()
        {
            return this.actor.items.get(this.testData.itemId)
        }

        get power() {
            return this.item
        }

        get powerSource() {
            return this.actor.items.get(this.testData.sourceId)
        }
}