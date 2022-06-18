import {  DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';
import { ItemDataConstructorData, ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { PowerSource } from '../../global';
import { getGame } from '../../pillars';
import { DamageType, Defense, hasCategory, hasEmbeddedPowers, hasXP, isEquippable, isPhysical, isUsableItem, ItemType } from '../../types/common';
import { ItemChatData,  WeaponSpecialData } from '../../types/items';
import { PowerBaseEffect, PowerDamage, PowerDisplay, PowerDuration, PowerGroup, PowerGroups, PowerHealing, PowerMisc, PowerRange, PowersConstructorContext, PowerTarget } from '../../types/powers';
import { PILLARS } from '../system/config';
import PILLARS_UTILITY from '../system/utility';
/**
 * Extend the FVTT Item class for Pillars functionality
 * @extends {ItemSheet}
 */

declare global {
  interface DocumentClassConfig {
    Item: typeof PillarsItem;
  }
}

export class PillarsItem extends Item {


  constructor(data?: ItemDataConstructorData | undefined, context?: PowersConstructorContext | undefined){
    super(data, context);
  }


  async _preUpdate(updateData: ItemDataConstructorData, options: DocumentModificationOptions, user: User): Promise<void> {
    await super._preUpdate(updateData, options, user);

    // Clamp the shield health to between max and 0
    if (this.type == 'shield' && hasProperty(updateData, 'data.health.current'))
      setProperty(updateData, 'data.health.current', Math.clamped(getProperty(updateData, 'data.health.current'), 0, this.health?.max || 0));

    if (this.data.type == "bond" && hasProperty(updateData, "data.partner"))
    {
      let id = getProperty(updateData, "data.partner")
      let actor = getGame().actors?.get(id);
      if (actor)
        updateData.img = actor.data.token.img
    }

    // Convenience feature to set the power source name to the same as the newly selected source
    if (this.type == 'powerSource' && hasProperty(updateData, 'data.source.value'))
      updateData.name = PILLARS.powerSources[getProperty(updateData, 'data.source.value') as keyof typeof PILLARS.powerSources];

    if (getProperty(updateData, 'data.category.value') == 'grimoire') {
      // Check for non-arcana powers before switiching to Grimoire type
      if (!(await this._checkGrimoirePowers())) {
        setProperty(updateData, 'data.category.value', this.category?.value);
        return;
      }

      // Change all embedded powers to "source"
      let powers = this.powers;
      if (powers) {
        powers.forEach((p) => (p.data.embedded.spendType = 'source'));

        setProperty(updateData, 'data.powers', powers);

        // If this is owned, set all owned powers (given by this item) to "source"
        if (this.isOwned)
          this.actor!.updateEmbeddedDocuments(
            'Item',
            powers
              .map((p) => {
                return {
                  _id: p.ownedId,
                  'data.embedded.spendType': 'source',
                };
              })
              .filter((p) => p)
          );
      }
    }
  }

  async _preCreate(data: ItemDataConstructorData, options: DocumentModificationOptions, user: User) {
    await super._preCreate(data, options, user);

    // Adding singleton items, if item of that type already exists, delete it
    if (this.isOwned && (this.type == 'species' || this.type == 'culture' || this.type == 'stock' || this.type == 'godlike')) {
      let item = this.actor!.items.find((i) => i.type == this.type && i.id != this.id);
      if (item) await item.delete();

      await this.actor!.update({ [`data.details.${this.type}`]: this.name });
    }
  }

  // Powers embedded in an item are created on the actor when the item is added, when the item is deleted, delete the embedded powers that were added.
  async _preDelete(options: DocumentModificationOptions, user: User) {
    if (this.isOwned && hasEmbeddedPowers(this)) {
      let embeddedPowers = this.actor!.getItemTypes(ItemType.power).filter((i) => i.embedded?.item == this.id);

      await this.actor!.deleteEmbeddedDocuments(
        'Item',
        embeddedPowers.map((i) => i.id!)
      );
    }
  }

  _onCreate(data: ItemDataSource, options: DocumentModificationOptions, user: string) {
    super._onCreate(data, options, user);

    // If the new item has embedded powers, add them to the actor
    if (this.isOwned && this.powers?.length && user == getGame().user!.id) {
      this.actor!.createEmbeddedDocuments(
        'Item',
        this.powers.map((p) => {
          p.data.embedded.item = this.id!;
          return { ...p };
        })
      ).then((items) => {
        // Add id of actual owned power to the parent flags
        this.update({
          'data.powers': this.powers?.map((p, i) => {
            p.ownedId = items[i]!.id;
            return p;
          }),
        });
      });
    }
  }

  _onUpdate(data: ItemDataSource, options: DocumentModificationOptions, user: string) {
    super._onUpdate(data, options, user);

    let embeddedParent = this.EmbeddedPowerParent;

    if (embeddedParent) {
      // TODO changed from duplicate to deepClone, test to see if it still works
      let parentPowers = foundry.utils.deepClone(embeddedParent.powers);

      let index = parentPowers!.findIndex((i) => i.ownedId == this.id);
      if (this.data.type == 'power') {
        let powerData = this.toObject() as PowerSource;
        powerData.ownedId = this.id!;
        parentPowers![index] = powerData;
        embeddedParent.update({ 'data.powers': parentPowers });
      }
    }
  }


  //#region Data Preparation
  prepareData() {
    super.prepareData();

    let prepareFunction : Function = (this[`prepare${this.type[0]!.toUpperCase() + this.type.slice(1)}` as keyof this]) as unknown as Function
    
    if (prepareFunction)
    {
      prepareFunction.bind(this)()
    }
  }

  prepareOwnedData() {
    let prepareOwnedFunction : Function = (this[`prepareOwned${this.type[0]!.toUpperCase() + this.type.slice(1)}` as keyof this]) as unknown as Function
    
    if (prepareOwnedFunction)
    {
      prepareOwnedFunction.bind(this)()
    }

    if (this.weight) {
      this.weight.value *= this.quantity?.value || 0;
    }
  }

  prepareWeapon() {}

  prepareSkill() {}

  preparePower() {
    if (this.data.type == 'power') this.data.groups = this.preparePowerGroups();

    if (this.level) {
      this.level.value = this.calculatePowerLevel();
      this.level.cost = this.improvised?.value ? this.level.value * 2 : this.level.value;
    }
  }

  prepareOwnedSkill() {
    this.xp!.rank = PILLARS_UTILITY.getSkillRank(this.xp!.value) + (this.modifier?.value || 0);
  }

  prepareOwnedReputation() {
    this.xp!.rank = PILLARS_UTILITY.getSkillRank(this.xp!.value) + (this.modifier?.value || 0);
  }

  prepareOwnedConnection() {
    this.xp!.rank = PILLARS_UTILITY.getSkillRank(this.xp!.value) + (this.modifier?.value || 0);
  }

  prepareOwnedBond() {
    this.xp!.rank = PILLARS_UTILITY.getSkillRank(this.xp!.value) + (this.modifier?.value || 0);
    if (this.data.type == "bond")
      this.data.active = this.xp!.value >= 15
  }

  prepareOwnedPowerSource() {
    if (this.data.type == 'powerSource') {
      // NPCs don't use xp, so use level directly
      if (this.actor!.type == 'character') this.xp!.level = PILLARS_UTILITY.getPowerSourceLevel(this.xp!.value);

      this.data.data.attack = PILLARS_UTILITY.getPowerSourceAttackBonus(this.xp!.level!);
      this.pool!.max = PILLARS_UTILITY.getPowerSourcePool(this.xp!.level!);
    }
  }

  //#endregion

  //#region General Functions
  async postToChat() {
    let chatData = <ItemChatData>this.dropdownData();

    chatData.item = this;

    let html = await renderTemplate('systems/pillars-of-eternity/templates/chat/post-item.html', chatData);
    let cardData = <ChatMessageDataConstructorData>{ content: html };
    if (this.actor) cardData.speaker = this.actor.speakerData();

    cardData.flags = {
      'pillars-of-eternity': {
        transfer: this.toObject(),
      },
    };
    ChatMessage.create(cardData);
  }

  dropdownData(): { text: string; groups?: PowerGroups } {
    let data = <ItemChatData>{ text: this.description.value };

    if (this.data.type === 'power') data.groups = this.data.groups;

    return data;

    //this[`_${this.type}DropdownData`]()
  }

  static _abstractToLevel(abstract: number) {
    let level = 0;
    if (abstract >= 26) level = 10;
    else if (abstract >= 24) level = 9;
    else if (abstract >= 22) level = 8;
    else if (abstract >= 20) level = 7;
    else if (abstract >= 18) level = 6;
    else if (abstract >= 16) level = 5;
    else if (abstract >= 14) level = 4;
    else if (abstract >= 12) level = 3;
    else if (abstract >= 10) level = 2;
    else if (abstract >= 8) level = 1;
    else level = 0;

    return level;
  }

  //#endregion

  //#region Power Functions

  // This is a nightmare please ignore
  preparePowerGroups(): PowerGroups {
    let groups: PowerGroups = {};
    try {
      let config = getGame().pillars.config;
      let groupIds: string[] = [];
      groupIds = groupIds.concat(this.target!.map((i) => i.group).filter((g) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.range!.map((i) => i.group).filter((g) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.duration!.map((i) => i.group).filter((g) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.damage!.value.map((i) => i.group).filter((g) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.base!.effects.map((i) => i.group).filter((g) => !groupIds.includes(g)));
      groupIds = groupIds.filter((i) => i || Number.isNumeric(i));
      groupIds.push('');

      for (let g of groupIds) {
        groups[g] = <PowerGroup>{};

        groups[g]!.target = this.target!.filter((i) => i.group == g);
        groups[g]!.range = this.range!.filter((i) => i.group == g);
        groups[g]!.duration = this.duration!.filter((i) => i.group == g);
        groups[g]!.damage = this.damage!.value.filter((i) => i.group == g);
        groups[g]!.effects = this.base!.effects.filter((i) => i.group == g);
        groups[g]!.healing = this.healing!.filter((i) => i.group == g);
        groups[g]!.misc = (this.misc as PowerMisc[]).filter((i) => i.group == g);

        groups[g]!.display = {
          target: '',
          range: '',
          duration: '',
          damage: '',
          effects: '',
          healing: '',
          misc: '',
        };

        groups[g]!.display.target = groups[g]!.target.reduce((prev: string[], current, index) => {
          prev.push(`<a class="power-target" data-group=${g} data-index=${index}>${this.getTargetDisplay(current)}</a>`);
          return prev;
        }, []).join(', ');

        groups[g]!.display.range = groups[g]!.range.reduce((prev: string[], current) => {
          prev.push(config.powerRanges[current.value as keyof typeof PILLARS.powerRanges]);
          return prev;
        }, []).join(', ');

        groups[g]!.display.duration = groups[g]!.duration.reduce((prev: string[], current) => {
          prev.push(config.powerDurations[current.value as keyof typeof PILLARS.powerDurations]);
          return prev;
        }, []).join(', ');

        groups[g]!.display.damage = groups[g]!.damage.reduce((prev: string[], current) => {
          let text = `${current.base} ${config.damageTypes[<DamageType>current.type]} @DAMAGES vs. ${config.defenses[<Defense>current.defense]}` + ' ';
          if (current.label) text += ' ' + current.label;

          if (current.type == 'endurance') text = text.replace('@DAMAGES', `(${getGame().i18n.localize("PILLARS.Endurance")})`);
          else text = text.replace('@DAMAGES', '');

          prev.push(text);
          return prev;
        }, []).join(', ');

        groups[g]!.display.effects = groups[g]!.effects.reduce((prev: string[], current) => {
          let text = '';
          if (current.defense && current.value)
            text = `${CONFIG.statusEffects.find((i) => i.id == current.value) ? CONFIG.statusEffects.find((i) => i.id == current.value)?.label : this.effects.get(current.value)?.label} vs. ${
              config.defenses[<Defense>current.defense]
            }`;
          else if (current.value)
            text = `${CONFIG.statusEffects.find((i) => i.id == current.value) ? CONFIG.statusEffects.find((i) => i.id == current.value)?.label : this.effects.get(current.value)?.label}`;

          if (current.text) text += ' ' + current.text;

          prev.push(text);
          return prev;
        }, []).join(', ');

        groups[g]!.display.healing = groups[g]!.healing.reduce((prev: string[], current) => {
          prev.push(`${current.value} ${current.type[0]?.toUpperCase() + current.type.slice(1)}`);
          return prev;
        }, []).join(', ');

        groups[g]!.display.misc = groups[g]!.misc.reduce((prev: string[], current) => {
          prev.push(current.value);
          return prev;
        }, []).join(', ');

        if (groups[g]!.display.damage) groups[g]!.display.damage = `<a class='damage-roll' data-group="${g}">${groups[g]!.display.damage}</a>`;
      }

      // assign any ungrouped value to any group that does not have the corresponding key
      for (let g of groupIds) {
        if (g) {
          for (let display in groups[g]!.display) {
            display = <keyof PowerDisplay>display;
            // dislike
            if (!groups[g]!.display[<keyof PowerDisplay>display] && groups['']) {
              groups[g]!.display[<keyof PowerDisplay>display] = groups[''].display[<keyof PowerDisplay>display];
            }
          }
        }
      }

      if (Object.keys(groups).length == 1 && groups['']) groups['Default'] = groups[''];
      delete groups[''];
    } catch (e) {
      console.error(getGame().i18n.format("PILLARS.ErrorOrganizingPowerGroups", {name : this.name}) + ": " + e);
      console.log(this);
    }
    return groups;
  }

  getTargetDisplay(target: PowerTarget) {
    let targetSubTypes = getGame().pillars.config[`power${target.value[0]?.toUpperCase() + target.value.slice(1)}s` as keyof typeof PILLARS];
    let targetDisplay = targetSubTypes[target.subtype as keyof typeof targetSubTypes] as string;
    if (!targetDisplay) targetDisplay = getGame().pillars.config.powerTargetTypes[target.value as keyof typeof PILLARS.powerTargetTypes];
    return targetDisplay;
  }

  calculatePowerLevel(): number {
    let level = 0;
    if (this.data.type == 'power') {
      try {
        let pl = 0;
        let values = getGame().pillars.config.powerLevelValues;

        for (let range of this.range!) pl += values.powerRanges[range.value as keyof typeof PILLARS.powerRanges] || 0;

        for (let target of this.target!) {
          let targetSubTypes = values[`power${target.value[0]?.toUpperCase() + target.value.slice(1)}s` as keyof typeof values];
          pl += targetSubTypes[target.subtype as keyof typeof targetSubTypes] || 0;
          pl += values.powerExclusions[target.exclusion as keyof typeof PILLARS.powerExclusions];
        }
        for (let duration of this.duration!) pl += values.powerDurations[duration.value as keyof typeof PILLARS.powerDurations];
        for (let summon of this.summons || []) pl += summon.modifier || 0;

        for (let misc of <PowerMisc[]>this.misc!) pl += misc.modifier || 0;

        pl += values.powerSpeeds[this.speed!.value as keyof typeof PILLARS.powerSpeeds];
        pl += this.base!.cost || 0;
        this.data.data.pl = pl;
        level = PillarsItem._abstractToLevel(pl) + (this.level?.modifier || 0);
      } catch (e) {
        console.log(getGame().i18n.format("PILLARS.ErrorPLCalculation", {name : this.name}) + ": " +  e);
      }
    }
    return level;
  }

  updateEmbeddedPower(index: number, updateData: Record<string, unknown>) {
    let powers = duplicate(this.powers || []);
    if (powers[index]) {
      mergeObject(powers[index]!, updateData, { overwrite: true });
      return this.update({ 'data.powers': powers });
    }
  }

  async _checkGrimoirePowers() {
    let powers = duplicate(this.powers || []);

    let game = getGame();
    let nonArcanaPowers = powers.filter((i) => i.data.source.value != 'arcana');
    if (nonArcanaPowers.length)
      return new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("PILLARS.RemoveArcanePowers"),
          content: game.i18n.format("PILLARS.PromptRemoveArcanePowers", {powers : nonArcanaPowers.map((i) => `<li>${i.name}</li>`).join('')}),
          buttons: {
            remove: {
              label: game.i18n.localize("PILLARS.Remove"),
              callback: async () => {
                let arcanaPowers = powers.filter((i) => i.data.source.value == 'arcana');
                arcanaPowers.forEach((p) => {
                  p.data.embedded.spendType == 'source';
                });
                await this.update({ 'data.powers': arcanaPowers });
                resolve(true);
              },
            },
            cancel: {
              label: game.i18n.localize('Cancel'),
              callback: () => {
                resolve(false);
              },
            },
          },
        }).render(true);
      });
    else return true;
  }

  //#endregion

  //#region Getters
  // @@@@@@@@ CALCULATION GETTERS @@@@@@@
  get isMelee() {
    return this.category?.value == 'smallMelee' || this.category?.value == 'mediumMelee' || this.category?.value == 'largeMelee';
  }

  get isRanged() {
    return this.category?.value == 'mediumRanged' || this.category?.value == 'largeRanged' || this.category?.value == 'grenade';
  }

  get specialList(): Record<string, WeaponSpecialData> {
    if (this.isMelee) return getGame().pillars.config.meleeSpecials;
    else if (this.isRanged) return getGame().pillars.config.rangedSpecials;
    else return {};
  }

  get canEquip() {
    return (this.type == 'equipment' && (this.wearable?.value || this.category?.value == 'grimoire')) || this.type == 'weapon' || this.type == 'armor' || this.type == 'shield';
  }

  // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

  get Category() {
    if (this.type == 'weapon') return getGame().pillars.config.weaponTypes[this.category?.value! as keyof typeof PILLARS.weaponTypes];
    if (this.type == 'skill') return getGame().pillars.config.skillTypes[this.category?.value! as keyof typeof PILLARS.skillTypes];
  }

  get Type() {
    return getGame().i18n.localize(CONFIG.Item.typeLabels[this.type] || '');
  }

  get Range() {
    return getGame().pillars.config.powerRanges[this.range?.find((i) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('range'))?.value! as keyof typeof PILLARS.powerRanges];
  }

  get Target() {
    try {
      let targetObj = this.target?.find((i) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('target'));
      if (!targetObj) return;
      let targetSubTypes = getGame().pillars.config[`power${targetObj!.value[0]!.toUpperCase() + targetObj.value.slice(1)}s` as keyof typeof PILLARS];
      let target = targetSubTypes[targetObj.subtype as keyof typeof targetSubTypes] as string;
      if (!target) target = getGame().pillars.config.powerTargetTypes[targetObj.value! as keyof typeof PILLARS.powerTargetTypes];

      return target;
    } catch (e) {
      console.error(getGame().i18n.localize("PILLARS.ErrorGettingPowerTarget"))
    }
  }
  get Duration() {
    return getGame().pillars.config.powerDurations[this.duration?.find((i) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('duration'))?.value as keyof typeof PILLARS.powerDurations];
  }
  get Speed() {
    return getGame().pillars.config.powerSpeeds[this.speed?.value as keyof typeof PILLARS.powerSpeeds];
  }
  get Exclusion() {
    return getGame().pillars.config.powerExclusions[this.target?.find((i) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('target'))?.exclusion as keyof typeof PILLARS.powerExclusions];
  }
  get Skill() {
    return this.actor?.getItemTypes(ItemType.skill).find((i) => i.name == this.skill?.value);
  }

  get SourceItem(): PillarsItem | undefined {
    if (!this.isOwned) return;
    if (this.EmbeddedPowerParent && this.EmbeddedPowerParent.category?.value != 'grimoire') {
      // If embedded and not in grimoire, get highest power source attack value
      return this.actor?.getItemTypes(ItemType.powerSource).sort((a, b) => (b.attack || 0) - (a.attack || 0))[0];
    }

    return this.actor?.items.find((i) => (i.type == 'powerSource' && i.source && i.source.value == this.source?.value) || false);
  }

  get EmbeddedPowerParent(): PillarsItem | undefined {
    if (this.isOwned && this.embedded) return this.actor!.items.get(this.embedded.item);
  }

  get Specials() {
    let specials = this.specialList;
    let notSkilledEnough = this.special?.value.filter((i) => this.isOwned && specials[i.name as keyof typeof specials]?.skilled && (!this.Skill || (this.Skill?.rank || 0) < 5));

    return this.special?.value.map((i) => {
      let display = this.specialList?.[i.name as keyof typeof specials]?.label;
      if (i.value) display += ` (${i.value})`;
      if (notSkilledEnough?.find((sp) => sp.name == i.name)) display = `<p style="text-decoration: line-through">${display}</p>`;
      return display;
    });
  }

  get EmbeddedDisplay() {
    let string = '';
    let game = getGame()
    if (this.embedded) {
      if (['encounter', 'longRest'].includes(this.embedded.spendType)) string += `${this.embedded.uses.value}/${this.embedded.uses.max} ${this.embedded.spendType == 'encounter' ? game.i18n.localize("PILLARS.EncounterAbbreviation") : game.i18n.localize("PILLARS.LongRestAbbreviation")}`;
      else if (this.embedded.spendType == 'charges') string += `${this.EmbeddedPowerParent?.powerCharges?.value}/${this.EmbeddedPowerParent?.powerCharges?.max}`;
      else if (this.embedded.spendType == 'source') {
        string += getGame().pillars.config.powerSources[this.source?.value as keyof typeof PILLARS.powerSources];
      }
      return string;
    }
  }

  get Soak() {
    if (this.soak && this.health) return Math.min(this.soak.value || 0, this.health.current || 0);
  }

  get Bond() {
    if (this.data.type == "bond" && this.partner)
    {
      return getGame().actors!.get(this.partner);
    }
  }

  displayGroupKey(type?: keyof PowerGroup): string | undefined {
    try {
      if (this.data.type == 'power') {
        let groupIndex: number = this.getFlag('pillars-of-eternity', 'displayGroup') as number;

        let group = Object.keys(this.data.groups)[groupIndex];
        let first = Object.keys(this.data.groups)
          .filter((i) => i)
          .sort((a, b): number => (a > b ? 1 : -1))[0];

        if (type && group) {
          if (group && this.data.groups[group] && (this.data.groups[group]![type] as Array<unknown>).length) return group;
          else if (first && this.data.groups[first] && (this.data.groups[first]![type] as Array<unknown>).length) return first;
          else return '';
        } else {
          if (group && Object.keys(this.data.groups[group] || {}).length) return group;
          else return first;
        }
      }
    } catch (e) {
      console.error(getGame().i18n.format("PILLARS.ErrorPowerGroupDisplayKey") + ": " + e);
      return '';
    }
    return '';
  }

  get currentDisplayGroup(): string | undefined {
    try {
      if (this.data.type == 'power') {
        let groupIndex: number = this.getFlag('pillars-of-eternity', 'displayGroup') as number;
        let group = Object.keys(this.data.groups)[groupIndex];
        return group;
      }
    } catch (e) {
      console.error(getGame().i18n.format("PILLARS.ErrorCurrentPowerGroupDisplayKey") + ": " + e);
    }
  }

  get specials() {
    let specials: { [key: string]: WeaponSpecialData } = {};
    this.special?.value?.forEach((sp) => {
      specials[sp.name] = this.specialList?.[sp.name]!;
      specials[sp.name]!.value = sp.value;
    });
    return specials;
  }

  get isEmbeddedPower(): boolean {
    if (this.embedded?.item && this.isOwned) {
      return !!this.actor?.items.get(this.embedded.item);
    } else if (this.embedded?.item) {
      //???
    }
    return false;
  }

  // @@@@@@@@@@@ EFFECT HELPERS @@@@@@@@@@

  get isVsDeflection() {
    return this._isVsDefense(Defense.DEFLECTION);
  }

  get isVsFortitude() {
    return this._isVsDefense(Defense.FORTITUDE);
  }

  get isVsReflex() {
    return this._isVsDefense(Defense.REFLEX);
  }

  get isVsWill() {
    return this._isVsDefense(Defense.WILL);
  }

  _isVsDefense(defense: Defense) {
    if (this.type == 'weapon' || this.type == 'power') return this.damage?.value.some((d) => d.defense.toLowerCase() == defense);
    return false;
  }

  get name() {
    if (this.type == 'skill' && this.specialization?.has) return super.name + ` (${this.specialization.value})`;
    else return super.name;
  }

  // @@@@@@@@ DATA GETTERS @@@@@@@@@@;
  get category() {
    if (hasCategory(this)) return this.data.data.category;
  }
  get xp() {
    if (hasXP(this)) return this.data.data.xp;
  }
  get used() {
    if (isUsableItem(this)) return this.data.data.used;
  }
  get equipped() {
    if (isEquippable(this)) return this.data.data.equipped;
  }
  get wearable() {
    if (this.data.type == 'equipment') return this.data.data.wearable;
  }
  get weight() {
    if (isPhysical(this)) return this.data.data.weight;
  }
  get quantity() {
    if (isPhysical(this)) return this.data.data.quantity;
  }
  get cost() {
    if (isPhysical(this)) return this.data.data.cost;
  }
  get range() {
    if (this.data.type === 'power') return this.data.data.range;
  }
  get target() {
    if (this.data.type === 'power') return this.data.data.target;
  }
  get duration() {
    if (this.data.type === 'power') return this.data.data.duration;
  }
  get speed() {
    if (this.data.type === 'power') return this.data.data.speed;
  }
  get pool() {
    if (this.data.type == 'powerSource') return this.data.data.pool;
  }
  get description() {
    return this.data.data.description;
  }
  get soak() {
    if (this.data.type == 'armor' || this.data.type == 'shield') return this.data.data.soak;
  }
  get winded() {
    if (this.data.type == 'armor' || this.data.type == 'shield') return this.data.data.winded;
  }
  get initiative() {
    if (this.data.type == 'armor') return this.data.data.initiative;
  }
  get health() {
    if (this.data.type == 'shield') return this.data.data.health;
  }
  get deflection() {
    if (this.data.type == 'shield') return this.data.data.deflection;
  }
  get skill() {
    if (this.data.type == 'weapon' || this.data.type == 'equipment') return this.data.data.skill;
  }
  get misc() {
    if (this.data.type === 'power' || this.data.type == 'weapon') return this.data.data.misc;
  }
  get accuracy() {
    if (this.data.type == 'weapon') return this.data.data.accuracy;
  }
  get damage() {
    if (this.data.type === 'power' || this.data.type == 'weapon') return this.data.data.damage;
  }
  get special() {
    if (this.data.type == 'weapon') return this.data.data.special;
  }
  get modifier() {
    if (hasXP(this)) return this.data.data.modifier;
  }
  get setting() {
    if (this.data.type == 'background') return this.data.data.setting;
  }
  get years() {
    if (this.data.type == 'background') return this.data.data.years;
  }
  get group() {
    if (this.data.type == 'reputation') return this.data.data.group;
  }
  get stride() {
    if (this.data.type == 'armor' || this.data.type == 'species') return this.data.data.stride;
  }
  get size() {
    if (this.data.type == 'species') return this.data.data.size;
  }
  get species() {
    if (this.data.type == 'species') return this.data.data.species;
  }
  get source() {
    if (this.data.type == 'powerSource' || this.data.type == 'power') return this.data.data.source;
  }
  get base() {
    if (this.data.type === 'power') return this.data.data.base;
  }
  get level() {
    if (this.data.type === 'power') return this.data.data.level;
  }
  get healing() {
    if (this.data.type === 'power') return this.data.data.healing;
  }
  get toughness() {
    if (this.data.type == 'armor') return this.data.data.toughness;
  }
  get summons() {
    if (this.data.type === 'power') return this.data.data.summons;
  }
  get run() {
    if (this.data.type == 'armor') return this.data.data.run;
  }
  get improvised() {
    if (this.data.type == 'power') return this.data.data.improvised;
  }
  get roll() {
    if (this.data.type == 'power') return this.data.data.roll;
  }
  get powers() {
    if (hasEmbeddedPowers(this)) return this.data.data.powers;
  }
  get embedded() {
    if (this.data.type == 'power') return this.data.data.embedded;
  }
  get powerCharges() {
    if (hasEmbeddedPowers(this)) return this.data.data.powerCharges;
  }
  get powerRecharge() {
    if (hasEmbeddedPowers(this)) return this.data.data.powerRecharge;
  }
  get specialization() {
    if (this.data.type == 'skill') return this.data.data.specialization;
  }
  get partner() {
    if (this.data.type == "bond") return this.data.data.partner
  }

  // Processed data getters
  get rank() {
    return this.xp!.rank;
  }
  get attack() {
    if (this.data.type == 'powerSource') return this.data.data.attack;
  }

  //#endregion

  static baseData: { target: PowerTarget; range: PowerRange; duration: PowerDuration; healing: PowerHealing; misc: PowerMisc; 'damage.value': PowerDamage; 'base.effects': PowerBaseEffect } = {
    target: {
      group: '',
      value: 'target',
      subtype: 'self',
      targeted: false,
      exclusion: 'none',
    },
    range: { group: '', value: 'none' },
    duration: { group: '', value: 'momentary' },
    healing: { group: '', value: '', type: 'health', label: "" },
    misc: { group: '', value: '', modifier: 0 },
    'damage.value': {
      label: '',
      group: '',
      base: '',
      crit: '',
      defense: 'deflection',
      type: 'physical',
      defaultCrit: 0,
    },
    'base.effects': { text: '', group: '', value: '', defense: '' },
  };
}
