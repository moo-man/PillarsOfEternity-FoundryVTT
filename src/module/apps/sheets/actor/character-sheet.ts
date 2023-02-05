import PowerTemplate from "../../../system/power-template";
import BookOfSeasons from "../../book-of-seasons";
import ActorConfigure from "../../actor-configure";
import { PillarsItem } from "../../../document/item-pillars";
import PillarsActiveEffect from "../../../document/effect-pillars";
import { BasePreparedPillarsActorData, PreparedPillarsCharacterData } from "../../../../global";
import { Defense, ItemType, SoakType } from "../../../../types/common";
import { getGame } from "../../../system/utility";
import { PILLARS_UTILITY } from "../../../system/utility";
import { PowerGroups } from "../../../../types/powers";
import { BasePillarsActorSheet } from "./base-sheet";

// Overwrite default ActorSheet.Data data property and replace it with system data
interface PillarsActorSheetData extends Omit<ActorSheet.Data, "data" | "effects" | "items"> {
  system: BasePreparedPillarsActorData;
  items: SheetItemData;
  effects: SheetEffectData;
  soaks: SoakData;
  Connections: { name: string; img: string; id: string }[];
  deathMarch: string[];
  tooltips: {
    defenses: {
      deflection: string;
      reflex: string;
      fortitude: string;
      will: string;
    };
    health: {
      max: string;
      threshold: {
        bloodied: string;
        incap: string;
      };
    };
    endurance: {
      max: string;
      threshold: {
        winded: string;
      };
    };
    initiative: {
      value: string;
    };
    soak: {
      base: string;
      shield: string;
      physical: string;
      burn: string;
      freeze: string;
      raw: string;
      corrode: string;
      shock: string;
    };
    stride: {
      value: string;
    };
    run: {
      value: string;
    };
    toughness: {
      value: string;
    };
    damageIncrement: {
      value: string;
    };
  };
}

interface SheetItemData {
  attributes: {
    benefits: PillarsItem[];
    hindrances: PillarsItem[];
  };
  skills: PillarsItem[];
  traits: PillarsItem[];
  powers: PillarsItem[];
  embeddedPowers: PillarsItem[];
  powerSources: PillarsItem[];

  injuries: PillarsItem[];
  backgrounds: PillarsItem[];
  settings: PillarsItem[];
  connections: PillarsItem[];
  reputations: PillarsItem[];
  bonds : PillarsItem[];

  inventory: InventorySheetData;

  equipped: {
    meleeWeapons: PillarsItem[];
    rangedWeapons: PillarsItem[];
    armor: PillarsItem[];
    shields: PillarsItem[];
  };
}

interface InventorySheetData {
  weapons: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
  armor: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
  shields: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
  tools: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
  gear: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
  grimoires: {
    label: string;
    type: string;
    items: PillarsItem[];
  };
}

type SoakData = Partial<Record<SoakType, { total: number; show: boolean; img: string }>>

