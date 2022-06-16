import PowerTemplate from '../system/power-template';
import BookOfSeasons from '../apps/book-of-seasons';
import ActorConfigure from '../apps/actor-configure';
import { PillarsItem } from '../item/item-pillars';
import PillarsActiveEffect from '../system/pillars-effect';
import { BasePreparedPillarsActorData, PreparedPillarsCharacterData } from '../../global';
import { Defense, ItemType, SoakType } from '../../types/common';
import { getGame } from '../../pillars';
import PILLARS_UTILITY from '../system/utility';
import { PowerGroups } from '../../types/powers';

// Overwrite default ActorSheet.Data data property and replace it with system data
interface PillarsActorSheetData extends Omit<ActorSheet.Data, 'data' | 'effects' | 'items'> {
  data: BasePreparedPillarsActorData;
  items: SheetItemData;
  effects: SheetEffectData;
  soaks: SoakData;
  KnownConnections: { name: string; img: string; id: string }[];
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

interface SoakData extends Partial<Record<SoakType, { total: number; show: boolean; img: string }>> {}

interface SheetEffectData {
  temporary: PillarsActiveEffect[];
  disabled: PillarsActiveEffect[];
  passive: PillarsActiveEffect[];
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsActorSheet extends ActorSheet<ActorSheet.Options, PillarsActorSheetData> {
  scrollPos: (number | undefined)[] = [];

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['pillars-of-eternity', 'sheet', 'actor'],
      template: 'systems/pillars-of-eternity/templates/actor/actor-sheet.html',
      width: 1200,
      height: 700,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'main' }],
      scrollY: ['.details', '.inventory-lists', '.items', '.powers', '.general'],
    });
  }

  get template(): string {
    if (this.actor.type == 'character') return 'systems/pillars-of-eternity/templates/actor/actor-sheet.html';
    else if (this.actor.type == 'npc') return 'systems/pillars-of-eternity/templates/actor/actor-npc-sheet.html';
    else return '';
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
  async _render(force = false, options = {}): Promise<void> {
    this._saveScrollPos(); // Save scroll positions
    await super._render(force, options);
    this._setScrollPos(); // Set scroll positions


    this.checkSeasonAlerts();
    //this._refocus(this._element)
  }

  checkSeasonAlerts()
  {
    // Change the seasons button color if seasons need updating
    let buttons = this.element.find<HTMLAnchorElement>(".header-button.seasons")[0]
    if (buttons)
    {
      let icon = buttons.firstElementChild as HTMLElement
      if(this.actor.seasonsNeedUpdating)
      {
          buttons.classList.add("alert")
          if (icon)
            icon.classList.replace("fa-book", 'fa-exclamation-circle')
      }
      else
      {   
        buttons.classList.remove("alert")     
        if (icon)
          icon.classList.replace('fa-exclamation-circle', "fa-book")
      }
        
    }
  }

  /**
   * Saves all the scroll positions in the sheet for setScrollPos() to use
   *
   * All elements in the sheet that use ".save-scroll" class has their position saved to
   * this.scrollPos array, which is used when rendering (rendering a sheet resets all
   * scroll positions by default).
   */
  _saveScrollPos(): void {
    if (this.form === null) return;

    const html = $(this.form).parent();
    this.scrollPos = [];
    let lists = $(html.find('.items'));
    for (let list of lists) {
      this.scrollPos.push($(list).scrollTop());
    }
  }

  /**
   * Sets all scroll positions to what was saved by saveScrollPos()
   *
   * All elements in the sheet that use ".save-scroll" class has their position set to what was
   * saved by saveScrollPos before rendering.
   */
  _setScrollPos(): void {
    if (!this.form) return;

    if (this.scrollPos) {
      const html = $(this.form).parent();
      let lists = $(html.find('.items'));
      for (let i = 0; i < lists.length; i++) {
        let el = lists[i];
        let pos = this.scrollPos[i];
        if (el && pos) {
          $(el).scrollTop(pos);
        }
      }
    }
  }

  /**
   * Override header buttons to add custom ones.
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if (this.actor.type == 'character') {
      buttons.unshift({
        class: 'seasons',
        label: getGame().i18n.localize("PILLARS.Seasons"),
        icon: 'fas fa-book',
        onclick: (ev) => {
          new BookOfSeasons(this.actor).render(true);
        },
      });
    }
    buttons.unshift({
      class: 'configure',
      label: '',
      icon: 'fas fa-wrench',
      onclick: async (ev: JQuery.ClickEvent) => new ActorConfigure(this.actor).render(true),
    });
    return buttons;
  }

  /** @override */
  async getData(): Promise<PillarsActorSheetData> {
    const data = await super.getData();

    data.data = (data as unknown as ActorSheet.Data).data.data

    this.prepareSheetData(data);
    this.formatTooltips(data);

    return data;
  }

  prepareSheetData(sheetData: PillarsActorSheetData) {
    sheetData.items = this.constructItemLists(sheetData);
    sheetData.effects = this.constructEffectLists(sheetData);
    this._setPowerSourcePercentage(sheetData);
    //this._createWoundsArrays(sheetData : PillarsSheetData)
    if (this.actor.type == 'character') {
      this._enrichKnownConnections(sheetData);
      this._createDeathMarchArray(sheetData);
    }

    this._createHealthArray(<ActorHealthSheetData>sheetData.data.health);
    this._createEnduranceArray(<ActorEnduranceSheetData>sheetData.data.endurance);
    this._createSoakArray(sheetData);
  }

  formatTooltips(data: PillarsActorSheetData) {
    let tooltips = foundry.utils.deepClone(this.actor.data.flags.tooltips);
    data.tooltips = foundry.utils.deepClone(this.actor.data.flags.tooltips) as unknown as typeof data.tooltips;
    for (let def in data.tooltips.defenses) data.tooltips.defenses[<Defense>def] = tooltips.defenses[<Defense>def].join(' + ').replaceAll('+ -', '- ');
    data.tooltips.health.max = tooltips.health.max.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.endurance.max = tooltips.endurance.max.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.initiative.value = tooltips.initiative.value.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.stride.value = tooltips.stride.value.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.run.value = tooltips.run.value.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.toughness.value = tooltips.toughness.value.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.damageIncrement.value = tooltips.damageIncrement.value.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.health.threshold.bloodied = tooltips.health.threshold.bloodied.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.health.threshold.incap = tooltips.health.threshold.incap.join(' + ').replaceAll('+ -', '- ');
    data.tooltips.endurance.threshold.winded = tooltips.endurance.threshold.winded.join(' + ').replaceAll('+ -', '- ');

    for (let type in data.tooltips.soak) data.tooltips.soak[<SoakType>type] = tooltips.soak[<SoakType>type].join(' + ').replaceAll('+ -', '- ');
  }

  constructItemLists(sheetData: PillarsActorSheetData): SheetItemData {
    let items: SheetItemData = <SheetItemData>{};

    items.attributes = { benefits: [], hindrances: [] };
    items.attributes.benefits = sheetData.actor.getItemTypes(ItemType.attribute).filter((i) => i.category?.value == 'benefit');
    items.attributes.hindrances = sheetData.actor.getItemTypes(ItemType.attribute).filter((i) => i.category?.value == 'hindrance');

    items.skills = sheetData.actor.getItemTypes(ItemType.skill);
    items.traits = sheetData.actor.getItemTypes(ItemType.trait);
    items.powers = sheetData.actor.getItemTypes(ItemType.power).filter((i) => !i.embedded?.item);
    items.embeddedPowers = sheetData.actor.getActiveEmbeddedPowers();
    items.powerSources = sheetData.actor.getItemTypes(ItemType.powerSource);

    items.injuries = sheetData.actor.getItemTypes(ItemType.injury);
    items.backgrounds = sheetData.actor.getItemTypes(ItemType.background);
    items.settings = sheetData.actor.getItemTypes(ItemType.setting);
    items.connections = sheetData.actor.getItemTypes(ItemType.connection);
    items.reputations = sheetData.actor.getItemTypes(ItemType.reputation);

    items.inventory = this.constructInventory(sheetData);

    items.equipped = {
      meleeWeapons: items.inventory.weapons.items.filter((i) => i.equipped?.value && i.isMelee),
      rangedWeapons: items.inventory.weapons.items.filter((i) => i.equipped?.value && i.isRanged),
      armor: items.inventory.armor.items.filter((i) => i.equipped?.value),
      shields: items.inventory.shields.items.filter((i) => i.equipped?.value),
    };
    return items;
  }

  constructInventory(sheetData: PillarsActorSheetData): InventorySheetData {
    let inventory = {
      weapons: {
        label: 'Weapons',
        type: 'weapon',
        items: sheetData.actor.getItemTypes(ItemType.weapon),
      },
      armor: {
        label: 'Armor',
        type: 'armor',
        items: sheetData.actor.getItemTypes(ItemType.armor),
      },
      shields: {
        label: 'Shields',
        type: 'shield',
        items: sheetData.actor.getItemTypes(ItemType.shield),
      },
      tools: {
        label: 'Tools',
        type: 'equipment',
        items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.category?.value == 'tool'),
      },
      gear: {
        label: 'Gear',
        type: 'equipment',
        items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.category?.value == 'gear'),
      },
      grimoires: {
        label: 'Grimoires',
        type: 'equipment',
        items: sheetData.actor.getItemTypes(ItemType.equipment).filter((i) => i.category?.value == 'grimoire'),
      },
    };
    return inventory;
  }

  constructEffectLists(sheetData: PillarsActorSheetData): SheetEffectData {
    let effects: SheetEffectData = <SheetEffectData>{};

    effects.temporary = sheetData.actor.effects.filter((i) => i.isTemporary && !i.data.disabled);
    effects.disabled = sheetData.actor.effects.filter((i) => i.data.disabled);
    effects.passive = sheetData.actor.effects.filter((i) => !i.isTemporary && !i.data.disabled);

    return effects;
  }

  constructPowerDisplay(sheetData: PillarsActorSheetData) {
    let game = getGame();

    sheetData.items.powers.forEach((p) => {
      if (p.data.type == "power")
      {
        let lowestKey = Object.keys(p.data.groups)
          .filter((i) => i)
          .sort((a, b) => a > b ? 1 : -1)[0] || game.i18n.localize("Default");
        p.data.display = p.data.groups[lowestKey];
      }
    })
  }
      


  _createSoakArray(sheetData: PillarsActorSheetData) {
    let soakValues = sheetData.data.soak;

    sheetData.soaks = {
      physical: {
        total: soakValues.physical + soakValues.base,
        show: soakValues.physical > 0,
        img: 'icons/svg/sword.svg',
      },
      burn: {
        total: soakValues.burn + soakValues.base,
        show: soakValues.burn > 0,
        img: 'icons/svg/fire.svg',
      },
      freeze: {
        total: soakValues.freeze + soakValues.base,
        show: soakValues.freeze > 0,
        img: 'icons/svg/frozen.svg',
      },
      corrode: {
        total: soakValues.corrode + soakValues.base,
        show: soakValues.corrode > 0,
        img: 'icons/svg/acid.svg',
      },
      shock: {
        total: soakValues.shock + soakValues.base,
        show: soakValues.shock > 0,
        img: 'icons/svg/lightning.svg',
      },
    };
  }

  _enrichKnownConnections(sheetData: PillarsActorSheetData) {
    if (sheetData.actor.data.type == 'character') {
      let connections = sheetData.actor.knownConnections!.value;
      sheetData.KnownConnections = connections.map((i) => {
        let actor = getGame().actors!.getName(i.name);
        return {
          name: i.name,
          img: actor ? actor.data.token.img || '' : '',
          id: actor ? actor.id : '',
        };
      });
    }
  }

  _createHealthArray(data: ActorHealthSheetData): void {
    let healthBonus, healthPenalty;
    if (data.modifier > 0) healthBonus = data.modifier;
    else healthPenalty = Math.abs(data.modifier);

    // .map is necessary, without it, all elements in the array point to the same object instance
    data.array = new Array(data.max).fill(undefined).map(i => {return {state : 0}}); 
    if (healthBonus) data.array = data.array.concat(new Array(healthBonus).fill(undefined).map(i => {return {state : 0, bonus: true}}))
    else if (healthPenalty) data.array = data.array.slice(healthPenalty);

    let deathBonus, deathPenalty;
    if (data.death.modifier > 0) deathBonus = data.death.modifier;
    else deathPenalty = Math.abs(data.death.modifier);

    if (deathBonus) data.array = data.array.concat(new Array(data.death.modifier).fill(undefined).map(i => {return {state : 0, bonus: true}}));
    else if (deathPenalty) {
      let counter = 0;
      for (let i = data.array.length - 1; i >= 0 && counter < deathPenalty; i--) {
        data.array[i]!.state = -1;
        counter++;
      }
    }

    data.array.forEach((e, i) => {
      if (i < data.value) e.state = 1;
    });

    if (data.wounds) {
      data.array.forEach((e, i) => {
        if (i < data.wounds.value) e.state = 2;
      });
    }
  }

  _createEnduranceArray(data: ActorEnduranceSheetData): void {
    // .map is necessary, without it, all elements in the array point to the same object instance
    data.array = new Array(data.max).fill(undefined).map(i => {return {state : 0}}); 
    if (data.bonus) data.array = data.array.concat(new Array(data.bonus).fill(undefined).map(i => {return { bonus: true, state: 0 }}))
    if (data.penalty) {
      let penaltyCounter = 0;
      for (let i = data.array.length - 1; i >= 0 && penaltyCounter < data.penalty; i--) {
        data.array[i]!.state = -1;
        penaltyCounter++;
      }
    }

    data.array.forEach((e, i) => {
      if (i < data.value) e.state = 1;
    });
  }

  _createDeathMarchArray(sheetData: PillarsActorSheetData): void {
    if (this.actor.type == 'character') {
      let marchVal = (<PreparedPillarsCharacterData>sheetData.data).life.march;
      sheetData.deathMarch = [];

      for (let i = 0; i < 7; i++) {
        if (i + 1 <= marchVal) sheetData.deathMarch.push(`<i class="far fa-check-square"></i>`);
        else sheetData.deathMarch.push(`<i class="far fa-square"></i>`);
      }

      if (marchVal != 7) sheetData.deathMarch[6] = `<i style="opacity:0.2" class="fas fa-skull"></i>`;
      else sheetData.deathMarch[6] = `<i class="fas fa-skull"></i>`;
    }
  }

  _setPowerSourcePercentage(sheetData: PillarsActorSheetData) {
    let sources = sheetData.items.powerSources;
    sources.forEach((s) => {
      s.pool!.pct = Math.clamped((s.pool!.current / s.pool!.max) * 100, 0, 100);
    });
  }

  async _dropdown(event: JQuery.MouseUpEvent, dropdownData : {text: string, groups? : PowerGroups}) {
    let dropdownHTML = '';
    event.preventDefault();
    let li = $(event.currentTarget!).parents('.item');
    // Toggle expansion for an item
    if (li.hasClass('expanded')) {
      // If expansion already shown - remove
      let summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      // Add a div with the item summary belowe the item
      let div;
      if (!dropdownData) {
        return;
      } else {
        dropdownHTML = `<div class="item-summary">${TextEditor.enrichHTML(dropdownData.text)}`;
      }
      if (dropdownData.groups) {
        let groups = `<div class='power-groups'>`;
        for (let g in dropdownData.groups) {
          let html = await renderTemplate('systems/pillars-of-eternity/templates/partials/power-group.html', { group: dropdownData.groups[g], groupId: g });
          groups = groups.concat(html);
        }
        dropdownHTML = dropdownHTML.concat(groups);
      }
      dropdownHTML += '</div>';
      div = $(dropdownHTML);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

  _getSubmitData(updateData = {}) {
    this.actor.overrides = {};
    let data = super._getSubmitData(updateData);
    data = diffObject(flattenObject(this.actor.toObject(false)), data);
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    $('input[type=text]').focusin(function () {
      $(this).select();
    });

    $('input[type=number]').focusin(function () {
      $(this).select();
    });

    html.find('.item-edit').on('click', this._onItemEdit.bind(this));
    html.find('.item-delete').on('click', this._onItemDelete.bind(this));
    html.find('.item-create').on('click', this._onItemCreate.bind(this));
    html.find('.item-post').on('click', this._onPostItem.bind(this));
    html.find('.effect-create').on('click', this._onEffectCreate.bind(this));
    html.find('.effect-edit').on('click', this._onEffectEdit.bind(this));
    html.find('.effect-delete').on('click', this._onEffectDelete.bind(this));
    html.find('.effect-toggle').on('click', this._onEffectToggle.bind(this));
    html.find('.sheet-checkbox').on('click', this._onCheckboxClick.bind(this));
    html.find('.open-info').on('click', this._onInfoClick.bind(this));
    html.find('.add-wound').on('click', this._onWoundClick.bind(this));
    html.find('.subtract-wound').on('click', this._onWoundClick.bind(this));
    html.find('.item-dropdown.item-control').on('mouseup', this._onDropdown.bind(this));
    html.find('.item-dropdown h4').on('mouseup', this._onDropdown.bind(this));
    html.find('.item-dropdown-alt h4').on('mouseup', this._onDropdownAlt.bind(this));
    html.find('.item-special').on('mouseup', this._onSpecialClicked.bind(this));
    html.find('.item-property').on('change', this._onEditItemProperty.bind(this));
    html.find('.skill-roll').on('click', this._onSkillRoll.bind(this));
    html.find('.roll-untrained').on('click', this._onUntrainedSkillClick.bind(this));
    html.find('.weapon-roll').on('click', this._onWeaponRoll.bind(this));
    html.find('.power-roll').on('click', this._onPowerRoll.bind(this));
    html.find('.property-counter').on('mouseup', this._onCounterClick.bind(this));
    html.find('.create-connection').on('click', this._onCreateConnection.bind(this));
    html.find('.edit-connection').on('click', this._onEditConnection.bind(this));
    html.find('.delete-connection').on('click', this._onDeleteConnection.bind(this));
    html.find('.connection-name').on('click', this._onConnectionClick.bind(this));
    html.on("click", '.power-target', this._onPowerTargetClick.bind(this));
    html.find('.restore-pool').on('click', this._onRestorePoolClick.bind(this));
    html.find('.sheet-roll').on('click', this._onSheetRollClick.bind(this));
    //html.on('click', '.damage-roll', this._onDamageRollClick.bind(this));
    html.find('.roll-item-skill').on('click', this._onItemSkillClick.bind(this));
    html.find('.age-roll').on('click', this._onAgeRoll.bind(this));
    html.find('.roll-initiative').on('click', this._onInitiativeClick.bind(this));
    html.find('.setting').on('click', this._onSettingClick.bind(this));
    html.find('.displayGroup').on('click', this._onDisplayGroupClick.bind(this));
    html.find('.box-click').on('click', this._onBoxClick.bind(this));
    html.find('.long-rest').on('click', this._onLongRestClick.bind(this));
    html.find('.embedded-value').on('mouseup', this._onEmbeddedValueClick.bind(this));
    html.find('.endurance-action').on('click', this._onEnduranceActionClick.bind(this));
    html.find('.item:not(".tab-select")').each((i, li) => {
      li.setAttribute('draggable', 'true');
      li.addEventListener('dragstart', this._onDragStart.bind(this), false);
    });
  }

  _onDrop(event: DragEvent) {
    try {
      let dragData = JSON.parse(event.dataTransfer?.getData('text/plain') || '');
      if (dragData.type == 'item') this.actor.createEmbeddedDocuments('Item', [dragData.payload]);
      else super._onDrop(event);
    } catch (e) {
      super._onDrop(event);
    }
  }

  _onItemEdit(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (itemId) return this.actor.items.get(itemId)?.sheet?.render(true);
  }
  _onItemDelete(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (!itemId) return;
    let game = getGame();

    Dialog.confirm({
      title: game.i18n.localize("PILLARS.DeleteItem"),
      content: `<p>${game.i18n.localize("PILLARS.DeleteConfirmation")}</p>`,
      yes: () => {this.actor.deleteEmbeddedDocuments('Item', [itemId!])},
      no: () => {},
      defaultYes: true
    })
  }
  _onItemCreate(event: JQuery.ClickEvent) {
    let type = $(event.currentTarget!).attr('data-type');
    let category = $(event.currentTarget!).attr('data-category');
    let createData: Record<string, unknown> = { name: `New ${getGame().i18n.localize(CONFIG.Item.typeLabels[type!]!)}`, type };
    if (type == 'power') createData['data.improvised.value'] = true;

    if (category) createData['data.category.value'] = category;
    return this.actor.createEmbeddedDocuments('Item', [createData]);
  }

  _onPostItem(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (itemId) return this.actor.items.get(itemId)?.postToChat();
  }

  async _onEffectCreate(ev: JQuery.ClickEvent) {
    let type = (<HTMLElement>ev.currentTarget).dataset['type'];
    let effectData: Record<string, unknown> = { label: getGame().i18n.localize("PILLARS.NewEffect"), icon: 'icons/svg/aura.svg' };
    if (type == 'temporary') {
      effectData['duration.rounds'] = 1;
    }

    let html = await renderTemplate('systems/pillars-of-eternity/templates/apps/quick-effect.html', effectData);
    let dialog = new Dialog({
      title: getGame().i18n.localize("PILLARS.QuickEffect"),
      content: html,
      buttons: {
        create: {
          label: 'Create',
          callback: (html) => {
            html = $(html);
            let mode = 2;
            let label = html.find('.label').val();
            let key = html.find('.key').val();
            let value = parseInt(html.find('.modifier').val()?.toString() || '');
            effectData.label = label;
            effectData.changes = [{ key, mode, value }];
            this.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
          },
        },
        skip: {
          label: 'Skip',
          callback: () => this.actor.createEmbeddedDocuments('ActiveEffect', [effectData]),
        },
      },
      render: (dlg) => {
        $(dlg).find('.label').select();
      },
    });
  }

  _onEffectEdit(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    this.object.effects.get(id!)?.sheet?.render(true);
  }

  _onEffectDelete(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    if (id) this.object.deleteEmbeddedDocuments('ActiveEffect', [id]);
  }

  _onEffectToggle(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    let effect = this.object.effects.get(id!);

    if (effect) effect.update({ disabled: !effect.data.disabled });
  }

  _onCheckboxClick(event: JQuery.ClickEvent) {
    let target = $(event.currentTarget!).attr('data-target');
    if (target == 'item') {
      target = $(event.currentTarget!).attr('data-item-target');
      let item = this.actor.items.get($(event.currentTarget!).parents('.item').attr('data-item-id') || '');
      if (item && target) return item.update({ [`${target}`]: !getProperty(item.data, target) });
    }
    if (target) return this.actor.update({ [`${target}`]: !getProperty(this.actor.data, target) });
  }

  _onInfoClick(event: JQuery.ClickEvent) {
    let type = $(event.currentTarget!).attr('data-type');
    let item = this.actor.getItemTypes(<ItemType>type!)[0];
    if (!item) return ui.notifications!.error(getGame().i18n.format("PILLARS.ErrorNoOwnedItem", {type}))
    else if (item) item.sheet!.render(true);
  }

  _onEditItemProperty(event: JQuery.ChangeEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let target = $(event.currentTarget!).attr('data-target');
    let value: string | number = (<HTMLInputElement>event.currentTarget!).value;
    let item = this.actor.items.get(itemId!);

    if (Number.isNumeric(value)) value = parseInt(value);

    if (item && target) return item.update({ [target]: value });
  }

  _onDropdown(event: JQuery.MouseUpEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) this._dropdown(event, item.dropdownData());
  }
  _onDropdownAlt(event: JQuery.MouseUpEvent) {
    if (event.button == 2) {
      let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
      let item = this.actor.items.get(itemId!);
      if (item) this._dropdown(event, item.dropdownData());
    }
  }

  _onCounterClick(event: JQuery.MouseUpEvent) {
    let multiplier = event.button == 0 ? 1 : -1;
    multiplier = event.ctrlKey ? multiplier * 10 : multiplier;

    let target = $(event.currentTarget!).attr('data-target');
    if (target == 'item') {
      target = $(event.currentTarget!).attr('data-item-target');
      let item = this.actor.items.get($(event.currentTarget!).parents('.item').attr('data-item-id')!);
      if (item && target) return item.update({ [`${target}`]: getProperty(item.data, target) + multiplier });
    }
    if (target) return this.actor.update({ [`${target}`]: getProperty(this.actor.data, target) + multiplier });
  }

  _onSpecialClicked(event: JQuery.MouseUpEvent) {
    let text = (<HTMLAnchorElement>event.currentTarget).text?.split('(')[0]?.trim();
    let specials = PILLARS_UTILITY.weaponSpecials()
    for (let special in specials) {
      if (specials[special as keyof typeof specials].label == text) return this._dropdown(event, { text: specials[special as keyof typeof specials].description });
    }
  }

  _onCreateConnection(event: JQuery.ClickEvent) {
    let connections = duplicate(this.actor.knownConnections?.value || []);
    if (connections) {
      connections.push({ name: getGame().i18n.format("PILLARS.NewConnection")});
      this.actor.update({ 'data.knownConnections.value': connections });
    }
  }

  _onEditConnection(event: JQuery.ClickEvent) {
    let index: number = parseInt($(event.currentTarget!).parents('.item').attr('data-index') || '');
    let connections = duplicate(this.actor.knownConnections?.value || []);
    let game = getGame()
    new Dialog({
      title: game.i18n.localize("PILLARS.ChangeConnection"),
      content: `
            <p>${game.i18n.localize("PILLARS.PromptConnectionNanme")}</p>
            <div class="form-group">
            <input type="text" name="connection" value=${connections[index]!.name}>
            </div>
            `,
      buttons: {
        submit: {
          label: 'Submit',
          callback: (dlg) => {
            let newName = ($(dlg).find("[name='connection']")[0] as HTMLInputElement).value || '';
            connections[index]!.name = newName;
            this.actor.update({ 'data.knownConnections.value': connections });
          },
        },
      },
      default: 'submit',
    }).render(true);
  }

  _onDeleteConnection(event: JQuery.ClickEvent) {
    let index = parseInt($(event.currentTarget!).parents('.item').attr('data-index') || '');
    let connections = duplicate(this.actor.knownConnections?.value || []);
    connections.splice(index, 1);
    this.actor.update({ 'data.knownConnections.value': connections });
  }

  _onConnectionClick(event: JQuery.ClickEvent) {
    let id = $(event.currentTarget!).parents('.item').attr('data-actor-id');
    if (id) getGame().actors!.get(id)?.sheet?.render(true);
  }

  _onPowerTargetClick(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let index = parseInt($(event.currentTarget!).attr('data-index') || "0");
    let item = this.actor.items.get(itemId!);
    if (item)
    {
      let groupId = item.displayGroupKey(); //$(event.currentTarget!).attr("data-group")
      PowerTemplate.fromItem(item, groupId!, index)?.drawPreview();
    }
  }

  _onRestorePoolClick(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) return item.update({ 'data.pool.current': item.pool?.max });
  }

  _onWoundClick(event: JQuery.ClickEvent) {
    let multiplier = (<HTMLAnchorElement>event.currentTarget).classList.contains('add-wound') ? 1 : -1;
    return this.actor.update({ 'data.health.wounds.value': this.actor.health.wounds.value + 1 * multiplier });
  }

  /* -------------------------------------------- */

  async _onSheetRollClick(event: JQuery.ClickEvent) {
    (await new Roll((<HTMLAnchorElement>event.target).text).roll()).toMessage({ speaker: this.actor.speakerData() });
  }


  // _onDamageRollClick(event: JQuery.ClickEvent) {
  //   let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
  //   let group = $(event.currentTarget!).attr('data-group');
  //   let item = this.actor.items.get(itemId!);
  //   if (item)
  //     new DamageDialog(item, undefined, Array.from(getGame().user!.targets)).render(true);
  // }

  _onInitiativeClick(event: JQuery.ClickEvent) {
    let game = getGame();
    new Dialog({
      title: 'Roll Initiative',
      content: '',
      buttons: {
        adv: {
          label: 'Advantaged',
          callback: () => {
            this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kh[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
          },
        },
        normal: {
          label: 'Normal',
          callback: () => {
            this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
          },
        },
        dis: {
          label: 'Disadvantaged',
          callback: () => {
            this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true, initiativeOptions: { formula: `{2d10, 1d20}kl[${game.i18n.localize("PILLARS.Initiative")}] + (1d12[${game.i18n.localize("PILLARS.Tiebreaker")}] / 100) + @initiative.value` } });
          },
        },
      },
      default: 'normal',
    }).render(true);
  }

  _onSettingClick(ev: JQuery.ClickEvent) {
    let itemId = $(ev.currentTarget!).attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) item.sheet!.render(true);
  }

  async _onSkillRoll(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) {
      let check = await this.actor.setupSkillCheck(item);
      await check.rollCheck();
      check.sendToChat();
    }
  }

  async _onUntrainedSkillClick(event: JQuery.ClickEvent) {
    let allSkills = getGame()
      .items!.contents.filter((i) => i.type == 'skill')
      .sort((a, b) => (a.name! > b.name! ? 1 : -1));
    let selectElement = `<select name="skill">`;
    for (let s of allSkills) selectElement += `<option name=${s.name}>${s.name}</option>`;
    selectElement += '</select>';
    let game = getGame()
    let dialog = new Dialog({
      title: game.i18n.localize("PILLARS.UntrainedSkill"),
      //content : `<div style="display:flex; align-items: center"><label style="flex: 1">Name of Skill</label><input style="flex: 1" type='text' name='skill'/></div>`,
      content: `<div style="display:flex; align-items: center"><label style="flex: 1">Skill</label>${selectElement}</div>`,
      buttons: {
        roll: {
          label: 'Roll',
          callback: async (dlg) => {
            let skill = ($(dlg).find("[name='skill']")[0] as HTMLInputElement)?.value;
            if (skill) {
              let check = await this.actor.setupSkillCheck(skill);
              await check.rollCheck();
              check.sendToChat();
            } else ui.notifications!.error(game.i18n.localize("PILLARS.PromptItemName"));
          },
        },
      },
      default: 'roll',
      render: (dlg) => {
        $(dlg).find('select')[0]?.focus();
      },
    });
  }

  async _onWeaponRoll(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let check = await this.actor.setupWeaponCheck(itemId!);
    await check.rollCheck();
    check.sendToChat();
  }

  async _onPowerRoll(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let check = await this.actor.setupPowerCheck(itemId!);
    await check.rollCheck();
    check.sendToChat();
  }

  async _onItemSkillClick(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    let skill = this.actor.items.getName(item?.skill?.value || "");
    if (!skill) return ui.notifications!.warn(getGame().i18n.format("PILLARS.ErrorSKillNotFound", {name : item?.skill?.value}))
    let check = await this.actor.setupSkillCheck(skill);
    await check.rollCheck();
    check.sendToChat();
  }

  async _onAgeRoll(event: JQuery.ClickEvent) {
    let check = await this.actor.setupAgingRoll();
    await check?.rollCheck();
    check?.sendToChat();
  }

  _onDisplayGroupClick(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    let groupIndex: number | string = <number | string>item?.getFlag('pillars-of-eternity', 'displayGroup');
    if (item?.data.type == "power")
    {
      if (!Number.isNumeric(groupIndex)) groupIndex = 0;
      else if (typeof groupIndex == 'number') groupIndex++;
      if (groupIndex >= Object.keys(item.data.groups).length) groupIndex = getGame().i18n.localize('Default');
    }

    return item?.setFlag('pillars-of-eternity', 'displayGroup', groupIndex);
  }

  _onBoxClick(ev: JQuery.ClickEvent) {
    let index = parseInt($(ev.currentTarget!).attr('data-index') || '');
    let target = $(ev.currentTarget!).attr('data-target');

    if (target) {
      let data = foundry.utils.deepClone(getProperty(this.actor.data, target));
      if (index + 1 == data.value) data.value = data.value - 1;
      else data.value = Number(index) + 1;

      this.actor.update({ [`${target}.value`]: data.value });
    }
  }

  _onLongRestClick(ev: JQuery.ClickEvent) {
    let game = getGame()
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

  _onEmbeddedValueClick(event: JQuery.MouseUpEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) {
      let embedded = duplicate(item.embedded);

      if (event.button == 0) embedded.uses.value++;
      else embedded.uses.value--;

      embedded.uses.value = Math.clamped(embedded.uses.value, 0, embedded.uses.max);

      item.update({ 'data.embedded': embedded });
    }
  }

  _onEnduranceActionClick(ev: JQuery.ClickEvent) {
    this.actor.enduranceAction(<'exert' | 'breath'>(<HTMLAnchorElement>ev.currentTarget).dataset.type);
  }
}
