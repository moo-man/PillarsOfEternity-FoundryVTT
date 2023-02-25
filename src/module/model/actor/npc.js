import { TieredActorDataModel } from "./components/base";
import { CharacterDetailsModel, CharacterLifeModel } from "./components/character";

export class CharacterActorDataModel extends TieredActorDataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.life = new foundry.data.fields.EmbeddedDataField(CharacterLifeModel);
        schema.details = new foundry.data.fields.EmbeddedDataField(CharacterDetailsModel);
        schema.seasons = new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField({
                year: new foundry.data.fields.NumberField(),
                spring: new foundry.data.fields.StringField(),
                summer: new foundry.data.fields.StringField(),
                autumn: new foundry.data.fields.StringField(),
                winter: new foundry.data.fields.StringField(),
                aging: new foundry.data.fields.StringField()
            }));
        return schema;

    }

    computeBase(items) 
    {
        // Compute Details (size) before calling super class (which uses size)
        this.details.compute(items);
        this.life.compute(items);
        super.computeBase(items);
    }
}