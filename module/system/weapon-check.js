import SkillCheck from "./skill-check.js"

export default class WeaponCheck extends SkillCheck
{
        constructor(data) {
            super(data)
            if (!data)
                return 
            this.data.checkData.itemId = data.itemId
        }   

        get item()
        {
            return this.actor.items.get(this.checkData.itemId)
        }

        get weapon() {
            return this.item
        }
}