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

        get tags () {
            return [this.weapon.Category, this.weapon.skill.value]
        }

        get weaponTags() {
            return this.weapon.Specials.filter(i => !i.includes("text-decoration"))
        }
}