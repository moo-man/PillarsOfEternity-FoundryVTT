import { ActorDefensesModel } from "./defenses";
import { ActorEnduranceModel } from "./endurance";
import { ActorHealthModel } from "./health";
import { PILLARS } from "../../../system/config";
import { SoakModel } from "./soak";


export class StandardActorDataModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
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
            wealth: new foundry.data.fields.SchemaField({ cp: new foundry.data.fields.NumberField() }),
            weight : new foundry.data.fields.NumberField(),
            notes: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.StringField()
            }),
            headquarters : new foundry.data.fields.EmbeddedDataField(HeadquarterResidencyModel)
        };
    } 


    getPreCreateData(data)
    {
        let preCreateData = {};
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
                "prototypeToken.name": data.name, // Set token name to actor name
                "prototypeToken.bar1": { attribute: "health" }, // Default Bar 1 to Wounds
                "prototypeToken.bar2": { attribute: "endurance" }, // Default Bar 2 to Advantage
                "prototypeToken.sight.range": 6,
            });
        }
  
        setProperty(preCreateData, "flags.pillars-of-eternity.autoEffects", true);
        return preCreateData;
    }

    computeBase(items, tooltips) 
    {
        this.defenses.compute(this.size.value, tooltips);
    }

    computeDerived(items, tooltips)
    {
        let equipped = {};
        equipped.armor = items.armor.find(i =>i.system.equipped.value);
        equipped.shield = items.shield.find(i => i.system.equipped.value);
        equipped.weapons = items.weapon.filter(i => i.system.equipped.value);

        this.applyEquippedBonuses(equipped, tooltips);
        this.health.compute(tooltips);
        this.endurance.compute(equipped, tooltips);
        this.run.value += this.stride.value * 2;
        tooltips?.run.value.push(game.i18n.format("PILLARS.Tooltip", { value: "Stride x 2", source: game.i18n.localize("PILLARS.TooltipBase") }));

    }

    applyEquippedBonuses({armor, shield, weapons}, tooltips)
    {
        this.defenses.applyEquippedBonuses({shield, weapons}, tooltips);
        this.soak.applyEquippedBonuses({armor, shield}, tooltips);

        if (armor) 
        {
            this.initiative.value += armor?.system.initiative.value;
            this.toughness.value += armor?.system.toughness.value;
            this.stride.value += armor?.system.stride.value;
            this.run.value += armor?.system.run.value;

            tooltips.initiative.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.initiative.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            tooltips.toughness.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.toughness.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            tooltips.stride.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.stride.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            tooltips.run.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.run.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
        }

    }
}

/**
 * Tiered Actors have a tier attribute that defines their Damage Increment and Toughness
 */
export class TieredActorDataModel extends StandardActorDataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.tier = new foundry.data.fields.SchemaField({ value: new foundry.data.fields.StringField() });
        return schema;
    } 

    computeBase(items, tooltips) 
    {
        super.computeBase(items, tooltips);
        let attributes = PILLARS.sizeAttributes[this.size.value.toString()][this.tier.value];
        if (attributes)
        {
            this.damageIncrement.value = attributes.damageIncrement;
            this.toughness.value = attributes.toughness;

            tooltips?.toughness.value.push(game.i18n.format("PILLARS.Tooltip", { value: this.toughness.value, source: game.i18n.localize("PILLARS.TooltipBase") }));
            tooltips?.damageIncrement.value.push(game.i18n.format("PILLARS.Tooltip", { value: this.damageIncrement.value, source: game.i18n.localize("PILLARS.TooltipBase") }));
        }
        this.defenses.applyTierBonus(this.tier.value, tooltips);
    }
}


export class BasicLifeModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            birthYear: new foundry.data.fields.NumberField(),
            phase: new foundry.data.fields.StringField(),
            age: new foundry.data.fields.NumberField()
        };
    }

    // Compute age and phase (using species) of the actor
    compute({species})
    {
        let age = game.pillars.time.current.year - this.birthYear;

        let currentPhase = "";
        if (species) 
        {
            for (let phase in species.phases) 
            {
                let range = species.phases[phase];
                if (age >= range[0] && age <= range[1]) 
                {
                    currentPhase = phase;
                    break;
                }
            }

            this.phase = currentPhase;
        }
        this.age = age;
    }
}

export class HeadquarterResidencyModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            id : new foundry.data.fields.StringField(),
            role : new foundry.data.fields.StringField(),
            accommodation :new foundry.data.fields.StringField()
        };
    }
}