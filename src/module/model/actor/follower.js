import { TieredActorDataModel } from "./components/base";
import { ComputedDetailsModel } from "./components/details";
import { FollowerLifeModel } from "./components/follower";

export class FollowerActorDataModel extends TieredActorDataModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.life = new foundry.data.fields.EmbeddedDataField(FollowerLifeModel)
        schema.details = new foundry.data.fields.EmbeddedDataField(ComputedDetailsModel)
        schema.subtype = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.StringField() })
        schema.loyalty = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() })
        schema.upkeep = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() })
        return schema

    }
    
    computeBase(items) {
        // Compute Details (size) before calling super class (which uses size)
        let details = this.details.compute(items);
        if (details.stride)
        this.stride.value = details.stride;
        if (Number.isNumeric(details.size))
            this.size.value = details.size;
        this.life.compute(items);
        super.computeBase(items)
    }
}
