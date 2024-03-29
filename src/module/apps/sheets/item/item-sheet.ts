import { ActiveEffectDataConstructorData, ActiveEffectDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import {  PillarsItemSystemData } from "../../../../global";
import { getGame } from "../../../system/utility";
import { hasEmbeddedPowers, ItemType, LifePhase } from "../../../../types/common";
import { BondTrait } from "../../../../types/items";
import { EmbeddedPower, PowerBaseEffect, PowerDamage, PowerDuration, PowerHealing, PowerMisc, PowerRange, PowerSummon, PowerTarget } from "../../../../types/powers";
import ItemSpecials from "../../item-specials";
import { PILLARS } from "../../../system/config";
import PillarsActiveEffect from "../../../document/effect-pillars";
import { PillarsItem } from "../../../document/item-pillars";
import { PillarsActor } from "../../../document/actor-pillars";
//@ts-ignore
import activateSharedListeners from "../shared/listeners";

interface PillarsItemSheetData extends Omit<ItemSheet.Data, "data"> {
  system: PillarsItemSystemData;

  // power
  powerEffects : {conditions : ActiveEffectDataConstructorData[], item : PillarsActiveEffect[]}

  // weapon
  martialSkills : PillarsItem[],

  //'attribute', 'weapon', 'armor', 'shield', 'equipment', 'species', 'stock', 'godlike'
  allowEmbeddedPowers : boolean,

  // bond
  possibleBonds : PillarsActor[],
  traits : (BondTrait & {disabled : boolean})[],
  traitsAllowed : number,
  traitsOwned : number,
  traitsAvailable : number
  matching : boolean
}

/**
 * Extend the basic ItemSheet with for Pillars
 * @extends {ItemSheet}
 */
export class PillarsItemSheet extends ItemSheet<ItemSheet.Options, PillarsItemSheetData> 
{
    focusIndex : number | undefined = undefined;

    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["pillars-of-eternity", "item"]);
        options.width = 550;
        options.height = 534;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "details" }];
        options.dragDrop = [{ dragSelector: ".item-list .item", dropSelector: null }];
        options.scrollY = [".tab"];
        return options;
    }

    get template() 
    {
        return `systems/pillars-of-eternity/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    _getHeaderButtons() 
    {
        const buttons = super._getHeaderButtons();
        if (this.item.isOwner) 
        {
            buttons.unshift({
                label: getGame().i18n.localize("PILLARS.Post"),
                class: "post",
                icon: "fas fa-comment",
                onclick: this.item.postToChat.bind(this.item),
            });
        }
        return buttons;
    }

    /** @override */
    async getData(): Promise<PillarsItemSheetData> 
    {
        const data = await super.getData();

        data.system = (data as unknown as ItemSheet.Data).data.data;

        if (this.item.type == "power" && this.item.system.target?.length) 
        {
            this.item.system.target.forEach((target : PowerTarget) => (target.subchoices = getProperty(getGame().pillars.config, `power${target.value[0]?.toUpperCase() + target.value.slice(1)}s`)));
            data.powerEffects = { conditions: foundry.utils.deepClone(CONFIG.statusEffects), item : []};
            if (this.item.effects.size) {data.powerEffects.item = Array.from(this.item.effects);}
        }

        if (this.item.type == "weapon") 
        {
            data.martialSkills = getGame().items!.contents.filter((i) => i.type == "skill" && i.system.category?.value == "martial");
            if (this.item.isOwned) {data.martialSkills = data.martialSkills.concat(this.item.actor!.getItemTypes(ItemType.skill).filter((i) => i.system.category?.value == "martial"));}
        }

        if (this.item.data.type == "bond")
        {
            data.matching = this.item.hasMatchingBond() || false;

            data.possibleBonds = getGame().actors!.contents.filter((i) => (i.hasPlayerOwner || i.prototypeToken.disposition > 0) && i.id != this.id);
            data.traitsAllowed = Math.max((this.item.system.xp.rank || 0) - 5, 0);
            data.traitsOwned = Math.max(this.item.system.traits.length - 3, 0); // Don't count default traits
            data.traitsAvailable = Math.max(data.traitsAllowed - data.traitsOwned, 0);
            data.traits = Object.values(PILLARS.bondTraits).map((t : BondTrait) => 
            {
                if (this.item.data.type == "bond")
                {
                    t.active = this.item.system.traits.includes(t.key);
                    (<PillarsItemSheetData["traits"][0]> t ).disabled = (data.traitsAvailable <= 0 && !t.active) || this.item.system.xp.rank! < 5; 
                }

                return t as PillarsItemSheetData["traits"][0];
            });
        }

        if (hasEmbeddedPowers(this.item.data.type)) {data.allowEmbeddedPowers = true;}
        return data;
    }

    async _onDrop(ev: DragEvent) 
    {
        const dragData = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");
        const dropItem = await PillarsItem.fromDropData(dragData); // TODO: test this
        const itemData = dragData.data || dropItem?.toObject();

        if (itemData && itemData.type === "power" && hasEmbeddedPowers(this.item)) 
        {
            return this.handleEmbeddedPowerDrop(itemData);
        }
        if (this.item.type == "power" && itemData && ["weapon", "equipment", "armor", "shield"].includes(itemData.type)) 
        {
            return this.handleSummonedItem(itemData);
        }

        return super._onDrop(ev);
    }

    async handleEmbeddedPowerDrop(power: EmbeddedPower) 
    {
        this.item.addEmbeddedPower(power);
    }

    handleSummonedItem(itemData: ItemDataConstructorData) 
    {
        const summons = foundry.utils.deepClone(this.item.system.summons);
        summons?.push({ group: "", item: itemData });
        this.item.update({ "system.summons": summons });
    }

    /** @override */
    activateListeners(html: JQuery<HTMLElement>) 
    {
        super.activateListeners(html);

        // Give every input / select element a tab index
        this._setFocusIndices(html);
        // Focus the previously focused tabindex when rerendering
        this._focusPreviousIndex(html);
        
        if (!this.options.editable) {return;}
        
        html.find("input,select").on("focusin", (ev : JQuery.FocusInEvent) => 
        {   
            this.focusIndex = ev.currentTarget.tabIndex;
        });
        activateSharedListeners(html, this);
        html.find(".item-specials").on("click", this._onConfigureSpecialsClick.bind(this));
        html.find(".csv-input").on("change", this._onCSVInputChange.bind(this));
        html.find(".add-power-effect").on("change", this._onAddPowerEffect.bind(this));
        html.find(".add-damage").on("click", this._onAddDamage.bind(this));
        html.find(".add-property").on("click", this._onAddProperty.bind(this));
        html.find(".remove-property").on("click", this._onRemoveProperty.bind(this));
        html.find(".summon a").on("click", this._onSummonClick.bind(this));
        html.find(".power-property").on("change", this._onPowerPropertyChange.bind(this));
        html.find(".power-edit").on("click", this._onEditPower.bind(this));
        html.find(".power-delete").on("click", this._onPowerDelete.bind(this));
        html.find(".embedded-power-edit").on("change", this._onEditEmbeddedPower.bind(this));
        html.find(".bond-trait input").on("change", this._onBondTraitChecked.bind(this));
        html.find(".phase-range").on("change", this._onPhaseRangeChange.bind(this));
        html.find(".array-edit").on("change", this._onArrayEdit.bind(this));
    }

    _setFocusIndices(html: JQuery<HTMLElement>)
    {
        html.find("input,select").each((index, element) => {element.tabIndex = index;});
    }

    _focusPreviousIndex(html: JQuery<HTMLElement>)
    {
        const element = html.find(`[tabindex=${this.focusIndex}]`)[0];
        if (element)
        {
            element.focus();
            if (element instanceof HTMLInputElement)
            {
                element.select();
            }
        }
    }

    _onConfigureSpecialsClick(ev: JQuery.ClickEvent) 
    {
        new ItemSpecials(this.item).render(true);
    }

    _onCSVInputChange(ev: JQuery.ChangeEvent) 
    {
        const target = $(ev.currentTarget).attr("data-target");
        const text = ev.target.value as string;
        const array = text.split(",").map((i) => i.trim());

        if (target) {return this.item.update({ [target]: array });}
    }

    _onAddPowerEffect(ev: JQuery.ChangeEvent) 
    {
        const target = $(ev.currentTarget).attr("data-target"); // TODO test this
        const text = ev.target.value as string;
        const array = text.split(",").map((i) => i.trim());
        if (target) {return this.item.update({ [target]: array });}
    }

    _onAddDamage(ev: JQuery.ClickEvent) 
    {
        if (this.item.system.damage) 
        {
            const damage = foundry.utils.deepClone(this.item.system.damage.value);
            damage.push(<PowerDamage>{
                label: "",
                base: "",
                crit: "",
                defense: "Deflection",
                type: "Physical",
            });
            return this.item.update({ "system.damage.value": damage });
        }
    }

    _onAddProperty(ev: JQuery.ClickEvent) 
    {
        const property = $(ev.currentTarget).parents(".form-group").attr("data-property")!;
        if (property == "summons") {return ui.notifications!.notify(getGame().i18n.localize("PILLARS.DragDropSummonPrompt"));}

        const data = foundry.utils.deepClone(getProperty(this.item.system, property));
        data.push(PillarsItem.baseData[property as keyof typeof PillarsItem.baseData]);
        return this.item.update({ [`system.${property}`]: data });
    }

    _onRemoveProperty(ev: JQuery.ClickEvent) 
    {
        const property = $(ev.currentTarget).parents(".form-group").attr("data-property")!;
        const index = $(ev.currentTarget).parents(".property-inputs").attr("data-index");
        const data = foundry.utils.deepClone(getProperty(this.item.system, property));
        data.splice(index, 1);
        return this.item.update({ [`system.${property}`]: data });
    }

    _onSummonClick(ev: JQuery.ClickEvent) 
    {
        const property = $(ev.currentTarget).parents(".form-group").attr("data-property")!;
        const index = $(ev.currentTarget).parents(".property-inputs").attr("data-index");
        const array = foundry.utils.deepClone(getProperty(this.item.system, property)) as PowerSummon[];
        if (index) 
        {
            const summon = array[parseInt(index)];
            if (summon) {new PillarsItem(summon.item).sheet?.render(true, { editable: false });}
        }
    }

    _onPowerPropertyChange(ev: JQuery.ChangeEvent) 
    {
        const el = ev.currentTarget;
        const property = $(el).parents(".form-group").attr("data-property")!;
        const index = $(el).parents(".property-inputs").attr("data-index");
        const data = foundry.utils.deepClone(getProperty(this.item.system, property)) as (PowerTarget & PowerRange & PowerDuration & PowerHealing & PowerMisc & PowerDamage & PowerBaseEffect)[];
        const target = $(ev.currentTarget).attr("data-path");

        let value : string | number = ev.currentTarget.value;
        if (Number.isNumeric(value)) {value = parseInt(value.toString());}

        if (index && target) 
        {
            const propertyData = data[parseInt(index)]!;

            setProperty(propertyData, target, value); // TODO TEST
            return this.item.update({ [`system.${property}`]: data });
        }
    }

    _onEditPower(ev: JQuery.ClickEvent) 
    {
        const index = Number($(ev.currentTarget).parents("[data-index]")[0]?.dataset.index);
        if (this.item.system.powers)
        {
            const power = this.item.system.powers[index];
            if (power?.ownedId) {this.actor?.items.get(power.ownedId)?.sheet?.render(true);}
            else {new PillarsItemSheet(new PillarsItem(power as ItemDataConstructorData, { embedded: { object: this.item, index } })).render(true, { editable: false });}
        }
    }

    _onPowerDelete(ev: JQuery.ClickEvent) 
    {
        const index = Number($(ev.currentTarget).parents("[data-index]")[0]?.dataset.index);
        if (this.item.system.powers)
        {
            const powers = foundry.utils.deepClone(this.item.system.powers); // TODO test this
            if (powers[index]?.ownedId && this.item.isOwned) {this.actor?.updateEmbeddedDocuments("Item", [{ _id: powers[index]?.ownedId, "system.embedded.item": null }]);}
      
            powers.splice(index, 1);
            return this.item.update({ "system.powers": powers });
        }
    }

    _onEditEmbeddedPower(ev: JQuery.ChangeEvent) 
    {
        const index = Number($(ev.currentTarget).parents("[data-index]")[0]?.dataset.index);
        const path = ev.currentTarget.dataset.path;
        const powers = foundry.utils.deepClone(this.item.system.powers);
        const value = Number.isNumeric(ev.currentTarget.value) ? Number(ev.currentTarget.value) : ev.currentTarget.value;

        if (powers)
        {
            setProperty(powers[index]?.system!, path, value);
            if (path == "embedded.uses.max") {setProperty(powers[index]?.system!, "embedded.uses.value", value);}
      
            // Update owned power if it exists
            if (powers[index]?.ownedId) 
            {
                const ownedItem = this.actor?.items.get(powers[index]?.ownedId!);
                if (ownedItem) {ownedItem.update(powers[index]);}
            }
      
            return this.item.update({ "system.powers": powers });
        }
    }

    _onBondTraitChecked(ev : JQuery.ChangeEvent) 
    {
        const checked = ev.currentTarget.checked;
        const bond = ev.currentTarget.dataset.bond as string;
        if (this.item.data.type == "bond")
        {
            let traits = duplicate(this.item.system.traits);
            if (checked && !traits.includes(bond))
            {
                traits.push(bond);
            }
            else if (!checked)
            {
                traits = traits.filter((t : string )=> t != bond);
            }
            this.item.update({"system.traits" : traits});
        }
    }

    _onPhaseRangeChange(ev : JQuery.ChangeEvent)
    {
        const index = Number(ev.currentTarget.dataset.index);
        const phase = $(ev.currentTarget).parents(".form-fields")[0]?.dataset.phase as LifePhase;

        if (index != 0 && index != 1)
        {return;} 

    
        const range = duplicate(this.item.system.phases?.[phase]);

        if (range)
        {
            range[index] = Number(ev.currentTarget.value);
        }

        this.item.update({[`system.phases.${phase}`] : range});
    }

  
    // Handle data properties that are arrays
    _onArrayEdit(ev : JQuery.ChangeEvent)
    { 
        const index = Number(ev.currentTarget.dataset.index);
        const path = ev.currentTarget.dataset.path as string;
        let value = ev.target.value as number | string;
        const array = duplicate(getProperty(this.item.data, path));

        if (Number.isNumeric(value))
        {value = Number(value);}

        array[index] = value;
        return this.item.update({[`${path}`] : array});
    }
}

