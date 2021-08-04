export default class ItemSpecials extends FormApplication 
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "item-specials",
            template : "systems/pillars-of-eternity/templates/apps/item-specials.html",
            height : "auto",
            width : "auto",
            title : "Item Specials"
            
        })
    }

    getData() {
        let data = super.getData();
        data.specials = duplicate(game.pillars.config.itemSpecials)
        let itemSpecials = this.object.specials
        for (let special in data.specials)
        {
            if (itemSpecials[special])
            {
                data.specials[special].itemHas = true;
                if (itemSpecials[special].value)
                    data.specials[special].itemValue = itemSpecials[special].value
            }
        }
        return data;
    }


    _updateObject(event, formData)
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

    activateListeners(html) {
        super.activateListeners(html);


    }
}