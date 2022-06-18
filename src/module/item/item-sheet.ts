import { ActiveEffectDataConstructorData, ActiveEffectDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { ItemDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import {  PillarsItemSystemData } from '../../global';
import { getGame } from '../../pillars';
import { hasEmbeddedPowers, ItemType } from '../../types/common';
import { EmbeddedPower, PowerBaseEffect, PowerDamage, PowerDuration, PowerHealing, PowerMisc, PowerRange, PowerSummon, PowerTarget } from '../../types/powers';
import { PillarsActor } from '../actor/actor-pillars';
import ItemSpecials from '../apps/item-specials';
import PillarsActiveEffect from '../system/pillars-effect';
import { PillarsItem } from './item-pillars';

interface PillarsItemSheetData extends Omit<ItemSheet.Data, 'data'> {
  data: PillarsItemSystemData;
  powerEffects : {conditions : ActiveEffectDataConstructorData[], item : PillarsActiveEffect[]}
  martialSkills : PillarsItem[],
  allowEmbeddedPowers : boolean,
  possibleBonds : PillarsActor[]
}

/**
 * Extend the basic ItemSheet with for Pillars
 * @extends {ItemSheet}
 */
export class PillarsItemSheet extends ItemSheet<ItemSheet.Options, PillarsItemSheetData> {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['pillars-of-eternity', 'sheet', 'item'],
      width: 550,
      height: 534,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.content', initial: 'details' }],
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
      scrollY: ['.content', '.details'],
    });
  }

  get template() {
    return `systems/pillars-of-eternity/templates/item/item-${this.item.type}-sheet.html`;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if (this.item.isOwner) {
      buttons.unshift({
        label: getGame().i18n.localize("PILLARS.Post"),
        class: 'post',
        icon: 'fas fa-comment',
        onclick: this.item.postToChat,
      });
    }
    return buttons;
  }

  /** @override */
  async getData(): Promise<PillarsItemSheetData> {
    const data = await super.getData();

    data.data = (data as unknown as ItemSheet.Data).data.data;

    if (this.item.type == 'power' && this.item.target?.length) {
      this.item.target.forEach((target) => (target.subchoices = getProperty(getGame().pillars.config, `power${target.value[0]?.toUpperCase() + target.value.slice(1)}s`)))
      data.powerEffects = { conditions: foundry.utils.deepClone(CONFIG.statusEffects), item : []};
      if (this.item.effects.size) data.powerEffects.item = Array.from(this.item.effects);
    }

    if (this.item.type == 'weapon') {
      data.martialSkills = getGame().items!.contents.filter((i) => i.type == 'skill' && i.category?.value == 'martial');
      if (this.item.isOwned) data.martialSkills = data.martialSkills.concat(this.item.actor!.getItemTypes(ItemType.skill).filter((i) => i.category?.value == 'martial'));
    }

    if (this.item.type == "bond")
    {
      data.possibleBonds = getGame().actors!.contents.filter((i) => (i.hasPlayerOwner || i.data.token.disposition > 0) && i.id != this.id);
    }

    if (hasEmbeddedPowers(this.item.data.type)) data.allowEmbeddedPowers = true;
    return data;
  }

  async _onDrop(ev: DragEvent) {
    let dragData = JSON.parse(ev.dataTransfer?.getData('text/plain') || '');
    let dropItem = await PillarsItem.fromDropData(dragData); // TODO: test this
    let itemData = dragData.data || dropItem?.toObject();

    if (itemData && itemData.type === 'power' && hasEmbeddedPowers(this.item)) {
      return this.handleEmbeddedPowerDrop(itemData);
    }
    if (this.item.type == 'power' && itemData && ['weapon', 'equipment', 'armor', 'shield'].includes(itemData.type)) {
      return this.handleSummonedItem(itemData);
    }

    return super._onDrop(ev);
  }

  async handleEmbeddedPowerDrop(power: EmbeddedPower) {
    if (this.item.type == 'equipment' && this.item.category?.value == 'grimoire' && power.data.source.value != 'arcana')
      return ui.notifications?.error(getGame().i18n.localize("PILLARS.OnlyArcanaInGrimoire"))
    if (this.item.type == 'equipment' && this.item.category?.value == 'grimoire') power.data.embedded.spendType = 'source';

    // If drag item was an owned power already, add embedded data to it
    let ownedPower: PillarsItem | undefined;
    if (this.item.isOwned && this.actor!.items.get(power._id!)) {
      ownedPower = this.actor!.items.get(power._id!);
      power.ownedId = ownedPower?.id!;
    } else if (this.item.isOwned) {
      // If drag item was not owned, but the drop item is, add the drag item to the actor
      ownedPower = (await this.actor!.createEmbeddedDocuments('Item', [{ ...power }]))[0] as PillarsItem;
      power.ownedId = ownedPower?.id!;
    }

    let powers = foundry.utils.deepClone(this.item.powers) || []; // TODO test this
    powers.push(power);
    this.item.update({ 'data.powers': powers }).then((item) => {
      if (ownedPower) ownedPower.update({ 'data.embedded.item': item?.id, 'data.embedded.spendType': 'source' });
    });
  }

  handleSummonedItem(itemData: ItemDataConstructorData) {
    let summons = foundry.utils.deepClone(this.item.summons); // TODO test this
    summons?.push({ group: '', data: itemData });
    this.item.update({ 'data.summons': summons });
  }

  /** @override */
  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);
    if (!this.options.editable) return;

    $('input[type=text]').on("focusin", function () {
      $(this).select();
    });

    $('input[type=number]').on("focusin", function () {
      $(this).select();
    });

    html.find('.item-specials').on('click', this._onConfigureSpecialsClick.bind(this));
    html.find('.csv-input').on('change', this._onCSVInputChange.bind(this));
    html.find('.add-power-effect').on('change', this._onAddPowerEffect.bind(this));
    html.find('.effect-create').on('click', this._onEffectCreate.bind(this));
    html.find('.effect-delete').on('click', this._onEffectDelete.bind(this));
    html.find('.effect-edit').on('click', this._onEffectEdit.bind(this));
    html.find('.add-damage').on('click', this._onAddDamage.bind(this));
    html.find('.add-property').on('click', this._onAddProperty.bind(this));
    html.find('.remove-property').on('click', this._onRemoveProperty.bind(this));
    html.find('.summon a').on('click', this._onSummonClick.bind(this));
    html.find('.power-property').on('change', this._onPowerPropertyChange.bind(this));
    html.find('.power-edit').on('click', this._onEditPower.bind(this));
    html.find('.power-delete').on('click', this._onPowerDelete.bind(this));
    html.find('.embedded-power-edit').on('change', this._onEditEmbeddedPower.bind(this));
  }

  _onConfigureSpecialsClick(ev: JQuery.ClickEvent) {
    new ItemSpecials(this.item).render(true);
  }

  _onCSVInputChange(ev: JQuery.ChangeEvent) {
    let target = $(ev.currentTarget).attr('data-target');
    let text = ev.target.value as string;
    let array = text.split(',').map((i) => i.trim());

    if (target) return this.item.update({ [target]: array });
  }

  _onAddPowerEffect(ev: JQuery.ChangeEvent) {
    let target = $(ev.currentTarget).attr('data-target'); // TODO test this
    let text = ev.target.value as string;
    let array = text.split(',').map((i) => i.trim());
    if (target) return this.item.update({ [target]: array });
  }

  async _onEffectCreate(ev: JQuery.ClickEvent) {
    let game = getGame();
    if (this.item.isOwned)
      return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCreateEffectOnOwnedItem"))

    let effectData: ActiveEffectDataSource = <ActiveEffectDataSource>{ label: this.item.name!, icon: this.item.data.img || 'icons/svg/aura.svg' };
    let html = await renderTemplate('systems/pillars-of-eternity/templates/apps/quick-effect.html', effectData);
    new Dialog({
      title: game.i18n.localize("PILLARS.QuickEffect"),
      content: html,
      buttons: {
        create: {
          label: game.i18n.localize("PILLARS.Create"),
          callback: (dlg: JQuery<HTMLElement> | HTMLElement) => {
            let mode = 2;
            let html = $(dlg)
            let label = html.find('.label').val()?.toString()!;
            let key = html.find('.key').val()?.toString()!;
            let value = html.find('.modifier').val()?.toString()!;
            effectData.label = label?.toString() || effectData.label;
            effectData.changes = [{ key, mode, value, priority: undefined }];
            this.item.createEmbeddedDocuments('ActiveEffect', [effectData]);
          },
        },
        skip: {
          label: game.i18n.localize("PILLARS.Skip"),
          callback: () => this.item.createEmbeddedDocuments('ActiveEffect', [effectData]),
        },
      },
      render: (dlg: HTMLElement | JQuery<HTMLElement>) => {
        $(dlg).find('.label').trigger('select'); // TODO test this
      },
    });
  }

  _onEffectDelete(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget).parents('.item').attr('data-effect-id') ;
    return this.item.deleteEmbeddedDocuments('ActiveEffect', [id || ""]);
  }

  _onEffectEdit(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget).parents('.item').attr('data-effect-id');
    this.item?.effects?.get(id!)?.sheet?.render(true);
  }

  _onAddDamage(ev: JQuery.ClickEvent) {
    if (this.item.damage) {
      let damage = foundry.utils.deepClone(this.item.damage.value);
      damage.push(<PowerDamage>{
        label: '',
        base: '',
        crit: '',
        defense: 'Deflection',
        type: 'Physical',
      });
      return this.item.update({ 'data.damage.value': damage });
    }
  }

  _onAddProperty(ev: JQuery.ClickEvent) {
    let property = $(ev.currentTarget).parents('.form-group').attr('data-property')!;
    if (property == 'summons') return ui.notifications!.notify(getGame().i18n.localize("PILLARS.DragDropSummonPrompt"));

    let data = foundry.utils.deepClone(getProperty(this.item, property));
    data.push(PillarsItem.baseData[property as keyof typeof PillarsItem.baseData]);
    return this.item.update({ [`data.${property}`]: data });
  }

  _onRemoveProperty(ev: JQuery.ClickEvent) {
    let property = $(ev.currentTarget).parents('.form-group').attr('data-property')!;
    let index = $(ev.currentTarget).parents('.property-inputs').attr('data-index');
    let data = foundry.utils.deepClone(getProperty(this.item, property));
    data.splice(index, 1);
    return this.item.update({ [`data.${property}`]: data });
  }

  _onSummonClick(ev: JQuery.ClickEvent) {
    let property = $(ev.currentTarget).parents('.form-group').attr('data-property')!;
    let index = $(ev.currentTarget).parents('.property-inputs').attr('data-index');
    let array = foundry.utils.deepClone(getProperty(this.item, property)) as PowerSummon[];
    if (index) {
      let summon = array[parseInt(index)];
      if (summon) new PillarsItem(summon.data).sheet?.render(true, { editable: false });
    }
  }

  _onPowerPropertyChange(ev: JQuery.ChangeEvent) {
    let el = ev.currentTarget;
    let property = $(el).parents('.form-group').attr('data-property')!;
    let index = $(el).parents('.property-inputs').attr('data-index');
    let data = foundry.utils.deepClone(getProperty(this.item, property)) as (PowerTarget & PowerRange & PowerDuration & PowerHealing & PowerMisc & PowerDamage & PowerBaseEffect)[];
    let target = $(ev.currentTarget).attr('data-path');

    let value : string | number = ev.currentTarget.value;
    if (Number.isNumeric(value)) value = parseInt(value.toString());

    if (index && target) {
      let propertyData = data[parseInt(index)]!

      setProperty(propertyData, target, value) // TODO TEST
      return this.item.update({ [`data.${property}`]: data });
    }
  }

  _onEditPower(ev: JQuery.ClickEvent) {
    let index = Number($(ev.currentTarget).parents('.item').attr('data-index'));
    if (this.item.powers)
    {
      let power = this.item.powers[index];
      if (power?.ownedId) this.actor?.items.get(power.ownedId)?.sheet?.render(true);
      else new PillarsItemSheet(new PillarsItem(power as ItemDataConstructorData, { embedded: { object: this.item, index } })).render(true, { editable: false });
    }
  }

  _onPowerDelete(ev: JQuery.ClickEvent) {
    let index = Number($(ev.currentTarget).parents('.item').attr('data-index'));
    if (this.item.powers)
    {
      let powers = foundry.utils.deepClone(this.item.powers); // TODO test this
      if (powers[index]?.ownedId && this.item.isOwned) this.actor?.updateEmbeddedDocuments('Item', [{ _id: powers[index]?.ownedId, 'data.embedded.item': null }]);
      
      powers.splice(index, 1);
      return this.item.update({ 'data.powers': powers });
    }
  }

  _onEditEmbeddedPower(ev: JQuery.ChangeEvent) {
    let index = Number($(ev.currentTarget).parents('.item').attr('data-index'));
    let path = ev.currentTarget.dataset.path;
    let powers = foundry.utils.deepClone(this.item.powers);
    let value = Number.isNumeric(ev.currentTarget.value) ? Number(ev.currentTarget.value) : ev.currentTarget.value;

    if (powers)
    {
      setProperty(powers[index]?.data!, path, value);
      if (path == 'embedded.uses.max') setProperty(powers[index]?.data!, 'embedded.uses.value', value);
      
      // Update owned power if it exists
      if (powers[index]?.ownedId) {
        let ownedItem = this.actor?.items.get(powers[index]?.ownedId!);
        if (ownedItem) ownedItem.update(powers[index]);
      }
      
      return this.item.update({ 'data.powers': powers });
    }
  }
}
