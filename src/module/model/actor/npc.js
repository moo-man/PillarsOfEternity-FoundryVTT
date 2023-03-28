import { TieredActorDataModel } from "./components/base";
import { CharacterDetailsModel, CharacterLifeModel } from "./components/character";
import { BasicDetailsModel, ComputedDetailsModel } from "./components/details";
import { BasicLifeModel } from "./components/standard";

export class NPCActorDataModel extends TieredActorDataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.details = new foundry.data.fields.EmbeddedDataField(ComputedDetailsModel);
        return schema;

    }
}