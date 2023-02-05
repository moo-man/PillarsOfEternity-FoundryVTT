import { TieredActorDataModel } from "./components/base";
import { CharacterDetailsModel, CharacterLifeModel } from "./components/character";

export class CharacterActorDataModel extends TieredActorDataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.life = new foundry.data.fields.EmbeddedDataField(CharacterLifeModel);
        schema.details = new foundry.data.fields.EmbeddedDataField(CharacterDetailsModel);
        schema.connections = new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField({ 
                name : new foundry.data.fields.StringField()
            }));
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

    getPreCreateData(data)
    {
        let preCreateData = super.getPreCreateData(data);
        mergeObject(preCreateData, { prototypeToken : {
            sight : {
                enabled : true
            },
            actorLink : true
        }}, {overwrite : true});

        return preCreateData;
    }

    computeBase(items, tooltips) 
    {
        // Compute Details (size) before calling super class (which uses size)
        let details = this.details.compute(items, tooltips);
        if (details.stride)
        {this.stride.value = details.stride;}
        if (Number.isNumeric(details.size))
        {this.size.value = details.size;}
        this.life.compute(items, tooltips);
        super.computeBase(items, tooltips);
    }
}