interface SheetEffectData {
  temporary: PillarsActiveEffect[];
  disabled: PillarsActiveEffect[];
  passive: PillarsActiveEffect[];
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsCharacterSheet extends BasePillarsActorSheet<ActorSheet.Options, PillarsActorSheetData> 
{
    scrollPos: (number | undefined)[] = [];

    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["character"]);
        options.width = 1200;
        options.height = 700;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.scrollY = [".tab-content"];
        return options;
    }

    get template(): string 
    {
        if (this.actor.type == "character") {return "systems/pillars-of-eternity/templates/actor/actor-character-sheet.hbs";}
        else {return "";}
    }

    /**
   * Overrides the default ActorSheet.render to add lity.
   *
   * This adds scroll position saving support, as well as tooltips for the
   * custom buttons.
   *
   * @param {bool} force      used upstream.
   * @param {Object} options  used upstream.
   */
    async _render(force = false, options = {}): Promise<void> 
    {
        await super._render(force, options);
        this.checkAlerts();
    //this._refocus(this._element)
    }


    checkAlerts() 
    {
        this.checkSeasonAlerts();
    }

    checkSeasonAlerts()
    {
    // Change the seasons button color if seasons need updating
        const buttons = this.element.find<HTMLAnchorElement>(".header-button.seasons")[0];
        if (buttons)
        {
            const icon = buttons.firstElementChild as HTMLElement;
            if(getGame().pillars.time.seasonsNeedUpdating(this.actor))
            {
                buttons.classList.add("alert");
                if (icon)
                {icon.classList.replace("fa-book", "fa-exclamation-circle");}
            }
            else
            {
                buttons.classList.remove("alert");
                if (icon)
                {icon.classList.replace("fa-exclamation-circle", "fa-book");}
            }
        }
    }

    /**
   * Override header buttons to add custom ones.
   */
    _getHeaderButtons() 
    {
        const buttons = super._getHeaderButtons();
        if (this.actor.type == "character") 
        {
            buttons.unshift({
                class: "seasons",
                label: getGame().i18n.localize("PILLARS.Seasons"),
                icon: "fas fa-book",
                onclick: (ev) => 
                {
                    this.actor.book.render(true);
                },
            });
        }
        buttons.unshift({
            class: "configure",
            label: "",
            icon: "fas fa-wrench",
            onclick: async (ev: JQuery.ClickEvent) => new ActorConfigure(this.actor).render(true),
        });
        return buttons;
    }

    /** @override */
    async getData(): Promise<PillarsActorSheetData> 
    {
        const data = await super.getData();

        data.system = (data as unknown as ActorSheet.Data).data.data as (BasePreparedPillarsActorData);

        this.prepareSheetData(data);
        this.formatTooltips(data);

        console.log(data);
        return data;
    }

    prepareSheetData(sheetData: PillarsActorSheetData) 
    {
        sheetData.items = this.constructItemLists(sheetData);
        sheetData.effects = this.constructEffectLists(sheetData);
        this._setPowerSourcePercentage(sheetData);
        //this._createWoundsArrays(sheetData : PillarsSheetData)
        if (this.actor.type == "character") 
        {
            this._enrichConnections(sheetData);
            this._createDeathMarchArray(sheetData);
        }

        this._createHealthArray(<ActorHealthSheetData>sheetData.system.health);
        this._createEnduranceArray(<ActorEnduranceSheetData>sheetData.system.endurance);
        this._createSoakArray(sheetData);
    }

    formatTooltips(data: PillarsActorSheetData) 
    {
        if (this.actor.data.type == "headquarters")
        {return;}
        const tooltips = foundry.utils.deepClone(this.actor.data.flags.tooltips);
        data.tooltips = foundry.utils.deepClone(this.actor.data.flags.tooltips) as unknown as typeof data.tooltips;
        for (const def in data.tooltips.defenses) {data.tooltips.defenses[<Defense>def] = tooltips.defenses[<Defense>def].join(" + ").replaceAll("+ -", "- ");}
        data.tooltips.health.max = tooltips.health.max.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.endurance.max = tooltips.endurance.max.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.initiative.value = tooltips.initiative.value.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.stride.value = tooltips.stride.value.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.run.value = tooltips.run.value.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.toughness.value = tooltips.toughness.value.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.damageIncrement.value = tooltips.damageIncrement.value.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.health.threshold.bloodied = tooltips.health.threshold.bloodied.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.health.threshold.incap = tooltips.health.threshold.incap.join(" + ").replaceAll("+ -", "- ");
        data.tooltips.endurance.threshold.winded = tooltips.endurance.threshold.winded.join(" + ").replaceAll("+ -", "- ");

        for (const type in data.tooltips.soak) {data.tooltips.soak[<SoakType>type] = tooltips.soak[<SoakType>type].join(" + ").replaceAll("+ -", "- ");}
    }

    constructItemLists(sheetData: PillarsActorSheetData): SheetItemData 
    {
        const items: SheetItemData = <SheetItemData>{};

        items.attributes = { benefits: [], hindrances: [] };
        items.attributes.benefits = sheetData.actor.getItemTypes(ItemType.attribute).filter((i) => i.system.category?.value == "benefit");
        items.attributes.hindrances = sheetData.actor.getItemTypes(ItemType.attribute).filter((i) => i.system.category?.value == "hindrance");

        items.skills = sheetData.actor.getItemTypes(ItemType.skill);
        items.traits = sheetData.actor.getItemTypes(ItemType.trait);
        items.powers = sheetData.actor.getItemTypes(ItemType.power).filter((i) => !i.system.embedded?.item);
        items.embeddedPowers = sheetData.actor.getActiveEmbeddedPowers();
        items.powerSources = sheetData.actor.getItemTypes(ItemType.powerSource);

        items.injuries = sheetData.actor.getItemTypes(ItemType.injury);
        items.backgrounds = sheetData.actor.getItemTypes(ItemType.background);
        items.settings = sheetData.actor.getItemTypes(ItemType.setting);
        items.connections = sheetData.actor.getItemTypes(ItemType.connection);
        items.reputations = sheetData.actor.getItemTypes(ItemType.reputation);
        items.bonds = sheetData.actor.getItemTypes(ItemType.bond);

        items.inventory = this.constructInventory(sheetData);

        items.equipped = {
            meleeWeapons: items.inventory.weapons.items.filter((i) => i.system.equipped?.value && i.isMelee),
            rangedWeapons: items.inventory.weapons.items.filter((i) => i.system.equipped?.value && i.isRanged),
            armor: items.inventory.armor.items.filter((i) => i.system.equipped?.value),
            shields: items.inventory.shields.items.filter((i) => i.system.equipped?.value),
        };
        return items;
    }

    constructInventory(sheetData: PillarsActorSheetData): InventorySheetData 
    {
        const inventory = {
            weapons: {
                label: "Weapons",
                type: "weapon",
                items: sheetData.actor.getItemTypes(ItemType.weapon),
            },
            armor: {
                label: "Armor",
                type: "armor",
                items: sheetData.actor.getItemTypes(ItemType.armor),
            },
            shields: {
                label: "Shields",
                type: "shield",
                items: sheetData.actor.getItemTypes(ItemType.shield),
            },
            tools: {
                label: "Tools",
                type: "equipment",
                items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.system.category?.value == "tool"),
            },
            gear: {
                label: "Gear",
                type: "equipment",
                items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.system.category?.value == "gear"),
            },
            grimoires: {
                label: "Grimoires",
                type: "equipment",
                items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.system.category?.value == "grimoire"),
            },
        };
        return inventory;
    }

    constructEffectLists(sheetData: PillarsActorSheetData): SheetEffectData 
    {
        const effects: SheetEffectData = <SheetEffectData>{};

        effects.temporary = sheetData.actor.effects.filter((i) => i.isTemporary && !i.data.disabled);
        effects.disabled = sheetData.actor.effects.filter((i) => i.data.disabled);
        effects.passive = sheetData.actor.effects.filter((i) => !i.isTemporary && !i.data.disabled);

        return effects;
    }

    constructPowerDisplay(sheetData: PillarsActorSheetData) 
    {
        const game = getGame();

        sheetData.items.powers.forEach((p) => 
        {
            if (p.data.type == "power")
            {
                const lowestKey = Object.keys(p.data.groups || {})
                    .filter((i) => i)
                    .sort((a, b) => a > b ? 1 : -1)[0] || game.i18n.localize("Default");
                p.data.display = p.data.groups?.[lowestKey];
            }
        });
    }



    _createSoakArray(sheetData: PillarsActorSheetData) 
    {
        const soakValues = sheetData.system.soak;

        sheetData.soaks = {
            physical: {
                total: soakValues.physical + soakValues.base,
                show: soakValues.physical > 0,
                img: "icons/svg/sword.svg",
            },
            burn: {
                total: soakValues.burn + soakValues.base,
                show: soakValues.burn > 0,
                img: "icons/svg/fire.svg",
            },
            freeze: {
                total: soakValues.freeze + soakValues.base,
                show: soakValues.freeze > 0,
                img: "icons/svg/frozen.svg",
            },
            corrode: {
                total: soakValues.corrode + soakValues.base,
                show: soakValues.corrode > 0,
                img: "icons/svg/acid.svg",
            },
            shock: {
                total: soakValues.shock + soakValues.base,
                show: soakValues.shock > 0,
                img: "icons/svg/lightning.svg",
            },
        };
    }

    _enrichConnections(sheetData: PillarsActorSheetData) 
    {
        if (sheetData.actor.data.type == "character") 
        {
            const connections = sheetData.actor.system.connections;
            sheetData.Connections = connections.map((i : {name : string}) => 
            {
                const actor = getGame().actors!.getName(i.name);
                return {
                    name: i.name,
                    img: actor ? actor.prototypeToken.texture.src || "" : "",
                    id: actor ? actor.id : "",
                };
            });
        }
    }

    _createHealthArray(data: ActorHealthSheetData): void 
    {
        let healthBonus, healthPenalty;
        if (data.modifier > 0) {healthBonus = data.modifier;}
        else {healthPenalty = Math.abs(data.modifier);}

        // .map is necessary, without it, all elements in the array point to the same object instance
        data.array = new Array(data.max).fill(undefined).map(i => {return {state : 0};});
        if (healthBonus) {data.array = data.array.concat(new Array(healthBonus).fill(undefined).map(i => {return {state : 0, bonus: true};}));}
        else if (healthPenalty) {data.array = data.array.slice(healthPenalty);}

        let deathBonus, deathPenalty;
        if (data.death.modifier > 0) {deathBonus = data.death.modifier;}
        else {deathPenalty = Math.abs(data.death.modifier);}

        if (deathBonus) {data.array = data.array.concat(new Array(data.death.modifier).fill(undefined).map(i => {return {state : 0, bonus: true};}));}
        else if (deathPenalty) 
        {
            let counter = 0;
            for (let i = data.array.length - 1; i >= 0 && counter < deathPenalty; i--) 
            {
        data.array[i]!.state = -1;
        counter++;
            }
        }

        data.array.forEach((e, i) => 
        {
            if (i < data.value) {e.state = 1;}
        });

        if (data.wounds) 
        {
            data.array.forEach((e, i) => 
            {
                if (i < data.wounds.value) {e.state = 2;}
            });
        }
    }

    _createEnduranceArray(data: ActorEnduranceSheetData): void 
    {
    // .map is necessary, without it, all elements in the array point to the same object instance
        data.array = new Array(data.max).fill(undefined).map(i => {return {state : 0};});
        if (data.bonus) {data.array = data.array.concat(new Array(data.bonus).fill(undefined).map(i => {return { bonus: true, state: 0 };}));}
        if (data.penalty) 
        {
            let penaltyCounter = 0;
            for (let i = data.array.length - 1; i >= 0 && penaltyCounter < data.penalty; i--) 
            {
        data.array[i]!.state = -1;
        penaltyCounter++;
            }
        }

        data.array.forEach((e, i) => 
        {
            if (i < data.value) {e.state = 1;}
        });
    }

    _createDeathMarchArray(sheetData: PillarsActorSheetData): void 
    {
        if (this.actor.type == "character") 
        {
            const marchVal = (<PreparedPillarsCharacterData>sheetData.system).life.march;
            sheetData.deathMarch = [];

            for (let i = 0; i < 7; i++) 
            {
                if (i + 1 <= marchVal) {sheetData.deathMarch.push(`<i class="far fa-check-square"></i>`);}
                else {sheetData.deathMarch.push(`<i class="far fa-square"></i>`);}
            }

            if (marchVal != 7) {sheetData.deathMarch[6] = `<i style="opacity:0.2" class="fas fa-skull"></i>`;}
            else {sheetData.deathMarch[6] = `<i class="fas fa-skull"></i>`;}
        }
    }

    _setPowerSourcePercentage(sheetData: PillarsActorSheetData) 
    {
        const sources = sheetData.items.powerSources;
        sources.forEach((s) => 
        {
      s.system.pool!.pct = Math.clamped((s.system.pool!.current / s.system.pool!.max) * 100, 0, 100);
        });
    }

    _getSubmitData(updateData = {}) 
    {
        this.actor.overrides = {};
        let data = super._getSubmitData(updateData);
        data = diffObject(flattenObject(this.actor.toObject(false)), data);
        return data;
    }

    /* -------------------------------------------- */
    /** @override */
    activateListeners(html: JQuery<HTMLElement>): void 
    {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) {return;}

        $("input[type=text]").focusin(function () 
        {
            $(this).select();
        });

        $("input[type=number]").focusin(function () 
        {
            $(this).select();
        });

        html.find(".sheet-checkbox").on("click", this._onCheckboxClick.bind(this));
        html.find(".open-info").on("click", this._onInfoClick.bind(this));
        html.find(".add-wound").on("click", this._onWoundClick.bind(this));
        html.find(".subtract-wound").on("click", this._onWoundClick.bind(this));
        html.find(".item-special").on("mouseup", this._onSpecialClicked.bind(this));
        html.find(".item-property").on("change", this._onEditItemProperty.bind(this));
        html.find(".skill-roll").on("click", this._onSkillRoll.bind(this));
        html.find(".roll-untrained").on("click", this._onUntrainedSkillClick.bind(this));
        html.find(".weapon-roll").on("click", this._onWeaponRoll.bind(this));
        html.find(".power-roll").on("click", this._onPowerRoll.bind(this));
        html.find(".property-counter").on("mouseup", this._onCounterClick.bind(this));
        html.find(".create-connection").on("click", this._onCreateConnection.bind(this));
        html.find(".edit-connection").on("click", this._onEditConnection.bind(this));
        html.find(".delete-connection").on("click", this._onDeleteConnection.bind(this));
        html.find(".connection-name").on("click", this._onConnectionClick.bind(this));
        html.on("click", ".power-target", this._onPowerTargetClick.bind(this));
        html.find(".restore-pool").on("click", this._onRestorePoolClick.bind(this));
        html.find(".sheet-roll").on("click", this._onSheetRollClick.bind(this));
        //html.on('click', '.damage-roll', this._onDamageRollClick.bind(this));
        html.find(".roll-item-skill").on("click", this._onItemSkillClick.bind(this));
        html.find(".age-roll").on("click", this._onAgeRoll.bind(this));
        html.find(".roll-initiative").on("click", this._onInitiativeClick.bind(this));
        html.find(".setting").on("click", this._onSettingClick.bind(this));
        html.find(".displayGroup").on("click", this._onDisplayGroupClick.bind(this));
        html.find(".box-click").on("click", this._onBoxClick.bind(this));
        html.find(".long-rest").on("click", this._onLongRestClick.bind(this));
        html.find(".embedded-value").on("mouseup", this._onEmbeddedValueClick.bind(this));
        html.find(".endurance-action").on("click", this._onEnduranceActionClick.bind(this));
        html.find('.item:not(".tab-select")').each((i, li) => 
        {
            li.setAttribute("draggable", "true");
            li.addEventListener("dragstart", this._onDragStart.bind(this), false);
        });
    }

    _onCheckboxClick(event: JQuery.ClickEvent) 
    {
        let target = $(event.currentTarget!).attr("data-target");
        if (target == "item") 
        {
            target = $(event.currentTarget!).attr("data-item-target");
            const item = this.actor.items.get($(event.currentTarget!).parents(".item").attr("data-item-id") || "");
            if (item && target) {return item.update({ [`${target}`]: !getProperty(item.data, target) });}
        }
        if (target) {return this.actor.update({ [`${target}`]: !getProperty(this.actor.data, target) });}
    }

    _onInfoClick(event: JQuery.ClickEvent) 
    {
        const type = $(event.currentTarget!).attr("data-type");
        const item = this.actor.getItemTypes(<ItemType>type!)[0];
        if (!item) {return ui.notifications!.error(getGame().i18n.format("PILLARS.ErrorNoOwnedItem", {type}));}
        else if (item) {item.sheet!.render(true);}
    }

    _onEditItemProperty(event: JQuery.ChangeEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const target = $(event.currentTarget!).attr("data-target");
        let value: string | number = (<HTMLInputElement>event.currentTarget!).value;
        const item = this.actor.items.get(itemId!);

        if (Number.isNumeric(value)) {value = parseInt(value);}

        if (item && target) {return item.update({ [target]: value });}
    }

    _onCounterClick(event: JQuery.MouseUpEvent) 
    {
        let multiplier = event.button == 0 ? 1 : -1;
        multiplier = event.ctrlKey ? multiplier * 10 : multiplier;

        let target = $(event.currentTarget!).attr("data-target");
        if (target == "item") 
        {
            target = $(event.currentTarget!).attr("data-item-target");
            const item = this.actor.items.get($(event.currentTarget!).parents(".item").attr("data-item-id")!);
            if (item && target) {return item.update({ [`${target}`]: getProperty(item.data, target) + multiplier });}
        }
        if (target) {return this.actor.update({ [`${target}`]: getProperty(this.actor.data, target) + multiplier });}
    }

    _onSpecialClicked(event: JQuery.MouseUpEvent) 
    {
        const text = (<HTMLAnchorElement>event.currentTarget).text?.split("(")[0]?.trim();
        const specials = PILLARS_UTILITY.weaponSpecials();
        for (const special in specials) 
        {
            if (specials[special as keyof typeof specials].label == text) {return this._dropdown(event, { text: specials[special as keyof typeof specials].description });}
        }
    }

    _onCreateConnection(event: JQuery.ClickEvent) 
    {
        if (this.actor.data.type != "character")
        {return;}
        const connections = duplicate(this.actor.system.connections || []);
        if (connections) 
        {
            connections.push({ name: getGame().i18n.format("PILLARS.NewConnection")});
            this.actor.update({ "data.connections": connections });
        }
    }

    _onEditConnection(event: JQuery.ClickEvent) 
    {
        if (this.actor.data.type != "character")
        {return;}
        const index: number = parseInt($(event.currentTarget!).parents(".item").attr("data-index") || "");
        const connections = duplicate(this.actor.system.connections || []);
        const game = getGame();
        new Dialog({
            title: game.i18n.localize("PILLARS.ChangeConnection"),
            content: `
            <p>${game.i18n.localize("PILLARS.PromptConnectionName")}</p>
            <div class="form-group">
            <input type="text" name="connection" value=${connections[index]!.name}>
            </div>
            `,
            buttons: {
                submit: {
                    label: "Submit",
                    callback: (dlg) => 
                    {
                        const newName = ($(dlg).find("[name='connection']")[0] as HTMLInputElement).value || "";
            connections[index]!.name = newName;
            this.actor.update({ "data.connections": connections });
                    },
                },
            },
            default: "submit",
        }).render(true);
    }

    _onDeleteConnection(event: JQuery.ClickEvent) 
    {
        if (this.actor.data.type != "character")
        {return;}
        const index = parseInt($(event.currentTarget!).parents(".item").attr("data-index") || "");
        const connections = duplicate(this.actor.system.connections || []);
        connections.splice(index, 1);
        this.actor.update({ "data.connections": connections });
    }

    _onConnectionClick(event: JQuery.ClickEvent) 
    {
        const id = $(event.currentTarget!).parents(".item").attr("data-actor-id");
        if (id) {getGame().actors!.get(id)?.sheet?.render(true);}
    }

    _onPowerTargetClick(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const index = parseInt($(event.currentTarget!).attr("data-index") || "0");
        const item = this.actor.items.get(itemId!);
        if (item)
        {
            const groupId = item.displayGroupKey(); //$(event.currentTarget!).attr("data-group")
            PowerTemplate.fromItem(item, groupId!, index)?.drawPreview();
        }
    }

    _onRestorePoolClick(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        if (item) {return item.update({ "data.pool.current": item.system.pool?.max });}
    }

    _onWoundClick(event: JQuery.ClickEvent) 
    {
        if (this.actor.data.type == "headquarters")
        {return;}
        const multiplier = (<HTMLAnchorElement>event.currentTarget).classList.contains("add-wound") ? 1 : -1;
        return this.actor.update({ "data.health.wounds.value": this.actor.system.health.wounds.value + 1 * multiplier });
    }

    /* -------------------------------------------- */

    async _onSheetRollClick(event: JQuery.ClickEvent) 
    {
        (await new Roll((<HTMLAnchorElement>event.target).text).roll()).toMessage({ speaker: this.actor.speakerData() });
    }


    // _onDamageRollClick(event: JQuery.ClickEvent) {
    //   let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    //   let group = $(event.currentTarget!).attr('data-group');
    //   let item = this.actor.items.get(itemId!);
    //   if (item)
    //     new DamageDialog(item, undefined, Array.from(getGame().user!.targets)).render(true);
    // }

    _onInitiativeClick(event: JQuery.ClickEvent) 
    {
        const game = getGame();
        new Dialog({
            title: "Roll Initiative",
            content: "",
            buttons: {
                adv: {
                    label: "Advantaged",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kh[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
                    },
                },
                normal: {
                    label: "Normal",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
                    },
                },
                dis: {
                    label: "Disadvantaged",
                    callback: () => 
                    {
                        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kl[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
                    },
                },
            },
            default: "normal",
        }).render(true);
    }

    _onSettingClick(ev: JQuery.ClickEvent) 
    {
        const itemId = $(ev.currentTarget!).attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        if (item) {item.sheet!.render(true);}
    }

    async _onSkillRoll(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        if (item) 
        {
            const check = await this.actor.setupSkillCheck(item);
            await check.rollCheck();
            check.sendToChat();
        }
    }

    async _onUntrainedSkillClick(event: JQuery.ClickEvent) 
    {
        const allSkills = getGame()
            .items!.contents.filter((i) => i.type == "skill")
            .sort((a, b) => (a.name! > b.name! ? 1 : -1));
        let selectElement = `<select name="skill">`;
        for (const s of allSkills) {selectElement += `<option name=${s.name}>${s.name}</option>`;}
        selectElement += "</select>";
        const game = getGame();
        new Dialog({
            title: game.i18n.localize("PILLARS.UntrainedSkill"),
            //content : `<div style="display:flex; align-items: center"><label style="flex: 1">Name of Skill</label><input style="flex: 1" type='text' name='skill'/></div>`,
            content: `<div style="display:flex; align-items: center"><label style="flex: 1">Skill</label>${selectElement}</div>`,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: async (dlg) => 
                    {
                        const skill = ($(dlg).find("[name='skill']")[0] as HTMLInputElement)?.value;
                        if (skill) 
                        {
                            const check = await this.actor.setupSkillCheck(skill);
                            await check.rollCheck();
                            check.sendToChat();
                        }
                        else {ui.notifications!.error(game.i18n.localize("PILLARS.PromptItemName"));}
                    },
                },
            },
            default: "roll",
            render: (dlg) => 
            {
                $(dlg).find("select")[0]?.focus();
            },
        }).render(true);
    }

    async _onWeaponRoll(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const check = await this.actor.setupWeaponCheck(itemId!);
        await check.rollCheck();
        check.sendToChat();
    }

    async _onPowerRoll(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const check = await this.actor.setupPowerCheck(itemId!);
        await check.rollCheck();
        check.sendToChat();
    }

    async _onItemSkillClick(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        const skill = this.actor.items.getName(item?.system.skill?.value || "");
        if (!skill) {return ui.notifications!.warn(getGame().i18n.format("PILLARS.ErrorSkillNotFound", {name : item?.system.skill?.value}));}
        const check = await this.actor.setupSkillCheck(skill);
        await check.rollCheck();
        check.sendToChat();
    }

    async _onAgeRoll(event: JQuery.ClickEvent) 
    {
        const check = await this.actor.setupAgingRoll();
        await check?.rollCheck();
        check?.sendToChat();
    }

    _onDisplayGroupClick(event: JQuery.ClickEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        let groupIndex: number | string = <number | string>item?.getFlag("pillars-of-eternity", "displayGroup");
        if (item?.data.type == "power")
        {
            if (!Number.isNumeric(groupIndex)) {groupIndex = 0;}
            else if (typeof groupIndex == "number") {groupIndex++;}
            if (groupIndex >= Object.keys(item.data.groups || {}).length) {groupIndex = getGame().i18n.localize("Default");}
        }

        return item?.setFlag("pillars-of-eternity", "displayGroup", groupIndex);
    }

    _onBoxClick(ev: JQuery.ClickEvent) 
    {
        const index = parseInt($(ev.currentTarget!).attr("data-index") || "");
        const target = $(ev.currentTarget!).attr("data-target");

        if (target) 
        {
            const data = foundry.utils.deepClone(getProperty(this.actor.data, target));
            if (index + 1 == data.value) {data.value = data.value - 1;}
            else {data.value = Number(index) + 1;}

            this.actor.update({ [`${target}.value`]: data.value });
        }
    }

    _onLongRestClick(ev: JQuery.ClickEvent) 
    {
        const game = getGame();
        new Dialog({
            title: game.i18n.localize("PILLARS.Rest"),
            content: `<p>${game.i18n.localize("PILLARS.PromptShortLongRest")}</p>`,
            buttons: {
                long: {
                    label: game.i18n.localize("PILLARS.ShortRest"),
                    callback: () => this.actor.shortRest(),
                },
                short: {
                    label: game.i18n.localize("PILLARS.LongRest"),
                    callback: () => this.actor.longRest(),
                },
            },
        }).render(true);
    }

    _onEmbeddedValueClick(event: JQuery.MouseUpEvent) 
    {
        const itemId = $(event.currentTarget!).parents(".item").attr("data-item-id");
        const item = this.actor.items.get(itemId!);
        if (item) 
        {
            const embedded = duplicate(item.system.embedded);

            if (event.button == 0) {embedded.uses.value++;}
            else {embedded.uses.value--;}

            embedded.uses.value = Math.clamped(embedded.uses.value, 0, embedded.uses.max);

            item.update({ "data.embedded": embedded });
        }
    }

    _onEnduranceActionClick(ev: JQuery.ClickEvent) 
    {
        this.actor.enduranceAction(<"exert" | "breath">(<HTMLAnchorElement>ev.currentTarget).dataset.type);
    }
}
