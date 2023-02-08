import RollDialog from "../apps/roll-dialog";
import PillarsActiveEffect from "./effect-pillars";
import AgingDialog from "../apps/aging-dialog";
import AgingRoll from "../system/rolls/aging-roll";
import { PillarsItem } from "./item-pillars";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { PreparedPillarsNonHeadquartersActorData } from "../../global";
import { Defense, isUsable, ItemDialogData, ItemType, LifePhase, BookYearData, Tier } from "../../types/common";
import { PILLARS } from "../system/config";
import {
    AssisterData,
    CheckDataFlattened,
    CheckOptions,
    CheckDialogData,
    SkillDialogData,
    WeaponCheckDataFlattened,
    WeaponDialogData,
    PowerCheckDataFlattened,
    AgingCheckDataFlattened,
    PowerDialogData,
    DamageOptions,
} from "../../types/checks.js";
import { getGame } from "../system/utility";
import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { PillarsEffectChangeDataProperties } from "../../types/effects";
import ItemDialog from "../apps/item-dialog";
import BookOfSeasons from "../apps/book-of-seasons";
import { ItemDataConstructorData, ItemDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import SkillCheck from "../system/rolls/skill-check";
import WeaponCheck from "../system/rolls/weapon-check";
import PowerCheck from "../system/rolls/power-check";

declare global {
  interface DocumentClassConfig {
    Actor: typeof PillarsActor;
  }
}

/**
 * Extend FVTT Actor class for Pillars functionality
 * @extends {Actor}
 */
export class PillarsActor extends Actor 
{
    // system : DeepPartial<PreparedPillarsCharacterData & PreparedPillarsFollowerData & PreparedPillarsHeadquartersData & {
    //   computeBase : any,
    //   computeDerived : any
    // }> = {}

    system: any;
    prototypeToken: any;
    _source: any;

    itemCategories: Record<keyof typeof ItemType, PillarsItem[]> | undefined;

    async _preCreate(data: ActorDataConstructorData, options: DocumentModificationOptions, user: User) 
    {
        await super._preCreate(data, options, user);
        this.updateSource(this.system.getPreCreateData(data));
    }

    async _preUpdate(data: ActorDataConstructorData, options: DocumentModificationOptions, user: User) 
    {
        await super._preUpdate(data, options, user);
        this.handleScrollingText(data);
        if (this.system.handlePreUpdate) 
        {
            this.system.handlePreUpdate(data);
        }
    }

    async _onUpdate(data: Record<string, unknown>, options: DocumentModificationOptions, userId: string) 
    {
        await super._onUpdate(data, options, userId);
        if (this.data.type == "headquarters") {return;}

        // Only allow user who made the modification to apply effects, otherwise multiple effects are applied
        if (getGame().user?.id == userId) 
        {
            // If health or endurance has been modified
            if (hasProperty(data, "system.health") || hasProperty(data, "system.endurance")) 
            {
                // Apply automatic effects only if option is enabled
                if (this.getFlag("pillars-of-eternity", "autoEffects")) 
                {
                    // Bloodied
                    if (this.system.health.bloodied) 
                    {
                        const existing = this.effects.find((e) => e.getFlag("core", "statusId") == "bloodied");
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
                    if (this.system.endurance.winded) 
                    {
                        const existing = this.hasCondition("winded");
                        if (!existing) {await this.addCondition("winded");}
                    }
                    else 
                    {
                        await this.removeCondition("winded");
                    }

                    // Incapacitated (From health or endurance)
                    if (this.system.health.incap || this.system.endurance.incap) 
                    {
                        if (!this.hasCondition("incapacitated")) {await this.addCondition("incapacitated");}
                        if (!this.hasCondition("prone")) {await this.addCondition("prone");}
                    }
                    else if (this.hasCondition("incapacitated")) {await this.removeCondition("incapacitated");}

                    // Dead
                    if (this.system.health.dead) 
                    {
                        await this.addCondition("dead");
                    }
                    else if (this.hasCondition("dead")) {await this.removeCondition("dead");}
                    if (hasProperty(data, "system.health.wounds") && this.system.health.value > this.system.health.max) 
                    {
                        this.update({ "system.health.value": this.system.health.max });
                    }
                }
            }
        }
    }


    prepareBaseData() 
    {

        // Initialize tooltips
        this.data.flags.tooltips = {
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

        this.system.computeBase(this.itemCategories, this.data.flags.tooltips);
    }

    prepareDerivedData() 
    {
        this.system.computeDerived(this.itemCategories, this.data.flags.tooltips);
    }

    //#region Data Preparation
    prepareData() 
    {
        try 
        {
            this.itemCategories = this.itemTypes;
            for (const type in this.itemCategories)
            {
                this.itemCategories[<ItemType>type] = this.itemCategories[<ItemType>type]!.sort((a, b) => (a.data.sort > b.data.sort ? 1 : -1));
            } 
                
            super.prepareData();
            this.prepareItems();
            this.prepareEffectTooltips();
        }
        catch (e) 
        {
            console.error(e);
        }
    }

    prepareItems() 
    {
        if (this.data.type == "headquarters") {return;}

        let weight = 0;
        for (const i of this.items) 
        {
            i.prepareOwnedData();
            if (i.system.weight) {weight += i.system.weight.value;}
        }
        this.system.weight = weight;
    }


    // Parse active effect keys and add their values to tooltips
    prepareEffectTooltips() 
    {
        if (this.data.type == "headquarters") {return;}
        const tooltips = this.data.flags.tooltips;
        const tooltipKeys = Object.keys(flattenObject(this.data.flags.tooltips));
        for (const effect of this.effects.filter((e) => !e.data.disabled)) 
        {
            for (const change of effect.data.changes) 
            {
                const foundTooltipKey = tooltipKeys.find((key) => change.key.includes(key));
                if (foundTooltipKey) 
                {
                    const tooltip = getProperty(tooltips, foundTooltipKey);
                    tooltip.push(change.value + ` (${effect.data.label})`);
                }
            }
        }
    }

    //#endregion

    //#region Roll Setup

    async setupSkillCheck(skill: PillarsItem | string, options: CheckOptions = {}) 
    {
        const game = getGame();
        let skillItem: PillarsItem | undefined;
        if (typeof skill == "string") 
        {
            skillItem = this.items.getName(skill);
            if (!skillItem) {skillItem = getGame().items!.getName(skill);}
        }
        else if (skill instanceof PillarsItem) 
        {
            skillItem = skill;
            skill = skillItem.name as string;
        }
        else {throw new Error(game.i18n.localize("PILLARS.ErrorInvalidArgument"));}

        const data = this.getSkillDialogData("skill", skillItem!, { name: skill });
        const checkData: CheckDataFlattened = await RollDialog.create(data);
        checkData.skillName = skill;
        checkData.title = data.title;
        checkData.skillId = skillItem?.id || "";
        checkData.speaker = this.speakerData();
        checkData.targetSpeakers = this.targetSpeakerData();
        return new SkillCheck(checkData);
    }

    async setupWeaponCheck(weapon: PillarsItem | string, options: CheckOptions = {}) 
    {
        const game = getGame();
        let weaponItem: PillarsItem | undefined;
        if (typeof weapon == "string") {weaponItem = this.items.get(weapon);}
        else {weaponItem = weapon;}

        if (!weaponItem) {throw ui!.notifications!.error(game.i18n.localize("PILLARS.ErrorNoWeaponFound"));}

        if (!weaponItem?.system.skill?.value) {throw ui!.notifications!.error(game.i18n.localize("PILLARS.ErrorNoSkillAssigned"));}

        const data = this.getWeaponDialogData("weapon", weaponItem);
        const checkData: WeaponCheckDataFlattened = <WeaponCheckDataFlattened>await RollDialog.create(data);
        checkData.add = options.add || {}; // Properties added via options (right now only from equipped weapon powers)
        checkData.title = data.title;
        checkData.skillId = weaponItem.Skill?.id || "";
        checkData.skillName = weaponItem.system.skill.value;
        checkData.itemId = weaponItem.id!;
        checkData.speaker = this.speakerData();
        checkData.targetSpeakers = this.targetSpeakerData();
        return new WeaponCheck(checkData);
    }

    async setupPowerCheck(power: PillarsItem | string, options = {}) 
    {
        const game = getGame();
        let powerItem: PillarsItem | undefined;
        if (typeof power == "string") {powerItem = this.items.get(power);}
        else if (power instanceof PillarsItem) {powerItem = power;}
        else {throw ui!.notifications!.error(game.i18n.localize("PILLARS.ErrorNoPowerFound"));}

        this._powerUsageValidation(powerItem!);

        const data = this.getPowerDialogData("power", powerItem!);
        let checkData: PowerCheckDataFlattened = <PowerCheckDataFlattened>{};
        if (powerItem!.system.roll?.value) {checkData = <PowerCheckDataFlattened>await RollDialog.create(data);}

        checkData.title = data.title;
        checkData.sourceId = powerItem!.SourceItem?.id || "";
        checkData.itemId = powerItem!.id || "";
        checkData.speaker = this.speakerData();
        checkData.targetSpeakers = this.targetSpeakerData();
        return new PowerCheck(checkData);
    }

    async setupAgingRoll(year?: number) 
    {
        if (this.data.type == "character") 
        {
            const dialogData = {
                modifier: PILLARS.lifePhaseModifier[this.system.life!.phase as LifePhase] || 0,
                changeList: this.getDialogChanges({ condense: true }),
                changes: this.getDialogChanges(),
                years: this.system.seasons?.filter((i: BookYearData) => !i.aging).map((i: BookYearData) => i.year) || [],
                defaultYear: year,
            };
            const checkData: AgingCheckDataFlattened = <AgingCheckDataFlattened>await AgingDialog.create(dialogData);
            checkData.title = getGame().i18n.localize("PILLARS.AgingRoll");
            checkData.speaker = this.speakerData();
            return new AgingRoll(checkData);
        }
    }

    /**
   * Validates whether the power can be used, checking if the power source has enough power left, or the item parent has enough uses/charges left.
   * Throws an error if not, otherwise returns nothing
   *
   * @param {Object} power  Power being used in a check
   */
    _powerUsageValidation(power: PillarsItem): void 
    {
        const game = getGame();

        if (power.data.type == "power") 
        {
            if (!power.SourceItem) {throw ui.notifications!.error(game.i18n.format("PILLARS.ErrorNoPowerSourceFound", { value: power.system.source.value }));}

            const embeddedParent = power.system.EmbeddedPowerParent;
            if (embeddedParent && embeddedParent.category?.value != "grimoire") 
            {
                if (["longRest", "encounter"].includes(power.system.embedded?.spendType || "")) 
                {
                    if (power.system.embedded!.uses.value <= 0) {throw ui.notifications!.error(game.i18n.localize("PILLARS.NoMoreUses"));}
                }
                else if (power.system.embedded!.spendType == "charges") 
                {
                    if (power.system.embedded!.chargeCost > embeddedParent.powerCharges!.value) {throw ui.notifications!.error(game.i18n.localize("PILLARS.NotEnoughCharges"));}
                }
            }
            else if (power.system.source?.value == "spirits" && power.system.category?.value == "phrase") {return;} // Phrases add 1 to power
            else if (power.SourceItem?.system.pool!.current < power.system.level!.value) {throw ui.notifications!.error(game.i18n.localize("PILLARS.NotEnoughPower"));}
        }
    }

    //#endregion

    //#region Convenience Helpers
    getItemTypes(type: ItemType): PillarsItem[] 
    {
        return (this.itemCategories || this.itemTypes)[type] || [];
    }

    getDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) 
    {
        const game = getGame();
        const dialogData: CheckDialogData = <CheckDialogData>{};
        dialogData.title = game.i18n.format("PILLARS.CheckTitle", { name: item?.name || options.name });
        dialogData.modifier = "";
        dialogData.steps = 0;
        (dialogData.changeList = this.getDialogChanges({ condense: true })),
        (dialogData.changes = this.getDialogChanges()),
        (dialogData.actor = this),
        (dialogData.targets = Array.from(game.user!.targets));
        dialogData.rollModes = CONFIG.Dice.rollModes;
        dialogData.rollMode = game.settings.get("core", "rollMode");
        dialogData.item = item;
        dialogData.options = options;
        dialogData.state = { normal: true };
        return dialogData;
    }

    getSkillDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) 
    {
        const dialogData: SkillDialogData = <SkillDialogData>this.getDialogData(type, item, options);
        dialogData.assisters = this.constructAssisterList(item.name || options.name || "");
        dialogData.hasRank = item ? !!item.system.xp!.rank : false;
        dialogData.skill = item;
        return dialogData;
    }

    getWeaponDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) 
    {
        const dialogData: WeaponDialogData = <WeaponDialogData>this.getDialogData(type, item, options);
        dialogData.title = getGame().i18n.format("PILLARS.AttackTitle", { name: item?.name || options.name });
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (((item.system.misc as { value: number })!.value || 0) + (item.system.accuracy!.value || 0)).toString();
        dialogData.hasRank = item.Skill ? !!item.Skill.rank : false;
        dialogData.skill = item.Skill;
        return dialogData;
    }

    getPowerDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) 
    {
        const dialogData: PowerDialogData = <PowerDialogData>this.getDialogData(type, item, options);
        if (item.system.damage?.value.length) {dialogData.title = getGame().i18n.format("PILLARS.AttackTitle", { name: item?.name || options.name });}
        else {dialogData.title = item?.name || options.name || "";}
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.SourceItem?.attack || 0).toString();
        dialogData.hasRank = false;
        return dialogData;
    }

    constructAssisterList(itemName: string): AssisterData[] 
    {
        let assisters = getGame().actors!.contents.filter((i) => (i.hasPlayerOwner || i.prototypeToken.disposition > 0) && i.id != this.id);
        assisters = assisters.filter((a) => a.items.contents.find((i) => i.name == itemName)); // name because we want to account for specializations have the same base name

        const assisterData: AssisterData[] = assisters.map((actor): AssisterData => 
        {
            return {
                name: actor.name || "",
                id: actor.id,
                rank: actor.items.contents.find((i) => i.name == itemName)?.rank || 0,
                die: `d${SkillCheck.rankToDie(actor.items.contents.find((i) => i.name == itemName))}`,
            };
        });
        return assisterData.filter((a) => a.rank >= 5);
    }

    /**
   * Get effects listed in the dialog
   * Effects are sourced from the rolling actor and targeted actor, if applicable
   */
    getDialogChanges({ condense = false } = {}): PillarsEffectChangeDataProperties[] 
    {
    // Aggregate dialog changes from each effect
        let changes: PillarsEffectChangeDataProperties[] = this.effects
            .filter((i) => !i.data.disabled)
            .reduce((prev: PillarsEffectChangeDataProperties[], current) => prev.concat(current.getDialogChanges({ condense, indexOffset: prev.length })), []);

        if (getGame().user!.targets.size > 0) 
        {
            const target = Array.from(getGame().user!.targets)[0]!.actor;
            if (target) 
            {
                const targetChanges = target.effects.reduce(
                    (prev: PillarsEffectChangeDataProperties[], current) =>
                        prev.concat(
                            current.getDialogChanges({
                                target,
                                condense,
                                indexOffset: changes.length,
                            })
                        ),
                    []
                );
                changes = changes.concat(targetChanges);
            }
        }
        return changes;
    }

    //#endregion

    speakerData(token?: Token): ChatSpeakerDataProperties 
    {
        if (this.isToken) 
        {
            return {
                token: token?.document?.id || this.token?.id || null,
                scene: token?.document?.parent?.id || this.token?.parent?.id || null,
                alias: undefined,
                actor: null,
            };
        }
        else 
        {
            return {
                actor: this.id,
                token: token?.document?.id || null,
                scene: token?.document?.parent?.id || null,
                alias: undefined,
            };
        }
    }

    targetSpeakerData(): ChatSpeakerDataProperties[] 
    {
        return Array.from(getGame().user!.targets)
            .map((i) => i.actor?.speakerData(i))
            .filter((i) => i) as ChatSpeakerDataProperties[];
    }

    use(type: string, name: string) 
    {
        const item = this.getItemTypes(type as ItemType).find((i) => i.name == name);
        if (item) {return item.update({ "data.used.value": true });}
        const worldItem = getGame().items!.contents.find((i) => i.type == type && i.name == name);
        if (worldItem) 
        {
            const itemData = worldItem.toObject();
            if (isUsable(itemData)) 
            {
                itemData.data.used.value = true;
            }
            return this.createEmbeddedDocuments("Item", [{ ...itemData }]);
        }

        // If no owned item and no world item, just make the item
        return this.createEmbeddedDocuments("Item", [{ name, type, sort: 0, data: { used: { value: true } } }]);
    }

    _baseRest(): DeepPartial<ActorDataConstructorData> 
    {
        const updates: DeepPartial<ActorDataConstructorData> = {
            items: [],
            data: {},
        };

        // Short/Long rest both refill pools
        this.getItemTypes(ItemType.powerSource).forEach((p) => 
        {
      updates.items!.push({ name: p.name!, type: p.type, _id: p.id, data: { pool: { current: p.system.pool?.max } } });
        });

        // Both rests reset encounter items
        this.items
            .filter((i) => i.system.powerRecharge == "encounter")
            .forEach((i) => 
            {
        updates.items!.push({
            name: i.name!,
            type: i.type,
            _id: i.id,
            data: { powerCharges: { value: i.system.powerCharges?.max } },
        });
            });

        this.items
            .filter((i) => i.type == "power" && i.system.embedded?.spendType == "encounter")
            .forEach((i) => 
            {
        updates.items!.push({
            name: i.name!,
            type: i.type,
            _id: i.id,
            data: {
                embedded: {
                    uses: {
                        value: i.system.embedded?.uses.max,
                    },
                },
            },
        });
            });

        return updates;
    }

    longRest() 
    {
        if (this.data.type == "headquarters") {return;}

        const updates = this._baseRest() as DeepPartial<PreparedPillarsNonHeadquartersActorData> & ActorDataConstructorData;

    updates.data!.health = { value: 0 };
    updates.data!.endurance = { value: 0 };

    this.items
        .filter((i) => i.system.powerRecharge == "longRest")
        .forEach((i) => 
        {
        updates.items!.push({
            name: i.name!,
            type: i.type,
            _id: i.id,
            data: {
                powerCharges: { value: i.system.powerCharges?.max },
            },
        });
        });

    this.items
        .filter((i) => i.type == "power" && i.system.embedded?.spendType == "longRest")
        .forEach((i) => 
        {
        updates.items!.push({
            name: i.name!,
            type: i.type,
            _id: i.id,
            data: {
                embedded: {
                    uses: {
                        value: i.system.embedded?.uses.max,
                    },
                },
            },
        });
        });

    return this.update(updates);
    }

    shortRest() 
    {
        if (this.data.type == "headquarters") {return;}

        const updates = this._baseRest() as DeepPartial<PreparedPillarsNonHeadquartersActorData> & { items: ItemDataConstructorData[] };

        if (!this.system.health.incap && !this.system.endurance.incap) 
        {
      updates.data!.health = { value: 0 };
      updates.data!.endurance = { value: 0 };
        }

        return this.update(updates);
    }

    enduranceAction(action: "exert" | "breath") 
    {
        if (this.data.type == "headquarters") {return;}
        const game = getGame();
        let actionName;
        if (action == "exert") 
        {
            this.update({
                "data.endurance.value": Math.min(this.system.endurance.max, this.system.endurance.value + 2),
            });
            actionName = game.i18n.localize("PILLARS.Exert");
        }
        else if (action == "breath") 
        {
            this.update({
                "data.endurance.value": Math.max(0, this.system.endurance.value - 2),
            });
            actionName = game.i18n.localize("PILLARS.CatchBreath");
        }

        const content = `${this.name} used ${actionName}!`;

        ChatMessage.create({ content, speaker: { alias: this.name } });
    }

    hasCondition(condition: string): PillarsActiveEffect | undefined 
    {
        return this.effects.find((i) => i.conditionId == condition);
    }

    addCondition(condition: string) 
    {
        const effect = duplicate(CONFIG.statusEffects.find((e) => e.id == condition));
        if (!effect) {return new Error(getGame().i18n.localize("PILLARS.ErrorConditionKey"));}

        if (condition == "incapacitated") {this.addDefeatedStatus();}

        if (condition == "dead" || condition == "incapacitated") {setProperty(effect, "flags.core.overlay", true);}

        setProperty(effect, "flags.core.statusId", effect.id);
        delete effect.id;
        return this.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    removeCondition(condition: string) 
    {
        const effect = this.hasCondition(condition);
        if (condition == "incapacitated") {this.addDefeatedStatus();}
        if (effect) {return effect.delete();}
    }

    addDefeatedStatus() 
    {
        if (this.data.type == "headquarters") {return;}
        const game = getGame();
        if (game.combat) 
        {
            let combatant;
            if (this.isToken) {combatant = game.combat.getCombatantByToken(this.token!.id!);}
            else {combatant = game.combat.combatants.find((c) => c.data.actorId == this.id);}

            if (combatant)
            {
                return combatant.update({
                    defeated: this.system.health.incap || this.system.endurance.incap,
                });
            }
        }
    }

    handleScrollingText(data: ActorDataConstructorData) 
    {
        if (this.data.type == "headquarters") {return;}
        try 
        {
            if (hasProperty(data, "system.health.value")) {this._displayScrollingChange(getProperty(data, "system.health.value") - this._source.system.health.value);}
            if (hasProperty(data, "system.health.wounds.value")) {this._displayScrollingChange(getProperty(data, "system.health.wounds.value") - this._source.system.health.wounds.value, { text: "Wound" });}
            if (hasProperty(data, "system.endurance.value")) {this._displayScrollingChange(getProperty(data, "system.endurance.value") - this._source.system.endurance.value, { endurance: true });}
        }
        catch (e) 
        {
            console.error(getGame().i18n.localize("PILLARS.ErrorScrollingText"), data, e);
        }
    }

    /**
   * Display changes to health as scrolling combat text.
   * Adapt the font size relative to the Actor's HP total to emphasize more significant blows.
   * @param {number} daamge
   * @private
   */
    _displayScrollingChange(change: number, { text = "", endurance = false } = {}) 
    {
        if (!change) {return;}
        change = Number(change);
        const tokens = this.getActiveTokens(true);
        for (const t of tokens) 
        {
            //@ts-ignore
            canvas?.interface.createScrollingText(t.center, change.signedString() + " " + text, {
                anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                fontSize: 30,
                fill: endurance ? "0x6666FF" : change > 0 ? "0xFF0000" : "0x00FF00", // I regret nothing
                stroke: 0x000000,
                strokeThickness: 4,
                jitter: 0.25,
            });
        }
    }

    getActiveEmbeddedPowers() 
    {
    // Filter embedded powers by whether their parent item is equipped. If the parent cannot be equipped, include it anyway. If the parent is not found, do not include it (should never happen)
        return this.getItemTypes(ItemType.power).filter((p) => 
        {
            const parent = p.EmbeddedPowerParent;
            if (!parent) {return false;}
            else if (parent.canEquip) {return parent.system.equipped?.value;}
            else {return true;}
        });
    }

    async applyDamage(damage: number, type: string, options: DamageOptions) 
    {
        if (this.data.type == "headquarters") {return;}

        const game = getGame();
        if (damage < this.system.toughness.value) {return game.i18n.localize("PILLARS.NoDamage");}

        const updateObj: DeepPartial<PreparedPillarsNonHeadquartersActorData> & ActorDataConstructorData = {
            name: this.name!,
            type: this.data.type,
            system: {
                health: {
                    wounds: {},
                },
                endurance: {},
            },
        };

        // Need to separate items from updateObj because of https://github.com/foundryvtt/foundryvtt/issues/8351
        let items: ItemDataSource[] = [];

        let soak = this.system.soak.base;
        switch (type) 
        {
        case "physical":
            soak += this.system.soak.physical;
            break;
        case "burn":
            soak += this.system.soak.burn;
            break;
        case "freeze":
            soak += this.system.soak.freeze;
            break;
        case "corrode":
            soak += this.system.soak.corrode;
            break;
        case "shock":
            soak += this.system.soak.shock;
            break;
        case "raw":
            soak = 0;
            break;
        }

        if (options.shield && this.equippedShield) {soak += this.equippedShield?.Soak || 0;}

        let message = `${damage} Damage - ${soak} Soak`;

        if (options.shield && this.equippedShield) 
        {
            message += ` ${game.i18n.format("PILLARS.ShieldSoak", { soak: this.equippedShield.Soak })}`;
            items = [this.calculateShieldDamage(this.equippedShield, damage)];
        }

        if (damage > this.system.toughness.value) 
        {
      updateObj.system!.endurance!.value = this.system.endurance.value + 1;
      message += ` - ${game.i18n.format("PILLARS.ApplyEndurance", { value: 1 })}`;
        }

        if (damage > this.system.toughness.value && damage > soak) 
        {
            const damageMinusSoak = damage - soak;
            const pips = Math.floor(damageMinusSoak / this.system.damageIncrement.value);
      updateObj.system!.health!.value = this.system.health.value + pips;
      message += ` - ${game.i18n.format("PILLARS.ApplyHealth", { value: pips })}`;

      if (pips >= 3 && pips <= 4 && this.system.health.wounds.value < 3) 
      {
        updateObj.system!.health!.wounds!.value = this.system.health.wounds.value + 1;
        message += ` - ${game.i18n.format("PILLARS.ApplyWounds", { value: 1 })}`;
      }
        }

        if (this.isOwner || !game.settings.get("pillars-of-eternity", "playerApplyDamage")) 
        {
            await this.update(updateObj);

            // Currently the only items within the items array are shields and their health being updated
            // If items need to be added, a separate call to createEmbeddedDocuments is needed
            if (items.length) {this.updateEmbeddedDocuments("Item", [{ ...items }]);}
        }
        else if (game.settings.get("pillars-of-eternity", "playerApplyDamage"))
        {
game.socket!.emit("system.pillars-of-eternity", {
    type: "updateActor",
    payload: { updateData: updateObj, speaker: this.speakerData(), updateItems: items },
});
        }

        return message;
    }

    async applyHealing(healing: number, type: string) 
    {
        const game = getGame();

        if (this.data.type == "headquarters") {return;}

        const updateObj: DeepPartial<PreparedPillarsNonHeadquartersActorData> & ActorDataConstructorData = {
            name: this.name!,
            type: this.data.type,
            items: [],
            data: {
                health: {
                    wounds: {},
                },
                endurance: {},
            },
        };
        let message = "";

        let healthPips = 0;
        let endurancePips = 0;
        let newHealth = this.system.health.value;

        if (type == "health") 
        {
            healthPips = Math.floor(healing / this.system.damageIncrement.value);
            const remainder = healing % this.system.damageIncrement.value;

            newHealth = this.system.health.value - healthPips - this.system.health.wounds.value; // Offset health wounds value so endurance remainder is accurate
            if (newHealth < 0) 
            {
                // Remainder of health pips go to endurance
                endurancePips = Math.abs(newHealth);
                newHealth = 0;
            }

            if (remainder > 0) {endurancePips += 1;}
        }
        if (type == "endurance") 
        {
            endurancePips = healing;
        }

        const newEndurance = Math.max(0, this.system.endurance.value - endurancePips);

        if (healthPips > 0) 
        {
      updateObj.data!.health!.value = newHealth;
      message += `+ ${game.i18n.format("PILLARS.ApplyHealth", { value: healthPips })}`;
        }

        if (endurancePips > 0) 
        {
      updateObj.data!.endurance!.value = newEndurance;
      message += `+ ${game.i18n.format("PILLARS.ApplyEndurance", { value: endurancePips })}`;
        }

        if (this.isOwner || !game.settings.get("pillars-of-eternity", "playerApplyDamage")) {this.update(updateObj);}
        else if (game.settings.get("pillars-of-eternity", "playerApplyDamage"))
        {
game.socket!.emit("system.pillars-of-eternity", {
    type: "updateActor",
    payload: { updateData: updateObj, speaker: this.speakerData() },
});
        }

        return message;
    }

    calculateShieldDamage(shield: PillarsItem, damage: number) 
    {
        const damageToShield = Math.min(shield.Soak || 0, damage);

        const shieldObj = shield.toObject();

        if (shieldObj.type == "shield") {shieldObj.data.health.current -= damageToShield;}
        return shieldObj; // Return data instead of updating it to send it with the rest of the update
    }

    isBondedWith(actor: PillarsActor) 
    {
        const thisBonds = this.getItemTypes(ItemType.bond).filter((i) => i.system.active);
        const theirBonds = actor.getItemTypes(ItemType.bond).filter((i) => i.system.active);
        return thisBonds.find((b) => b.system.partner == actor.id) && theirBonds.find((b) => b.system.partner == this.id);
    }

    /**
   *
   * Set a follower type, ignore subsequent changes
   *
   * @param string Type value, "expert", "generalist", etc.
   */
    async setFollowerType(followerType: keyof typeof PILLARS.followerTypes) 
    {
        const game = getGame();
        if (this.data.type != "follower" || !this.system.subtype.value) 
        {
            // If already has a subtype, ignore change
            const filterData: ItemDialogData = <ItemDialogData>{
                filters: [
                    {
                        type: "comparison",
                        test: "==",
                        value: "skill",
                        target: "type",
                    },
                ],
            };

            const followerSkills = PILLARS.followerSkills[followerType];
            for (const skills of followerSkills) 
            {
                filterData.choices = skills.number;
                filterData.diff = { "system.modifier.value": skills.rank };
                filterData.text = game.i18n.format("PILLARS.FollowerSkillPrompt", skills);
                const skillsSelected = await ItemDialog.create(filterData);

                this.createEmbeddedDocuments(
                    "Item",
                    skillsSelected.map((i) => 
                    {
                        return { ...i.toObject() };
                    })
                );
            }
        }
    }

    /**
   * Handles giving a species item to a follower
   * Sets their birth date and start date
   *
   * @param speciesItem Species type item
   * @returns
   */
    setFollowerSpecies(speciesItem: PillarsItem) 
    {
        const game = getGame();
        const time = game.settings.get("pillars-of-eternity", "time");
        const year = time.year;
        const YA_age = speciesItem.system.phases!["youngAdult"][0]!;
        const age = YA_age + Math.ceil(CONFIG.Dice.randomUniform() * 6);
        const birthYear = year - age;

        return this.update({ "data.life": { birthYear, startYear: year } });
    }

    /**
   * Clears used items
   */
    clearUsed() 
    {
        const items = this.items.filter((i) => !!i.system.used?.value).map((i) => i.toObject());

        items.forEach((i) => 
        {
            if (isUsable(i)) {i.data.used.value = false;}
        });

        if (items.length) {return this.update({ items });}
    }

    get book() 
    {
        return new BookOfSeasons(this);
    }

    // @@@@@@@ ITEM GETTERS @@@@@@@@@

    get equippedShield() 
    {
        return this.getItemTypes(ItemType.shield).filter((i) => i.system.equipped?.value)[0];
    }

    get equippedArmor() 
    {
        return this.getItemTypes(ItemType.armor).filter((i) => i.system.equipped?.value)[0];
    }
}
//#endregion
