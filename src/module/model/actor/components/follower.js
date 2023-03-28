import { BasicLifeModel } from "./standard";

export class FollowerLifeModel extends BasicLifeModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.startYear = new foundry.data.fields.NumberField();
        return schema;
    }
}
