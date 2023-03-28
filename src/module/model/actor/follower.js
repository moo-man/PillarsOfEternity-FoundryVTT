import { TieredActorDataModel } from "./components/standard";
import { ComputedDetailsModel } from "./components/details";
import { FollowerLifeModel } from "./components/follower";

export class FollowerActorDataModel extends TieredActorDataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.life = new foundry.data.fields.EmbeddedDataField(FollowerLifeModel);
        schema.details = new foundry.data.fields.EmbeddedDataField(ComputedDetailsModel);
        schema.subtype = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.StringField() });
        schema.loyalty = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() });
        schema.upkeep = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() });
        return schema;

    }
    
    computeBase(items) 
    {
        this.life.compute(items);
        super.computeBase(items);
    }
}
