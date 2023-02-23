//@ts-nocheck

export default class DocumentTooltips
{
    constructor(data : object)
    {
        Object.assign(this, data);
    }
    
    _add(path : string, value : unknown)
    {
        const property = getProperty(this, path) as unknown[];
        if(property)
        {
            property.push(value);
        }
    }

    permeateDataModel(model) 
    {
        if (!model.tooltips)
        {
            Object.defineProperty(model, "tooltips", {value : this, enumerable : false});
        }
        for(const embedded in model)
        {
            if (model[embedded] instanceof foundry.abstract.DataModel)
            {
                this.permeateDataModel(model[embedded]);
            }
        }
    }

    toStrings() 
    {
        const strings = {};
        const flattened = foundry.utils.flattenObject(this);
        for(const path in flattened)
        {
            setProperty(strings, path, flattened[path].join(" + ").replaceAll("+ -", "- "));
        }

        return strings;
    }
}