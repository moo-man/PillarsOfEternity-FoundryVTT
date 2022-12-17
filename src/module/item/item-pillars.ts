import {  DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';
import { ItemDataConstructorData, ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { PowerSource } from '../../global';
import { getGame } from "../system/utility"
import { DamageType, Defense, hasCategory, hasEmbeddedPowers, hasXP, isEquippable, isPhysical, isUsableItem, ItemType } from '../../types/common';
import { ItemChatData,  WeaponSpecialData, WeaponSpecial } from '../../types/items';
import { EmbeddedPower, PowerBaseEffect, PowerDamage, PowerDisplay, PowerDuration, PowerGroup, PowerGroups, PowerHealing, PowerMisc, PowerRange, PowersConstructorContext, PowerTarget } from '../../types/powers';
import { PILLARS } from '../system/config';
import { PILLARS_UTILITY } from '../system/utility';
/**
 * Extend the FVTT Item class for Pillars functionality
 */

declare global {
  interface DocumentClassConfig {
    Item: typeof PillarsItem;
  }
}

export class PillarsItem extends Item {

  system: any//DeepPartial<PillarsItemSystemDataTemp> = {}


  constructor(data?: ItemDataConstructorData | undefined, context?: PowersConstructorContext | undefined){
    super(data, context);
  }


  async _preUpdate(updateData: ItemDataConstructorData, options: DocumentModificationOptions, user: User): Promise<void> {
    await super._preUpdate(updateData, options, user);

    // Clamp the shield health to between max and 0
    if (this.type == 'shield' && hasProperty(updateData, 'data.health.current'))
      setProperty(updateData, 'data.health.current', Math.clamped(getProperty(updateData, 'data.health.current'), 0, this.system.health?.max || 0));

    if (this.data.type == "bond" && hasProperty(updateData, "system.partner"))
    {
      let id = getProperty(updateData, "system.partner")
      let actor = getGame().actors?.get(id);
      if (actor)
      {
        updateData.img = actor.prototypeToken.texture.src
        updateData.name = actor.name || this.name!
      }
    }

    // Convenience feature to set the power source name to the same as the newly selected source
    if (this.type == 'powerSource' && hasProperty(updateData, 'data.source.value'))
      updateData.name = PILLARS.powerSources[getProperty(updateData, 'data.source.value') as keyof typeof PILLARS.powerSources];

    if (getProperty(updateData, 'data.category.value') == 'grimoire') {
      // Check for non-arcana powers before switiching to Grimoire type
      if (!(await this._checkGrimoirePowers())) {
        setProperty(updateData, 'data.category.value', this.system.category?.value);
        return;
      }

      // Change all embedded powers to "source"
      let powers = this.system.powers;
      if (powers) {
        powers.forEach((p : EmbeddedPower) => (p.data.embedded.spendType = 'source'));

        setProperty(updateData, 'data.powers', powers);

        // If this is owned, set all owned powers (given by this item) to "source"
        if (this.isOwned)
          this.actor!.updateEmbeddedDocuments(
            'Item',
            powers
              .map((p : EmbeddedPower) => {
                return {
                  _id: p.ownedId,
                  'data.embedded.spendType': 'source',
                };
              })
              .filter((p : EmbeddedPower) => p)
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
      let embeddedPowers = this.actor!.getItemTypes(ItemType.power).filter((i) => i.system.embedded?.item == this.id);

      await this.actor!.deleteEmbeddedDocuments(
        'Item',
        embeddedPowers.map((i) => i.id!)
      );
    }
  }

  _onCreate(data: ItemDataSource, options: DocumentModificationOptions, user: string) {
    super._onCreate(data, options, user);

    // If the new item has embedded powers, add them to the actor
    if (this.isOwned && this.system.powers?.length && user == getGame().user!.id) {
      this.actor!.createEmbeddedDocuments(
        'Item',
        this.system.powers.map((p : EmbeddedPower) => {
          p.system.embedded.item = this.id!;
          return { ...p };
        })
      ).then((items) => {
        // Add id of actual owned power to the parent flags
        this.update({
          'data.powers': this.system.powers?.map((p : EmbeddedPower, i : number) => {
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
      let parentPowers = foundry.utils.deepClone(embeddedParent.system.powers);

      let index = parentPowers!.findIndex((i : EmbeddedPower) => i.ownedId == this.id);
      if (this.data.type == 'power') {
        let powerData = this.toObject() as PowerSource;
        powerData.ownedId = this.id!;
        parentPowers![index] = powerData;
        embeddedParent.update({ 'data.powers': parentPowers });
      }
    }


    if (this.data.type == "bond")
    {
      if (this.system.xp!.rank! >= 5)
      {
        let traits = foundry.utils.deepClone(this.system.traits)
        if (!traits.includes("emotionSense"))
        {
          traits.push("emotionSense")
        }
        if (!traits.includes("silentAssistance"))
        {
          traits.push("silentAssistance")
        }
        if (!traits.includes("bondedGrief"))
        {
          traits.push("bondedGrief")
        }
        this.update({"system.traits" : traits})
      }
      else this.update({"system.traits" : []})

      this.checkBondTraitEffects();
    }

  }


  async checkBondTraitEffects() {
    if(this.data.type == "bond" && this.isOwned)
    {
      let toAdd: Partial<ActiveEffectDataConstructorData>[] = [];
      let toDelete = []
      let bondEffects = this.actor!.effects.filter(i => !!(i.getFlag("pillars-of-eternity", "bondTrait") as string))

      // Find traits owned but with no effect and add them
      for(let trait of this.system.traits)
      {
        let existing = bondEffects.find(i => trait == i.getFlag("pillars-of-eternity", "bondTrait") as string)
        if (!existing)
          toAdd.push(PILLARS.bondTraits[trait as keyof typeof PILLARS.bondTraits].effect!)
      }

      // Find effects that should be removed
      for(let effect of bondEffects)
      {
        let key = effect.getFlag("pillars-of-eternity", "bondTrait") as string

        if (!this.system.traits.includes(key))
          toDelete.push(effect.id!);
      }

      if (toDelete.length > 0)
        await this.actor!.deleteEmbeddedDocuments("ActiveEffect", toDelete)
      if (toAdd.length > 0)
        await this.actor!.createEmbeddedDocuments("ActiveEffect", toAdd.filter(i => i));
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

    if (this.system.weight) {
      this.system.weight.value *= this.system.quantity?.value || 0;
    }
  }

  prepareWeapon() {

    let category = this.system.category?.value || ""

    if (isPhysical(this))
    {

      if (["smallMelee", "mediumMelee", "mediumRanged"].includes(category))
        this.system.size.value = "small"
      else if (["largeMelee", "largeRanged"].includes(category))
        this.system.size.value = "average"
      else if (category == "grenade")
        this.system.size.value == "tiny"
    }
  }

  prepareArmor() {
    if (isPhysical(this))
    {
      this.system.size.value = "large"
    }
  }

  prepareShield() {
    if (isPhysical(this))
    {
      this.system.size.value = "small"
    }
  }

  prepareSkill() {
    this.system.xp!.rank = PILLARS_UTILITY.getSkillRank(this.system.xp!.value) + (this.system.modifier?.value || 0);

  }

  prepareSpace() {
    this.system.cost = this.system.upkeep.value * 1000;
    this.system.workers = this.system.upkeep.value * 3;
    this.system.seasons = this.system.upkeep.value * 2;
  }

  preparePower() {
    if (this.data.type == 'power') this.data.groups = this.preparePowerGroups();

    if (this.system.level) {
      this.system.level.value = this.calculatePowerLevel();
      this.system.level.cost = this.system.improvised?.value ? this.system.level.value * 2 : this.system.level.value;
    }
  }

  prepareOwnedReputation() {
    this.system.xp!.rank = PILLARS_UTILITY.getSkillRank(this.system.xp!.value) + (this.system.modifier?.value || 0);
  }

  prepareOwnedConnection() {
    this.system.xp!.rank = PILLARS_UTILITY.getSkillRank(this.system.xp!.value) + (this.system.modifier?.value || 0);
  }

  prepareOwnedBond() {
    this.system.xp!.rank = PILLARS_UTILITY.getSkillRank(this.system.xp!.value) + (this.system.modifier?.value || 0);
    if (this.data.type == "bond")
      this.system.active = this.system.xp!.value >= 15
  }

  prepareOwnedPowerSource() {
    if (this.data.type == 'powerSource') {
      // NPCs don't use xp, so use level directly
      if (this.actor!.type == 'character') this.system.xp!.level = PILLARS_UTILITY.getPowerSourceLevel(this.system.xp!.value);

      this.system.attack = PILLARS_UTILITY.getPowerSourceAttackBonus(this.system.xp!.level!);
      this.system.pool!.max = PILLARS_UTILITY.getPowerSourcePool(this.system.xp!.level!);
    }
  }

  prepareOwnedDefense() {
    if (this.actor?.type == "headquarters")
    {
      this.system.upkeep.total = this.system.upkeep.value * Math.ceil(this.actor.system.accommodationUpkeep / this.system.upkeep.per)
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
    let data = <ItemChatData>{ text: this.system.description.value };

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

      
      groupIds = groupIds.concat(this.system.target!.map((i : PowerTarget) => i.group).filter((g : string) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.system.range!.map((i : PowerRange) => i.group).filter((g : string) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.system.duration!.map((i : PowerDuration) => i.group).filter((g : string) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.system.damage!.value.map((i : PowerDamage) => i.group).filter((g : string) => !groupIds.includes(g)));
      groupIds = groupIds.concat(this.system.base!.effects.map((i : PowerBaseEffect) => i.group).filter((g : string) => !groupIds.includes(g)));
      groupIds = groupIds.filter((i) => i || Number.isNumeric(i));
      groupIds.push('');

      for (let g of groupIds) {
        groups[g] = <PowerGroup>{};

        groups[g]!.target = this.system.target!.filter((i : PowerTarget) => i.group == g);
        groups[g]!.range = this.system.range!.filter((i : PowerRange) => i.group == g);
        groups[g]!.duration = this.system.duration!.filter((i : PowerDuration) => i.group == g);
        groups[g]!.damage = this.system.damage!.value.filter((i : PowerDamage) => i.group == g);
        groups[g]!.effects = this.system.base!.effects.filter((i : PowerBaseEffect) => i.group == g);
        groups[g]!.healing = this.system.healing!.filter((i : PowerHealing) => i.group == g);
        groups[g]!.misc = (this.system.misc as PowerMisc[]).filter((i) => i.group == g);

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

        for (let range of this.system.range!) pl += values.powerRanges[range.value as keyof typeof PILLARS.powerRanges] || 0;

        for (let target of this.system.target!) {
          let targetSubTypes = values[`power${target.value[0]?.toUpperCase() + target.value.slice(1)}s` as keyof typeof values];
          pl += targetSubTypes[target.subtype as keyof typeof targetSubTypes] || 0;
          pl += values.powerExclusions[target.exclusion as keyof typeof PILLARS.powerExclusions];
        }
        for (let duration of this.system.duration!) pl += values.powerDurations[duration.value as keyof typeof PILLARS.powerDurations];
        for (let summon of this.system.summons || []) pl += summon.modifier || 0;

        for (let misc of <PowerMisc[]>this.system.misc!) pl += misc.modifier || 0;

        pl += values.powerSpeeds[this.system.speed!.value as keyof typeof PILLARS.powerSpeeds];
        pl += this.system.base!.cost || 0;
        this.system.pl = pl;
        level = PillarsItem._abstractToLevel(pl) + (this.system.level?.modifier || 0);
      } catch (e) {
        console.log(getGame().i18n.format("PILLARS.ErrorPLCalculation", {name : this.name}) + ": " +  e);
      }
    }
    return level;
  }

  updateEmbeddedPower(index: number, updateData: Record<string, unknown>) {
    let powers = duplicate(this.system.powers || []);
    if (powers[index]) {
      mergeObject(powers[index]!, updateData, { overwrite: true });
      return this.update({ 'data.powers': powers });
    }
  }

  async addEmbeddedPower(power : EmbeddedPower)
  {
    if (this.type == 'equipment' && this.system.category?.value == 'grimoire' && power.data.source.value != 'arcana')
      return ui.notifications?.error(getGame().i18n.localize("PILLARS.OnlyArcanaInGrimoire"))
    if (this.type == 'equipment' && this.system.category?.value == 'grimoire') power.data.embedded.spendType = 'source';

    // If drag item was an owned power already, add embedded data to it
    let ownedPower: PillarsItem | undefined;
    if (this.isOwned && this.actor!.items.get(power._id!)) {
      ownedPower = this.actor!.items.get(power._id!);
      power.ownedId = ownedPower?.id!;
    } else if (this.isOwned) {
      // If drag item was not owned, but the drop item is, add the drag item to the actor
      ownedPower = (await this.actor!.createEmbeddedDocuments('Item', [{ ...power }]))[0] as PillarsItem;
      power.ownedId = ownedPower?.id!;
    }

    let powers = foundry.utils.deepClone(this.system.powers) || []; // TODO test this
    powers.push(power);
    return this.update({ 'data.powers': powers }).then((item) => {
      if (ownedPower) ownedPower.update({ 'data.embedded.item': item?.id, 'data.embedded.spendType': 'source' });
    });
  }

  async _checkGrimoirePowers() {
    let powers = duplicate(this.system.powers || []);

    let game = getGame();
    let nonArcanaPowers = powers.filter((i : EmbeddedPower) => i.system.source.value != 'arcana');
    if (nonArcanaPowers.length)
      return new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("PILLARS.RemoveArcanePowers"),
          content: game.i18n.format("PILLARS.PromptRemoveArcanePowers", {powers : nonArcanaPowers.map((i : EmbeddedPower) => `<li>${i.name}</li>`).join('')}),
          buttons: {
            remove: {
              label: game.i18n.localize("PILLARS.Remove"),
              callback: async () => {
                let arcanaPowers = powers.filter((i : EmbeddedPower) => i.system.source.value == 'arcana');
                arcanaPowers.forEach((p : EmbeddedPower) => {
                  p.system.embedded.spendType == 'source';
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

  hasMatchingBond() {
    if (this.data.type == "bond" && this.isOwned)
    {
      let partner = getGame().actors!.get(this.system.partner)
      let partnerBond = partner?.getItemTypes(ItemType.bond).find(b => {
        if (b.data.type == "bond")
        {
          return b.system.partner == this.parent!.id
        }
      })
      if (partnerBond && partnerBond.data.type == "bond")
      {
        let matching = true;
        if (this.system.xp!.value != partnerBond.system.xp!.value)
          matching = false;
        if (this.system.modifier!.value != partnerBond.system.modifier!.value)
          matching = false;
        if (this.system.traits.length == partnerBond.system.traits.length)
        {

          // If both partner and self arrays have the same values, return true
          let matchingArrays = this.system.traits.every((t : string) => {
            if (partnerBond?.data.type == "bond")
            {
              return partnerBond.system.traits.includes(t)
            }
          })
          &&
          partnerBond.system.traits.every((t : string) => {
            if (this.data.type == "bond")
            {
              return this.system.traits.includes(t)
            }
          })

          // Don't set matching = matchingArrays, only want to test for false
          if (!matchingArrays)
          {
            matching = false;
          }
        }
        else // arrays are different length, always false
          matching = false;

        return matching
      }
      else return false
    }
  }

  //#endregion

  //#region Getters
  // @@@@@@@@ CALCULATION GETTERS @@@@@@@
  get isMelee() {
    return this.system.category?.value == 'smallMelee' || this.system.category?.value == 'mediumMelee' || this.system.category?.value == 'largeMelee';
  }

  get isRanged() {
    return this.system.category?.value == 'mediumRanged' || this.system.category?.value == 'largeRanged' || this.system.category?.value == 'grenade';
  }

  get specialList(): Record<string, WeaponSpecialData> {
    if (this.isMelee) return getGame().pillars.config.meleeSpecials;
    else if (this.isRanged) return getGame().pillars.config.rangedSpecials;
    else return {};
  }

  get canEquip() {
    return (this.type == 'equipment' && (this.system.wearable?.value || this.system.category?.value == 'grimoire')) || this.type == 'weapon' || this.type == 'armor' || this.type == 'shield';
  }

  get languageProficiency() : keyof typeof PILLARS.languageProficiencies {
    if (this.data.type == "skill" && this.system.category.value == "language")
    {
      let rank = this.system.xp?.rank || 0
      if (rank >= 9)
        return "native"
      else if (rank >= 7)
        return "fluent"
      else if (rank >= 5)
        return "conversational"
      else if (rank >= 3)
        return "basic"
      else if (rank >= 1)
        return "rudimentary"
      else return "none"
    }
    else return "none"
  }

  // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

  get Category() {
    if (this.type == 'weapon') return getGame().pillars.config.weaponTypes[this.system.category?.value! as keyof typeof PILLARS.weaponTypes];
    if (this.type == 'skill') return getGame().pillars.config.skillTypes[this.system.category?.value! as keyof typeof PILLARS.skillTypes];
  }

  get Type() {
    return getGame().i18n.localize(CONFIG.Item.typeLabels[this.type] || '');
  }

  get Range() {
    return getGame().pillars.config.powerRanges[this.system.range?.find((i: PowerRange) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('range'))?.value! as keyof typeof PILLARS.powerRanges];
  }

  get Target() {
    try {
      let targetObj = this.system.target?.find((i : PowerTarget) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('target'));
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
    return getGame().pillars.config.powerDurations[this.system.duration?.find((i : PowerDuration) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('duration'))?.value as keyof typeof PILLARS.powerDurations];
  }
  get Speed() {
    return getGame().pillars.config.powerSpeeds[this.system.speed?.value as keyof typeof PILLARS.powerSpeeds];
  }
  get Exclusion() {
    return getGame().pillars.config.powerExclusions[this.system.target?.find((i : PowerTarget) => (i.group || getGame().i18n.localize("Default")) == this.displayGroupKey('target'))?.exclusion as keyof typeof PILLARS.powerExclusions];
  }
  get Skill() {
    return this.actor?.getItemTypes(ItemType.skill).find((i) => i.name == this.system.skill?.value);
  }

  get SourceItem(): PillarsItem | undefined {
    if (!this.isOwned) return;
    if (this.EmbeddedPowerParent && this.EmbeddedPowerParent.system.category?.value != 'grimoire') {
      // If embedded and not in grimoire, get highest power source attack value
      return this.actor?.getItemTypes(ItemType.powerSource).sort((a, b) => (b.attack || 0) - (a.attack || 0))[0];
    }

    return this.actor?.items.find((i) => (i.type == 'powerSource' && i.system.source && i.system.source.value == this.system.source?.value) || false);
  }

  get EmbeddedPowerParent(): PillarsItem | undefined {
    if (this.isOwned && this.system.embedded) return this.actor!.items.get(this.system.embedded.item);
  }

  get Specials() {
    let specials = this.specialList;
    let notSkilledEnough = this.system.special?.value.filter((i : WeaponSpecial) => this.isOwned && specials[i.name as keyof typeof specials]?.skilled && (!this.Skill || (this.Skill?.rank || 0) < 5));

    return this.system.special?.value.map((i: WeaponSpecial) => {
      let display = this.specialList?.[i.name as keyof typeof specials]?.label;
      if (i.value) display += ` (${i.value})`;
      if (notSkilledEnough?.find((sp : WeaponSpecial) => sp.name == i.name)) display = `<p style="text-decoration: line-through">${display}</p>`;
      return display;
    });
  }

  get EmbeddedDisplay() {
    let string = '';
    let game = getGame()
    if (this.system.embedded) {
      if (['encounter', 'longRest'].includes(this.system.embedded.spendType)) string += `${this.system.embedded.uses.value}/${this.system.embedded.uses.max} ${this.system.embedded.spendType == 'encounter' ? game.i18n.localize("PILLARS.EncounterAbbreviation") : game.i18n.localize("PILLARS.LongRestAbbreviation")}`;
      else if (this.system.embedded.spendType == 'charges') string += `${this.EmbeddedPowerParent?.system.powerCharges?.value}/${this.EmbeddedPowerParent?.system.powerCharges?.max}`;
      else if (this.system.embedded.spendType == 'source') {
        string += getGame().pillars.config.powerSources[this.system.source?.value as keyof typeof PILLARS.powerSources];
      }
      return string;
    }
  }

  get Soak() {
    if (this.system.soak && this.system.health) return Math.min(this.system.soak.value || 0, this.system.health.current || 0);
  }

  get Bond() {
    if (this.data.type == "bond" && this.system.partner)
    {
      return getGame().actors!.get(this.system.partner);
    }
  }

  displayGroupKey(type?: keyof PowerGroup): string | undefined {
    try {
      if (this.data.type == 'power') {
        let groupIndex: number = this.getFlag('pillars-of-eternity', 'displayGroup') as number;

        let group = Object.keys(this.data.groups!)[groupIndex];
        let first = Object.keys(this.data.groups!)
          .filter((i) => i)
          .sort((a, b): number => (a > b ? 1 : -1))[0];

        if (type && group) {
          if (group && this.data.groups![group] && (this.data.groups![group]![type] as Array<unknown>).length) return group;
          else if (first && this.data.groups![first] && (this.data.groups![first]![type] as Array<unknown>).length) return first;
          else return '';
        } else {
          if (group && Object.keys(this.data.groups![group] || {}).length) return group;
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
        let group = Object.keys(this.data.groups!)[groupIndex];
        return group;
      }
    } catch (e) {
      console.error(getGame().i18n.format("PILLARS.ErrorCurrentPowerGroupDisplayKey") + ": " + e);
    }
  }

  get specials() {
    let specials: { [key: string]: WeaponSpecialData } = {};
    this.system.special?.value?.forEach((sp : WeaponSpecial) => {
      specials[sp.name] = this.specialList?.[sp.name]!;
      specials[sp.name]!.value = sp.value;
    });
    return specials;
  }

  get isEmbeddedPower(): boolean {
    if (this.system.embedded?.item && this.isOwned) {
      return !!this.actor?.items.get(this.system.embedded.item);
    } else if (this.system.embedded?.item) {
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
    if (this.type == 'weapon' || this.type == 'power') return this.system.damage?.value.some((d: PowerDamage) => d.defense.toLowerCase() == defense);
    return false;
  }

  get specializedName() {
    if (this.type == 'skill' && this.system.specialization?.has) return super.name + ` (${this.system.specialization.value})`;
    else return super.name;
  }

  // @@@@@@@@ DATA GETTERS @@@@@@@@@@;

  

  // Processed data getters
  get rank() {
    return this.system.xp!.rank;
  }
  get attack() {
    if (this.data.type == 'powerSource') return this.system.attack;
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
