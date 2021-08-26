import SkillTest from "./skill-test.js"

export default class WeaponTest extends SkillTest
{
        constructor(data) {
            super(data)
            if (!data)
                return 
            this.data.testData.itemId = data.itemId
        }   

        get item()
        {
            return this.actor.items.get(this.testData.itemId)
        }

        get weapon() {
            return this.item
        }
}