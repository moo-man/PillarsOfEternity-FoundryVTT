import { getGame } from "../system/utility";
import { WeaponSpecialData } from "../../types/items";
import { PillarsItem } from "../item/item-pillars";

type ItemSpecialsFormData = Record<string, WeaponSpecialData & {itemHas : boolean, itemValue : string}>

export default class ItemSpecials extends FormApplication<FormApplicationOptions, {specials : ItemSpecialsFormData}, PillarsItem>
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "item-specials",
            template : "systems/pillars-of-eternity/templates/apps/item-specials.html",
            height : "auto",
            width : "auto",
            title : getGame().i18n.localize("PILLARS.ItemSpecials")
            
        })
    }

    async getData() {
        let data = await super.getData();
        data.specials = <ItemSpecialsFormData>foundry.utils.deepClone(this.object.specialList)
        let itemSpecials = this.object.specials
        for (let special in data.specials)
        {
            if (itemSpecials[special])
            {
                data.specials[special as keyof typeof data.specials]!.itemHas = true;
                if (itemSpecials[special]?.value)
                    data.specials[special]!.itemValue = itemSpecials[special]!.value || ""
            }
        }
        return data;
    }


    _updateObject(event : Event, formData : Record<string, unknown>)
    {
        let obj = expandObject(formData)
        for(let special in obj)
        {
            if (obj[special].name)
            {
                obj[special].name = special                
                if (!obj[special].value)
                    obj[special].value = null
            }
            else 
                delete obj[special]

        }
        return this.object.update({"data.special.value" : Object.values(obj)})
    }

}