import { getGame } from "../system/utility"
import { WeaponCheckDataFlattened, WeaponCheckData } from "../../types/checks"
import SkillCheck from "./skill-check"
import { WeaponSpecial } from "../../types/items"

export default class WeaponCheck extends SkillCheck
{
    data? : WeaponCheckData

        constructor(data? : WeaponCheckDataFlattened) {
            super(data)
            if (!data)
                return 

            this.data!.checkData.add = data.add
            this.data!.checkData.itemId = data.itemId
        }   

        get item()
        {
            let item =  this.actor.items.get(this.checkData?.itemId || "")
            if (item)
                return item
            else throw new Error(getGame().i18n.localize("PILLARS.ErrorCannotFindCheckItem"))
        }

        get weapon() {
            return this.item
        }

        get tags () {
            return [this.weapon?.Category, this.weapon?.system.skill?.value]
        }

        get weaponTags() {
            return this.weapon?.Specials?.filter((i : string) => !i?.includes("text-decoration"))
        }

        get addedProperties()
        {
            return this.data?.checkData.add
        }

        get effects () {
            let effects = super.effects;
            if (this.addedProperties?.effects?.length)
                effects = effects.concat(this.addedProperties?.effects || [])
            return effects
        }

        get checkData()  { return this.data?.checkData }

}