import { ActorDefensesModel } from "./defenses"
import { ActorEnduranceModel } from "./endurance"
import { ActorHealthModel } from "./health"
import { PILLARS } from '../../../system/config';
import { SoakModel } from "./soak";


export class StandardActorDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            defenses: new foundry.data.fields.EmbeddedDataField(ActorDefensesModel),
            health: new foundry.data.fields.EmbeddedDataField(ActorHealthModel),
            endurance: new foundry.data.fields.EmbeddedDataField(ActorEnduranceModel),
            soak: new foundry.data.fields.EmbeddedDataField(SoakModel),
            toughness: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            damageIncrement: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            size: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            stride: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            run: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            initiative: new foundry.data.fields.SchemaField({ value: new foundry.data.fields.NumberField() }),
            weight : new foundry.data.fields.NumberField(),
            notes: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.StringField()
            })
        }
    } 

    computeBase(items) {
        this.defenses.compute(this.size.value)
    }

    computeDerived(items)
    {
        let equipped = {}
        equipped.armor = items.armor.find(i =>i.system.equipped.value)
        equipped.shield = items.shield.find(i => i.system.equipped.value)
        equipped.weapons = items.weapon.filter(i => i.system.equipped.value)

        this.applyEquippedBonuses(equipped)
        this.health.compute();
        this.endurance.compute(equipped);
        this.run.value += this.stride.value * 2;
    }

    applyEquippedBonuses({armor, shield, weapons})
    {
        this.defenses.applyEquippedBonuses({shield, weapons})
        this.soak.applyEquippedBonuses({armor, shield})

        if (armor) {
            this.initiative.value += armor?.system.initiative.value;
            this.toughness.value += armor?.system.toughness.value;
            this.stride.value += armor?.system.stride.value;
            this.run.value += armor?.system.run.value;
        }

    }
}

/**
 * Tiered Actors have a tier attribute that defines their Damage Increment and Toughness
 */
export class TieredActorDataModel extends StandardActorDataModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.tier = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.StringField() })
        return schema
    } 

    computeBase(items) {
        super.computeBase(items);
        let attributes = PILLARS.sizeAttributes[this.size.value.toString()][this.tier.value];
        if (attributes)
        {
            this.damageIncrement.value = attributes.damageIncrement;
            this.toughness.value = attributes.toughness;
        }
        this.defenses.applyTierBonus(this.tier.value)
    }
}


export class BasicLifeModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            birthYear: new foundry.data.fields.NumberField(),
            phase: new foundry.data.fields.StringField(),
            age: new foundry.data.fields.NumberField()
        }
    }

    // Compute age and phase (using species) of the actor
    compute({species})
    {
      let age = game.settings.get('pillars-of-eternity', 'season').year - this.birthYear;

      let currentPhase = '';
      if (species) {
            for (let phase in species.phases) {
              let range = species.phases[phase];
              if (age >= range[0] && age <= range[1]) {
                currentPhase = phase;
                break;
              }
            }

            this.phase = currentPhase;
        }
        this.age = age;
    }
}