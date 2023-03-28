import { ActorDefensesModel } from "./defenses";
import { ActorEnduranceModel } from "./endurance";
import { ActorHealthModel } from "./health";
import { PILLARS } from "../../../system/config";
import { SoakModel } from "./soak";
import { BaseActorDataModel } from "./base";


export class StandardActorDataModel extends BaseActorDataModel 
{
    static preventItemTypes = ["space", "defense"];
    static singletonItemTypes = ["species", "godlike", "stock", "culture"];
    static singletonPaths = {"species": "system.details.species", "godlike" : "system.details.godlike", "stock" : "system.details.stock", "culture" : "system.details.culture"};

    get tooltipModel() 
    {
        return {
            defenses: {
                deflection: [],
                reflex: [],
                fortitude: [],
                will: [],
            },
            health: {
                max: [],
                threshold: {
                    bloodied: [],
                    incap: [],
                },
            },
            endurance: {
                max: [],
                threshold: {
                    winded: [],
                },
            },
            initiative: {
                value: [],
            },
            soak: {
                base: [],
                shield: [],
                physical: [],
                burn: [],
                freeze: [],
                raw: [],
                corrode: [],
                shock: [],
            },
            stride: {
                value: [],
            },
            run: {
                value: [],
            },
            toughness: {
                value: [],
            },
            damageIncrement: {
                value: [],
            },
        };
    }
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
                value: new foundry.data.fields.StringField(),
                gm: new foundry.data.fields.StringField()
            }),
            headquarters : new foundry.data.fields.EmbeddedDataField(HeadquarterResidencyModel)
        };
    } 


    async getPreCreateData(data)
    {
        let preCreateData = {};
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
                "prototypeToken.bar1": { attribute: "health" }, // Default Bar 1 to Wounds
                "prototypeToken.bar2": { attribute: "endurance" }, // Default Bar 2 to Advantage
                "prototypeToken.sight.range": 6,
            });
        }
  
        setProperty(preCreateData, "flags.pillars-of-eternity.autoEffects", true);
        return preCreateData;
    }


    
    async onUpdate(data, options, user)
    {
        // Only allow user who made the modification to apply effects, otherwise multiple effects are applied
        if (game.user?.id == user) 
        {
            // If health or endurance has been modified
            if (hasProperty(data, "system.health") || hasProperty(data, "system.endurance")) 
            {
                // Apply automatic effects only if option is enabled
                if (this.getFlag("pillars-of-eternity", "autoEffects")) 
                {
                    // Bloodied
                    if (system.health.bloodied) 
                    {
                        const existing = this.effects.find((e) => e.conditionId == "bloodied");
                        if (!existing) 
                        {
                            const existing = this.hasCondition("bloodied");
                            if (!existing) {await this.addCondition("bloodied");}
                        }
                    }
                    else 
                    {
                        await this.removeCondition("bloodied");
                    }

                    // Winded
                    if (system.endurance.winded) 
                    {
                        const existing = this.hasCondition("winded");
                        if (!existing) {await this.addCondition("winded");}
                    }
                    else 
                    {
                        await this.removeCondition("winded");
                    }

                    // Incapacitated (From health or endurance)
                    if (system.health.incap || system.endurance.incap) 
                    {
                        if (!this.hasCondition("incapacitated")) {await this.addCondition("incapacitated");}
                        if (!this.hasCondition("prone")) {await this.addCondition("prone");}
                    }
                    else if (this.hasCondition("incapacitated")) {await this.removeCondition("incapacitated");}

                    // Dead
                    if (system.health.dead) 
                    {
                        await this.addCondition("dead");
                    }
                    else if (this.hasCondition("dead")) {await this.removeCondition("dead");}
                    if (hasProperty(data, "system.health.wounds") && system.health.value > system.health.max) 
                    {
                        this.update({ "system.health.value": system.health.max });
                    }
                }
            }
        }
    }

    computeBase(items) 
    {
        if (this.details)
        {

            let details = this.details.compute(items);
            if (details.stride)
            {
                this.stride.value = details.stride;
            }
            if (Number.isNumeric(details.size))
            {
                this.size.value = details.size;
            }
        }
        this.defenses.compute(this.size.value);
    }

    computeDerived(items)
    {
        let equipped = {};
        equipped.armor = items.armor.find(i =>i.system.equipped.value);
        equipped.shield = items.shield.find(i => i.system.equipped.value);
        equipped.weapons = items.weapon.filter(i => i.system.equipped.value);

        this.applyEquippedBonuses(equipped);
        this.health.compute();
        this.endurance.compute(equipped);
        this.run.value += this.stride.value * 2;
        this.tooltips?.run.value.push(game.i18n.format("PILLARS.Tooltip", { value: "Stride x 2", source: game.i18n.localize("PILLARS.TooltipBase") }));

    }

    applyEquippedBonuses({armor, shield, weapons})
    {
        this.defenses.applyEquippedBonuses({shield, weapons});
        this.soak.applyEquippedBonuses({armor, shield});

        if (armor) 
        {
            this.initiative.value += armor?.system.initiative.value;
            this.toughness.value += armor?.system.toughness.value;
            this.stride.value += armor?.system.stride.value;
            this.run.value += armor?.system.run.value;

            this.tooltips?.initiative.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.initiative.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            this.tooltips?.toughness.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.toughness.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            this.tooltips?.stride.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.stride.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
            this.tooltips?.run.value.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.run.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
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

    computeBase(items) 
    {
        super.computeBase(items);
        let attributes = PILLARS.sizeAttributes[this.size.value.toString()][this.tier.value];
        if (attributes)
        {
            this.damageIncrement.value = attributes.damageIncrement;
            this.toughness.value = attributes.toughness;

            this.tooltips?.toughness.value.push(game.i18n.format("PILLARS.Tooltip", { value: this.toughness.value, source: game.i18n.localize("PILLARS.TooltipBase") }));
            this.tooltips?.damageIncrement.value.push(game.i18n.format("PILLARS.Tooltip", { value: this.damageIncrement.value, source: game.i18n.localize("PILLARS.TooltipBase") }));
        }
        this.defenses.applyTierBonus(this.tier.value);
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