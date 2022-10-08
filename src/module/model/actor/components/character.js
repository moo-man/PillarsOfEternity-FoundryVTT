import { PILLARS } from "../../../system/config";
import { BasicLifeModel } from "./base";
import { ComputedDetailsModel } from "./details";

export class CharacterLifeModel extends BasicLifeModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.apparentAge = new foundry.data.fields.NumberField();
        schema.agingPoints = new foundry.data.fields.NumberField();
        schema.march = new foundry.data.fields.NumberField();
        schema.childhood = new foundry.data.fields.StringField();
        return schema
    }
    
    compute() 
    {
        let thresholds = PILLARS.agePointsDeathRank;
        for (let pointThreshold in thresholds) {
          if (this.agingPoints < parseInt(pointThreshold)) {
            this.march = thresholds[parseInt(pointThreshold)];
            break;
          }
        }
        this.march -= 1;
    }

}


export class CharacterDetailsModel extends ComputedDetailsModel {
    static defineSchema() {
        let schema = super.defineSchema()
        schema.cause = new foundry.data.fields.StringField()
        schema.call = new foundry.data.fields.StringField()
        schema.goal = new foundry.data.fields.StringField()
        schema.relationships = new foundry.data.fields.StringField()
        return schema
    }
}