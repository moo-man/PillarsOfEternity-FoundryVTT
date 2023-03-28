import { SingletonItemModel } from "../../shared/singleton-item";

export class BasicDetailsModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            culture: new foundry.data.fields.EmbeddedDataField(SingletonItemModel),
            species: new foundry.data.fields.EmbeddedDataField(SingletonItemModel),
            stock: new foundry.data.fields.EmbeddedDataField(SingletonItemModel),
            godlike: new foundry.data.fields.EmbeddedDataField(SingletonItemModel)
        };
    }

    compute(items)
    {
        this.species.getDocument(items.species);
        this.stock.getDocument(items.stock);
        this.culture.getDocument(items.culture);
        this.godlike.getDocument(items.godlike);
    }

}


export class ComputedDetailsModel extends BasicDetailsModel 
{

    // trying to figure out how to get these items in a clean fashion
    compute(items, tooltips)
    {
        super.compute(items);
        let species = this.species.document;
        if (this.species.document)
        {
            tooltips?.stride.value.push(`${species.system.stride.value} (${species.name})`);
        }
        
        return {stride : species?.system.stride.value, size : Number(species?.system.size.value) || 0};
    }

}