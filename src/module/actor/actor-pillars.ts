import RollDialog from '../apps/roll-dialog';
import SkillCheck from '../system/skill-check';
import PillarsActiveEffect from '../system/pillars-effect';
import AgingDialog from '../apps/aging-dialog';
import WeaponCheck from '../system/weapon-check';
import PowerCheck from '../system/power-check';
import AgingRoll from '../system/aging-roll';
import { PillarsItem } from '../item/item-pillars';
import { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';
import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { PreparedPillarsCharacterData, PreparedPillarsFollowerData } from '../../global';
import { Defense, isUsable, ItemDialogData, ItemType, LifePhase, Season, SeasonData, Tier } from '../../types/common';
import { PILLARS } from '../system/config';
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
} from '../../types/checks.js';
import { getGame } from '../../pillars';
import { ChatSpeakerDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData';
import { PillarsEffectChangeDataProperties } from '../../types/effects';
import PILLARS_UTILITY from '../system/utility';
import ItemDialog from '../apps/item-dialog';

declare global {
  interface DocumentClassConfig {
    Actor: typeof PillarsActor;
  }
}

/**
 * Extend FVTT Actor class for Pillars functionality
 * @extends {Actor}
 */
export class PillarsActor extends Actor {
  itemCategories: Record<keyof typeof ItemType, PillarsItem[]> | undefined;

  async _preCreate(data: ActorDataConstructorData, options: DocumentModificationOptions, user: User) {
    await super._preCreate(data, options, user);
    // Set wounds, advantage, and display name visibility
    if (!data.token)
      this.data.update({
        'token.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
        'token.name': data.name, // Set token name to actor name
        'token.bar1': { attribute: 'health' }, // Default Bar 1 to Wounds
        'token.bar2': { attribute: 'endurance' }, // Default Bar 2 to Advantage
        'token.dimSight': 12,
        'token.brightSight': 6,
      });

    this.data.update({ 'flags.pillars-of-eternity.autoEffects': true });
    // Default characters to HasVision = true and Link Data = true
    if (data.type == 'character') {
      this.data.update({ 'token.vision': true });
      this.data.update({ 'token.actorLink': true });
    }
  }

  async _preUpdate(data: ActorDataConstructorData, options: DocumentModificationOptions, user: User) {
    await super._preUpdate(data, options, user);
    this.handleScrollingText(data);
  }

  setSpeciesData(data: PreparedPillarsCharacterData | PreparedPillarsFollowerData) {
    let speciesItem = this.getItemTypes(ItemType.species)[0];
    let stockItem = this.getItemTypes(ItemType.stock)[0];
    let godlikeItem = this.getItemTypes(ItemType.godlike)[0];
    let cultureItem = this.getItemTypes(ItemType.culture)[0];

    if (speciesItem?.name && (this.type == 'character' || this.type == "follower")) {
      data.details.species = speciesItem.name;
      data.stride.value = speciesItem.stride!.value;
      this.data.flags.tooltips.stride.value.push(`${speciesItem.stride!.value} (${speciesItem.name})`);
      data.size.value = speciesItem.size!.value;
      this.setSizeData(data);
    } else if (Number.isNumeric(data.size.value)) {
      this.setSizeData(data);
    }
    if (stockItem?.name) data.details.stock = stockItem.name;
    if (cultureItem?.name) data.details.culture = cultureItem.name;
    if (godlikeItem?.name) data.details.godlike = godlikeItem.name;

    //return this.update({"data" : data})
  }

  setSizeData(data: PreparedPillarsCharacterData | PreparedPillarsFollowerData) {
    let game = getGame();
    if (this.type == 'character') {
      let tier = this.tier.value || Tier.NOVICE;

      type Size = keyof typeof PILLARS.sizeAttributes;

      let attributes = PILLARS.sizeAttributes[<Size>data.size.value.toString()][<Tier>tier];
      data.damageIncrement.value = attributes.damageIncrement;
      data.toughness.value = attributes.toughness;
    }
    this.data.flags.tooltips.toughness.value.push(game.i18n.format('PILLARS.Tooltip', { value: data.toughness.value, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.damageIncrement.value.push(game.i18n.format('PILLARS.Tooltip', { value: data.damageIncrement.value, source: game.i18n.localize('PILLARS.TooltipBase') }));
    data.defenses.deflection.value = (data.defenses.deflection.base || 10) - data.size.value * 2;
    data.defenses.reflex.value = (data.defenses.reflex.base || 15) - data.size.value * 2;
    data.defenses.fortitude.value = (data.defenses.fortitude.base || 15) + data.size.value * 2;
    data.defenses.will.value = data.defenses.will.base || 15;

    this.data.flags.tooltips.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: this.endurance.threshold.winded, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.health.threshold.bloodied.push(game.i18n.format('PILLARS.Tooltip', { value: this.health.threshold.bloodied, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.health.threshold.incap.push(game.i18n.format('PILLARS.Tooltip', { value: this.health.threshold.incap, source: game.i18n.localize('PILLARS.TooltipBase') }));

    this.data.flags.tooltips.defenses.deflection.push(game.i18n.format('PILLARS.Tooltip', { value: data.defenses.deflection.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.defenses.reflex.push(game.i18n.format('PILLARS.Tooltip', { value: data.defenses.reflex.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.defenses.fortitude.push(game.i18n.format('PILLARS.Tooltip', { value: data.defenses.fortitude.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.defenses.will.push(game.i18n.format('PILLARS.Tooltip', { value: data.defenses.will.base, source: game.i18n.localize('PILLARS.TooltipBase') }));

    this.data.flags.tooltips.defenses.deflection.push(game.i18n.format('PILLARS.Tooltip', { value: -data.size.value * 2, source: game.i18n.localize('PILLARS.TooltipSize') }));
    this.data.flags.tooltips.defenses.reflex.push(game.i18n.format('PILLARS.Tooltip', { value: -data.size.value * 2, source: game.i18n.localize('PILLARS.TooltipSize') }));
    this.data.flags.tooltips.defenses.fortitude.push(game.i18n.format('PILLARS.Tooltip', { value: data.size.value * 2, source: game.i18n.localize('PILLARS.TooltipSize') }));
  }

  prepareBaseData() {
    if (['character', 'npc', 'follower'].includes(this.type)) {
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

      let game = getGame();

      this.run.value = 0; // Set run to 0 so active effects can still be applied to the the derived value
      if (this.data.type == 'character' || this.data.type == 'follower') this.setSpeciesData(this.data.data);

      this.data.flags.tooltips.run.value.push(game.i18n.format('PILLARS.Tooltip', { value: 'Stride x 2', source: game.i18n.localize('PILLARS.TooltipBase') }));

      if (this.tier) {
        let tierBonus = PILLARS.tierBonus[<Tier>this.tier.value];
        if (tierBonus) {
          for (let defense in this.defenses) {
            this.defenses[<Defense>defense].value += tierBonus.def;
            this.data.flags.tooltips.defenses[<Defense>defense].push(game.i18n.format('PILLARS.Tooltip', { value: tierBonus.def, source: game.i18n.localize('PILLARS.TooltipTier') }));
          }
        }
      }

      let checkedCount = 0;
      for (let defense in this.defenses) checkedCount += this.defenses[<Defense>defense].checked ? 1 : 0;

      if (checkedCount > 0) {
        let bonus = 5 - checkedCount;
        for (let defense in this.defenses)
          if (this.defenses[<Defense>defense].checked) {
            this.defenses[<Defense>defense].value += bonus;
            this.data.flags.tooltips.defenses[<Defense>defense].push(game.i18n.format('PILLARS.Tooltip', { value: bonus, source: game.i18n.localize('PILLARS.TooltipCheckedBonus') }));
          }
      }
    }
  }

  prepareDerivedData() {
    let equippedArmor = this.equippedArmor;
    let equippedShield = this.equippedShield;

    this.run.value += this.stride.value * 2;
    let game = getGame();

    this.health.threshold.bloodied += this.health.modifier;
    this.health.threshold.incap += this.health.modifier;
    this.endurance.threshold.winded += this.endurance.bonus;
    if (equippedArmor) {
      this.endurance.threshold.winded += equippedArmor?.winded?.value || 0;
      this.data.flags.tooltips.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor?.winded?.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
    }
    if (equippedShield) {
      this.endurance.threshold.winded += equippedShield?.winded?.value || 0;
      this.data.flags.tooltips.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: equippedShield?.winded?.value, source: game.i18n.localize('PILLARS.TooltipShield') }));
    }

    this.health.bloodied = this.health.value > this.health.threshold.bloodied;
    this.endurance.winded = this.endurance.value > this.endurance.threshold.winded;
    this.health.incap = this.health.value > this.health.threshold.incap;
    this.endurance.incap = this.endurance.value >= this.endurance.max + this.endurance.bonus;
    this.health.dead = this.health.value >= this.health.max + this.health.death.modifier;

    this.health.value = Math.max(this.health.value, this.health.wounds.value);

    if (this.data.type == 'character' || this.data.type == 'follower') {
      if (this.data.type == 'character') {
        let thresholds = PILLARS.agePointsDeathRank;
        for (let pointThreshold in thresholds) {
          if (this.data.data.life.agingPoints < parseInt(pointThreshold)) {
            this.data.data.life.march = thresholds[<keyof typeof thresholds>parseInt(pointThreshold)];
            break;
          }
        }
        this.data.data.life.march -= 1;
      }

      let age = 0;

      // TODO don't like the different paths here
      if (this.data.type == 'character') age = this.data.data.life.age;
      else if (this.data.type == 'follower') age = game.settings.get('pillars-of-eternity', 'season').year - this.data.data.life.birthYear;

      let currentPhase = '';
      let species = this.getItemTypes(ItemType.species)[0];
      if (species) {
        for (let phase in species.phases) {
          let range = species.phases[phase as LifePhase];
          if (age >= range[0]! && age <= range[1]!) {
            currentPhase = phase;
            break;
          }
        }
        this.data.data.life!.phase = currentPhase as LifePhase;
        if (this.data.type == "follower")
          this.data.data.life.age = age
      }
    }
  }

  //#region Data Preparation
  prepareData() {
    try {
      super.prepareData();

      this.itemCategories = this.itemTypes;
      for (let type in this.itemCategories) this.itemCategories[<ItemType>type] = this.itemCategories[<ItemType>type]!.sort((a, b) => (a.data.sort > b.data.sort ? 1 : -1));

      this.prepareItems();
      this.prepareCombat();
      this.prepareEffectTooltips();
    } catch (e) {
      console.error(e);
    }
  }

  prepareItems() {
    let weight = 0;
    for (let i of this.items) {
      i.prepareOwnedData();
      if (i.weight) weight += i.weight.value;
    }
    this.data.data.weight = weight;
  }

  prepareCombat() {
    let equippedArmor = this.equippedArmor;
    let equippedShield = this.equippedShield;

    let game = getGame();

    if (equippedArmor) {
      this.soak.base += equippedArmor.soak!.value || 0;
      this.initiative.value += equippedArmor.initiative!.value;
      this.toughness.value += equippedArmor.toughness!.value;
      this.stride.value += equippedArmor.stride!.value;
      this.run.value += equippedArmor.run!.value;

      this.data.flags.tooltips.soak.base.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor.soak!.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
      this.data.flags.tooltips.initiative.value.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor.initiative!.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
      this.data.flags.tooltips.toughness.value.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor.toughness!.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
      this.data.flags.tooltips.stride.value.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor.stride!.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
      this.data.flags.tooltips.run.value.push(game.i18n.format('PILLARS.Tooltip', { value: equippedArmor.run!.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
    }
    if (equippedShield) {
      this.soak.shield = this.soak.base + (equippedShield.soak!.value || 0);
      this.data.flags.tooltips.soak.shield = this.data.flags.tooltips.soak.shield.concat(this.data.flags.tooltips.soak.base);
      this.data.flags.tooltips.soak.shield.push(game.i18n.format('PILLARS.Tooltip', { value: equippedShield.soak!.value, source: game.i18n.localize('PILLARS.TooltipShield') }));
      this.defenses.deflection.value += equippedShield.deflection!.value;
      this.data.flags.tooltips.defenses.deflection.push(game.i18n.format('PILLARS.Tooltip', { value: equippedShield.deflection!.value, source: game.i18n.localize('PILLARS.TooltipShield') }));
    }

    this.data.flags.tooltips.soak.physical.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.soak.burn.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.soak.freeze.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.soak.raw.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.soak.corrode.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    this.data.flags.tooltips.soak.shock.push(game.i18n.format('PILLARS.Tooltip', { value: this.soak.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
  }

  prepareEffectTooltips() {
    let tooltips = this.data.flags.tooltips;
    let tooltipKeys = Object.keys(flattenObject(this.data.flags.tooltips));
    for (let effect of this.effects.filter((e) => !e.data.disabled)) {
      for (let change of effect.data.changes) {
        let foundTooltipKey = tooltipKeys.find((key) => change.key.includes(key));
        if (foundTooltipKey) {
          let tooltip = getProperty(tooltips, foundTooltipKey);
          tooltip.push(change.value + ` (${effect.data.label})`);
        }
      }
    }
  }

  //#endregion

  //#region Roll Setup

  async setupSkillCheck(skill: PillarsItem | string, options: CheckOptions = {}) {
    let game = getGame();
    let skillItem: PillarsItem | undefined;
    if (typeof skill == 'string') {
      skillItem = this.items.getName(skill);
      if (!skillItem) skillItem = getGame().items!.getName(skill);
    } else if (skill instanceof PillarsItem) {
      skillItem = skill;
      skill = skillItem.name as string;
    } else throw new Error(game.i18n.localize('PILLARS.ErrorInvalidArgument'));

    let data = this.getSkillDialogData('skill', skillItem!, { name: skill });
    let checkData: CheckDataFlattened = await RollDialog.create(data);
    checkData.skillName = skill;
    checkData.title = data.title;
    checkData.skillId = skillItem?.id || '';
    checkData.speaker = this.speakerData();
    checkData.targetSpeakers = this.targetSpeakerData();
    return new SkillCheck(checkData);
  }

  async setupWeaponCheck(weapon: PillarsItem | string, options: CheckOptions = {}) {
    let game = getGame();
    let weaponItem: PillarsItem | undefined;
    if (typeof weapon == 'string') weaponItem = this.items.get(weapon);
    else weaponItem = weapon;

    if (!weaponItem) throw ui!.notifications!.error(game.i18n.localize('PILLARS.ErrorNoWeaponFound'));

    if (!weaponItem?.skill?.value) throw ui!.notifications!.error(game.i18n.localize('PILLARS.ErrorNoSkillAssigned'));

    let data = this.getWeaponDialogData('weapon', weaponItem);
    let checkData: WeaponCheckDataFlattened = <WeaponCheckDataFlattened>await RollDialog.create(data);
    checkData.add = options.add || {}; // Properties added via options (right now only from equipped weapon powers)
    checkData.title = data.title;
    checkData.skillId = weaponItem.Skill?.id || '';
    checkData.skillName = weaponItem.skill.value;
    checkData.itemId = weaponItem.id!;
    checkData.speaker = this.speakerData();
    checkData.targetSpeakers = this.targetSpeakerData();
    return new WeaponCheck(checkData);
  }

  async setupPowerCheck(power: PillarsItem | string, options = {}) {
    let game = getGame();
    let powerItem: PillarsItem | undefined;
    if (typeof power == 'string') powerItem = this.items.get(power);
    else if (power instanceof PillarsItem) powerItem = power;
    else throw ui!.notifications!.error(game.i18n.localize('PILLARS.ErrorNoPowerFound'));

    this._powerUsageValidation(powerItem!);

    let data = this.getPowerDialogData('power', powerItem!);
    let checkData: PowerCheckDataFlattened = <PowerCheckDataFlattened>{};
    if (powerItem!.roll?.value) checkData = <PowerCheckDataFlattened>await RollDialog.create(data);

    checkData.title = data.title;
    checkData.sourceId = powerItem!.SourceItem?.id || '';
    checkData.itemId = powerItem!.id || '';
    checkData.speaker = this.speakerData();
    checkData.targetSpeakers = this.targetSpeakerData();
    return new PowerCheck(checkData);
  }

  async setupAgingRoll(year?: number) {
    if (this.type == 'character') {
      let dialogData = {
        modifier: PILLARS.lifePhaseModifier[this.life!.phase] || 0,
        changeList: this.getDialogChanges({ condense: true }),
        changes: this.getDialogChanges(),
        years: this.seasons?.filter((i) => !i.aging).map((i) => i.year) || [],
        defaultYear: year,
      };
      let checkData: AgingCheckDataFlattened = <AgingCheckDataFlattened>await AgingDialog.create(dialogData);
      checkData.title = getGame().i18n.localize('PILLARS.AgingRoll');
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
  _powerUsageValidation(power: PillarsItem): void {
    let game = getGame();

    if (power.data.type == 'power') {
      if (!power.SourceItem) throw ui.notifications!.error(game.i18n.format('PILLARS.ErrorNoPowerSourceFound', { value: power.data.data.source.value }));

      let embeddedParent = power.EmbeddedPowerParent;
      if (embeddedParent && embeddedParent.category?.value != 'grimoire') {
        if (['longRest', 'encounter'].includes(power.embedded?.spendType || '')) {
          if (power.embedded!.uses.value <= 0) throw ui.notifications!.error(game.i18n.localize('PILLARS.NoMoreUses'));
        } else if (power.embedded!.spendType == 'charges') {
          if (power.embedded!.chargeCost > embeddedParent.powerCharges!.value) throw ui.notifications!.error(game.i18n.localize('PILLARS.NotEnoughCharges'));
        }
      } else if (power.source?.value == 'spirits' && power.category?.value == 'phrase') return; // Phrases add 1 to power
      else if (power.SourceItem?.pool!.current < power.level!.value) throw ui.notifications!.error(game.i18n.localize('PILLARS.NotEnoughPower'));
    }
  }

  //#endregion

  //#region Convenience Helpers
  getItemTypes(type: ItemType): PillarsItem[] {
    return (this.itemCategories || this.itemTypes)[type] || [];
  }

  getDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) {
    let game = getGame();
    let dialogData: CheckDialogData = <CheckDialogData>{};
    dialogData.title = game.i18n.format('PILLARS.CheckTitle', { name: item?.name || options.name });
    dialogData.modifier = '';
    dialogData.steps = 0;
    (dialogData.changeList = this.getDialogChanges({ condense: true })),
      (dialogData.changes = this.getDialogChanges()),
      (dialogData.actor = this),
      (dialogData.targets = Array.from(game.user!.targets));
    dialogData.rollModes = CONFIG.Dice.rollModes;
    dialogData.rollMode = game.settings.get('core', 'rollMode');
    dialogData.item = item;
    dialogData.options = options;
    dialogData.state = { normal: true };
    return dialogData;
  }

  getSkillDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) {
    let dialogData: SkillDialogData = <SkillDialogData>this.getDialogData(type, item, options);
    dialogData.assisters = this.constructAssisterList(item.data.name || options.name || '');
    dialogData.hasRank = item ? !!item.xp!.rank : false;
    dialogData.skill = item;
    return dialogData;
  }

  getWeaponDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) {
    let dialogData: WeaponDialogData = <WeaponDialogData>this.getDialogData(type, item, options);
    dialogData.title = getGame().i18n.format('PILLARS.AttackTitle', { name: item?.name || options.name });
    //dialogData.assisters = this.constructAssisterList(weapon.Skill)
    dialogData.modifier = (((item.misc as { value: number })!.value || 0) + (item.accuracy!.value || 0)).toString();
    dialogData.hasRank = item.Skill ? !!item.Skill.rank : false;
    dialogData.skill = item.Skill;
    return dialogData;
  }

  getPowerDialogData(type: string, item: PillarsItem, options: CheckOptions = {}) {
    let dialogData: PowerDialogData = <PowerDialogData>this.getDialogData(type, item, options);
    if (item.damage?.value.length) dialogData.title = getGame().i18n.format('PILLARS.Attacktitle', { name: item?.name || options.name });
    else dialogData.title = item?.name || options.name || '';
    //dialogData.assisters = this.constructAssisterList(weapon.Skill)
    dialogData.modifier = (item.SourceItem?.attack || 0).toString();
    dialogData.hasRank = false;
    return dialogData;
  }

  constructAssisterList(itemName: string): AssisterData[] {
    let assisters = getGame().actors!.contents.filter((i) => (i.hasPlayerOwner || i.data.token.disposition > 0) && i.id != this.id);
    assisters = assisters.filter((a) => a.items.contents.find((i) => i.data.name == itemName)); // data.name because we want to account for specializations have the same base name

    let assisterData: AssisterData[] = assisters.map((actor): AssisterData => {
      return {
        name: actor.name || '',
        id: actor.id,
        rank: actor.items.contents.find((i) => i.data.name == itemName)?.rank || 0,
        die: `d${SkillCheck.rankToDie(actor.items.contents.find((i) => i.data.name == itemName))}`,
      };
    });
    return assisterData.filter((a) => a.rank >= 5);
  }

  /**
   * Get effects listed in the dialog
   * Effects are sourced from the rolling actor and targeted actor, if applicable
   */
  getDialogChanges({ condense = false } = {}): PillarsEffectChangeDataProperties[] {
    // Aggregate dialog changes from each effect
    let changes: PillarsEffectChangeDataProperties[] = this.effects
      .filter((i) => !i.data.disabled)
      .reduce((prev: PillarsEffectChangeDataProperties[], current) => prev.concat(current.getDialogChanges({ condense, indexOffset: prev.length })), []);

    if (getGame().user!.targets.size > 0) {
      let target = Array.from(getGame().user!.targets)[0]!.actor;
      if (target) {
        let targetChanges = target.effects.reduce(
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

  speakerData(token?: Token): ChatSpeakerDataProperties {
    if (this.isToken) {
      return {
        token: token?.document?.id || this.token?.id || null,
        scene: token?.document?.parent?.id || this.token?.parent?.id || null,
        alias: undefined,
        actor: null,
      };
    } else {
      return {
        actor: this.id,
        token: token?.document?.id || null,
        scene: token?.document?.parent?.id || null,
        alias: undefined,
      };
    }
  }

  targetSpeakerData(): ChatSpeakerDataProperties[] {
    return Array.from(getGame().user!.targets)
      .map((i) => i.actor?.speakerData(i))
      .filter((i) => i) as ChatSpeakerDataProperties[];
  }

  use(type: string, name: string) {
    let item = this.getItemTypes(type as ItemType).find((i) => i.name == name);
    if (item) return item.update({ 'data.used.value': true });
    let worldItem = getGame().items!.contents.find((i) => i.type == type && i.name == name);
    if (worldItem) {
      let itemData = worldItem.toObject();
      if (isUsable(itemData)) {
        itemData.data.used.value = true;
      }
      return this.createEmbeddedDocuments('Item', [{ ...itemData }]);
    }

    // If no owned item and no world item, just make the item
    return this.createEmbeddedDocuments('Item', [{ name, type, sort: 0, data: { used: { value: true } } }]);
  }

  _baseRest(): DeepPartial<ActorDataConstructorData> {
    let updates: DeepPartial<ActorDataConstructorData> = {
      items: [],
      data: {},
    };

    // Short/Long rest both refill pools
    this.getItemTypes(ItemType.powerSource).forEach((p) => {
      updates.items!.push({ name: p.name!, type: p.type, _id: p.id, data: { pool: { current: p.pool?.max } } });
    });

    // Both rests reset encounter items
    this.items
      .filter((i) => i.powerRecharge == 'encounter')
      .forEach((i) => {
        updates.items!.push({
          name: i.name!,
          type: i.type,
          _id: i.id,
          data: { powerCharges: { value: i.powerCharges?.max } },
        });
      });

    this.items
      .filter((i) => i.type == 'power' && i.embedded?.spendType == 'encounter')
      .forEach((i) => {
        updates.items!.push({
          name: i.name!,
          type: i.type,
          _id: i.id,
          data: {
            embedded: {
              uses: {
                value: i.embedded?.uses.max,
              },
            },
          },
        });
      });

    return updates;
  }

  longRest() {
    let updates = this._baseRest();

    updates.data!.health = { value: 0 };
    updates.data!.endurance = { value: 0 };

    this.items
      .filter((i) => i.powerRecharge == 'longRest')
      .forEach((i) => {
        updates.items!.push({
          name: i.name!,
          type: i.type,
          _id: i.id,
          data: {
            powerCharges: { value: i.powerCharges?.max },
          },
        });
      });

    this.items
      .filter((i) => i.type == 'power' && i.embedded?.spendType == 'longRest')
      .forEach((i) => {
        updates.items!.push({
          name: i.name!,
          type: i.type,
          _id: i.id,
          data: {
            embedded: {
              uses: {
                value: i.embedded?.uses.max,
              },
            },
          },
        });
      });

    return this.update(updates);
  }

  shortRest() {
    let updates = this._baseRest();

    if (!this.health.incap && !this.endurance.incap) {
      updates.data!.health = { value: 0 };
      updates.data!.endurance = { value: 0 };
    }

    return this.update(updates);
  }

  enduranceAction(action: 'exert' | 'breath') {
    let game = getGame();
    let actionName;
    if (action == 'exert') {
      this.update({
        'data.endurance.value': Math.min(this.endurance.max, this.endurance.value + 2),
      });
      actionName = game.i18n.localize('PILLARS.Exert');
    } else if (action == 'breath') {
      this.update({
        'data.endurance.value': Math.max(0, this.endurance.value - 2),
      });
      actionName = game.i18n.localize('PILLARS.CatchBreath');
    }

    let content = `${this.name} used ${actionName}!`;

    ChatMessage.create({ content, speaker: { alias: this.name } });
  }

  hasCondition(condition: string): PillarsActiveEffect | undefined {
    return this.effects.find((i) => i.conditionId == condition);
  }

  addCondition(condition: string) {
    let effect = duplicate(CONFIG.statusEffects.find((e) => e.id == condition));
    if (!effect) return new Error(getGame().i18n.localize('PILLARS.ErrorConditionKey'));

    if (condition == 'incapacitated') this.handleDefeatedStatus();

    if (condition == 'dead' || condition == 'incapacitated') setProperty(effect, 'flags.core.overlay', true);

    setProperty(effect, 'flags.core.statusId', effect.id);
    delete effect.id;
    return this.createEmbeddedDocuments('ActiveEffect', [effect]);
  }

  removeCondition(condition: string) {
    let effect = this.hasCondition(condition);
    if (condition == 'incapacitated') this.handleDefeatedStatus();
    if (effect) return effect.delete();
  }

  handleDefeatedStatus() {
    let game = getGame();
    if (game.combat) {
      let combatant;
      if (this.isToken) combatant = game.combat.getCombatantByToken(this.token!.id!);
      else combatant = game.combat.combatants.find((c) => c.data.actorId == this.id);

      if (combatant)
        return combatant.update({
          defeated: this.health.incap || this.endurance.incap,
        });
    }
  }

  handleScrollingText(data: ActorDataConstructorData) {
    try {
      if (hasProperty(data, 'data.health.value')) this._displayScrollingChange(getProperty(data, 'data.health.value') - this.health.value);
      if (hasProperty(data, 'data.health.wounds.value')) this._displayScrollingChange(getProperty(data, 'data.health.wounds.value') - this.health.wounds.value, { text: 'Wound' });
      if (hasProperty(data, 'data.endurance.value')) this._displayScrollingChange(getProperty(data, 'data.endurance.value') - this.endurance.value, { endurance: true });
    } catch (e) {
      console.error(getGame().i18n.localize('PILLARS.ErrorScrollingText'), data, e);
    }
  }

  /**
   * Display changes to health as scrolling combat text.
   * Adapt the font size relative to the Actor's HP total to emphasize more significant blows.
   * @param {number} daamge
   * @private
   */
  _displayScrollingChange(change: number, { text = '', endurance = false } = {}) {
    if (!change) return;
    change = Number(change);
    const tokens = this.getActiveTokens(true);
    for (let t of tokens) {
      if (!t?.hud?.createScrollingText) continue; // This is undefined prior to v9-p2
      t.hud.createScrollingText(change.signedString() + ' ' + text, {
        anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
        fontSize: 30,
        fill: endurance ? '0x6666FF' : change > 0 ? '0xFF0000' : '0x00FF00', // I regret nothing
        stroke: 0x000000,
        strokeThickness: 4,
        jitter: 0.25,
      });
    }
  }

  getActiveEmbeddedPowers() {
    // Filter embedded powers by whether their parent item is equipped. If the parent cannot be equipped, include it anyway. If the parent is not found, do not include it (should never happen)
    return this.getItemTypes(ItemType.power).filter((p) => {
      let parent = p.EmbeddedPowerParent;
      if (!parent) return false;
      else if (parent.canEquip) return parent.equipped?.value;
      else return true;
    });
  }

  async applyDamage(damage: number, type: string, options: DamageOptions) {
    let game = getGame();
    if (damage < this.toughness.value) return game.i18n.localize('PILLARS.NoDamage');

    let updateObj: ActorDataConstructorData = {
      name: this.name!,
      type: this.type,
      items: [],
      data: {
        health: {
          wounds: {},
        },
        endurance: {},
      },
    };

    let soak = this.soak.base;
    switch (type) {
      case 'physical':
        soak += this.soak.physical;
        break;
      case 'burn':
        soak += this.soak.burn;
        break;
      case 'freeze':
        soak += this.soak.freeze;
        break;
      case 'corrode':
        soak += this.soak.corrode;
        break;
      case 'shock':
        soak += this.soak.shock;
        break;
      case 'raw':
        soak = 0;
        break;
    }

    if (options.shield && this.equippedShield) soak += this.equippedShield?.Soak || 0;

    let message = `${damage} Damage - ${soak} Soak`;

    if (options.shield && this.equippedShield) {
      message += ` ${game.i18n.format('PILLARS.ShieldSoak', { soak: this.equippedShield.Soak })}`;
      updateObj.items = [this.calculateShieldDamage(this.equippedShield, damage)];
    }

    if (damage > this.toughness.value) {
      updateObj.data!.endurance!.value = this.endurance.value + 1;
      message += ` - ${game.i18n.format('PILLARS.ApplyEndurance', { value: 1 })}`;
    }

    if (damage > this.toughness.value && damage > soak) {
      let damageMinusSoak = damage - soak;
      let pips = Math.floor(damageMinusSoak / this.damageIncrement.value);
      updateObj.data!.health!.value = this.health.value + pips;
      message += ` - ${game.i18n.format('PILLARS.ApplyHealth', { value: pips })}`;

      if (pips >= 3 && pips <= 4 && this.health.wounds.value < 3) {
        updateObj.data!.health!.wounds!.value = this.health.wounds.value + 1;
        message += ` - ${game.i18n.format('PILLARS.ApplyWounds', { value: 1 })}`;
      }
    }

    if (this.isOwner || !game.settings.get('pillars-of-eternity', 'playerApplyDamage')) this.update(updateObj);
    else if (game.settings.get('pillars-of-eternity', 'playerApplyDamage'))
      game.socket!.emit('system.pillars-of-eternity', {
        type: 'updateActor',
        payload: { updateData: updateObj, speaker: this.speakerData() },
      });

    return message;
  }

  async applyHealing(healing: number, type: string) {
    let game = getGame();
    let updateObj: ActorDataConstructorData = {
      name: this.name!,
      type: this.type,
      items: [],
      data: {
        health: {
          wounds: {},
        },
        endurance: {},
      },
    };
    let message = '';

    let healthPips = 0;
    let endurancePips = 0;
    let newHealth = this.health.value;

    if (type == 'health') {
      healthPips = Math.floor(healing / this.damageIncrement.value);
      let remainder = healing % this.damageIncrement.value;

      newHealth = this.health.value - healthPips - this.health.wounds.value; // Offset health wounds value so endurance remainder is accurate
      if (newHealth < 0) {
        // Remainder of health pips go to endurance
        endurancePips = Math.abs(newHealth);
        newHealth = 0;
      }

      if (remainder > 0) endurancePips += 1;
    }
    if (type == 'endurance') {
      endurancePips = healing;
    }

    let newEndurance = Math.max(0, this.endurance.value - endurancePips);

    if (healthPips > 0) {
      updateObj.data!.health!.value = newHealth;
      message += `+ ${game.i18n.format('PILLARS.ApplyHealth', { value: healthPips })}`;
    }

    if (endurancePips > 0) {
      updateObj.data!.endurance!.value = newEndurance;
      message += `+ ${game.i18n.format('PILLARS.ApplyEndurance', { value: endurancePips })}`;
    }

    if (this.isOwner || !game.settings.get('pillars-of-eternity', 'playerApplyDamage')) this.update(updateObj);
    else if (game.settings.get('pillars-of-eternity', 'playerApplyDamage'))
      game.socket!.emit('system.pillars-of-eternity', {
        type: 'updateActor',
        payload: { updateData: updateObj, speaker: this.speakerData() },
      });

    return message;
  }

  calculateShieldDamage(shield: PillarsItem, damage: number) {
    let damageToShield = Math.min(shield.Soak || 0, damage);

    let shieldObj = shield.toObject();

    if (shieldObj.type == 'shield') shieldObj.data.health.current -= damageToShield;
    return shieldObj; // Return data instead of updating it to send it with the rest of the update
  }

  /**
   * Helper method to easily update seasonal data
   *
   * @param year Number - year being updated
   * @param type Property being updated, such as `aging` or `winter`
   * @param message Value being added to the property
   * @returns
   */
  updateSeasonYear(year: number, type: string, message: string) {
    if (this.seasons) {
      let seasons = duplicate(this.seasons);
      let index = seasons.findIndex((s) => s.year == year);
      return this.updateSeasonIndex(index, type, message);
    } else throw new Error(getGame().i18n.format('PILLARS.ErrorYearNotFound', { year }));
  }

  /**
   * Helper method to easily update seasonal data
   *
   * @param index index of the season being updated
   * @param type Property being updated, such as `aging` or `winter`
   * @param message Value being added to the property
   * @returns
   */
  updateSeasonIndex(index: number, type: string, message: string) {
    if (this.seasons) {
      let seasons = duplicate(this.seasons);
      let season = seasons[index];

      if (season) {
        setProperty(season, type, message);
        return this.update({ 'data.seasons': seasons });
      } else throw new Error(getGame().i18n.format('PILLARS.ErrorSeasonIndex', { index }));
    }
  }

  /**
   *
   * Set a follower type, ignore subsequent changes
   *
   * @param string Type value, "expert", "generalist", etc.
   */
  async setFollowerType(followerType: keyof typeof PILLARS.followerTypes) {
    let game = getGame();
    if (this.data.type != 'follower' || !this.data.data.subtype.value) {
      // If already has a subtype, ignore change
      let filterData: ItemDialogData = <ItemDialogData>{
        filters: [
          {
            type: 'comparison',
            test: '==',
            value: 'skill',
            target: 'type',
          },
        ],
      };

      let followerSkills = PILLARS.followerSkills[followerType];
      for (let skills of followerSkills) {
        filterData.choices = skills.number;
        filterData.diff = { 'data.modifier.value': skills.rank };
        filterData.text = game.i18n.format('PILLARS.FollowerSkillPrompt', skills);
        let skillsSelected = await ItemDialog.create(filterData);

        this.createEmbeddedDocuments(
          'Item',
          skillsSelected.map((i) => {
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
  setFollowerSpecies(speciesItem: PillarsItem) {
    let game = getGame();
    let time = game.settings.get('pillars-of-eternity', 'season');
    let year = time.year;
    let YA_age = speciesItem.phases!['youngAdult'][0]!;
    let age = YA_age + Math.ceil(CONFIG.Dice.randomUniform() * 6);
    let birthYear = year - age;

    return this.update({ 'data.life': { birthYear, startYear: year } });
  }

  /**
   * Compares the current time in the world settings and returns the index-season values that need updating
   */
  get seasonsNeedUpdating(): Record<string, boolean> | boolean {
    let needsUpdating: Record<string, boolean> = {};
    let currentTime = getGame().settings.get('pillars-of-eternity', 'season');
    if (this.seasons) {
      this.seasons.forEach((s, i) => {
        if (Number.isNumeric(s.year)) {
          if (!s.autumn && PILLARS_UTILITY.isLaterDate(currentTime, { season: Season.AUTUMN, year: s.year })) {
            needsUpdating[`${i}-autumn`] = true;
          }
          if (!s.spring && PILLARS_UTILITY.isLaterDate(currentTime, { season: Season.SPRING, year: s.year })) {
            needsUpdating[`${i}-spring`] = true;
          }
          if (!s.summer && PILLARS_UTILITY.isLaterDate(currentTime, { season: Season.SUMMER, year: s.year })) {
            needsUpdating[`${i}-summer`] = true;
          }
          if (!s.winter && PILLARS_UTILITY.isLaterDate(currentTime, { season: Season.WINTER, year: s.year })) {
            needsUpdating[`${i}-winter`] = true;
          }
          if (!s.aging && PILLARS_UTILITY.isLaterDate(currentTime, { season: Season.WINTER, year: s.year })) {
            needsUpdating[`${i}-aging`] = true;
          }
        }
      });
      return foundry.utils.isObjectEmpty(needsUpdating) ? false : needsUpdating;
    } else return false;
  }

  // addWound(type)
  // {
  //     return this.update({[`data.health.wounds.${type}`] : this.health.wounds[type] + 1 })
  // }

  //#region Getters
  // @@@@@@@@ CALCULATION GETTERS @@@@@@
  // get woundModifier() {
  //   let woundModifier = 0;
  //   woundModifier +=
  //     this.health.wounds.light * (this.health.threshold.light / 2);
  //   woundModifier +=
  //     this.health.wounds.heavy * (this.health.threshold.heavy / 2);
  //   woundModifier +=
  //     this.health.wounds.severe * (this.health.threshold.severe / 2);
  //   return woundModifier;
  // }

  // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

  // @@@@@@@ ITEM GETTERS @@@@@@@@@

  get equippedShield() {
    return this.getItemTypes(ItemType.shield).filter((i) => i.equipped?.value)[0];
  }

  get equippedArmor() {
    return this.getItemTypes(ItemType.armor).filter((i) => i.equipped?.value)[0];
  }

  // @@@@@@@@ DATA GETTERS @@@@@@@@@@

  get defenses() {
    return this.data.data.defenses;
  }
  get endurance() {
    return this.data.data.endurance;
  }
  get health() {
    return this.data.data.health;
  }
  get life() {
    if (this.data.type == 'character' || this.data.type == "follower") return this.data.data.life;
  }
  get size() {
    return this.data.data.size;
  }
  get tier() {
    return this.data.data.tier;
  }
  get details() {
    if (this.data.type == 'character' || this.data.type == 'follower') return this.data.data.details;
  }
  get knownConnections() {
    if (this.data.type == 'character') return this.data.data.knownConnections;
  }
  get stride() {
    return this.data.data.stride;
  }
  get run() {
    return this.data.data.run;
  }
  get initiative() {
    return this.data.data.initiative;
  }
  get seasons() {
    if (this.data.type == 'character') return this.data.data.seasons;
  }
  get soak() {
    return this.data.data.soak;
  }
  get toughness() {
    return this.data.data.toughness;
  }
  get damageIncrement() {
    return this.data.data.damageIncrement;
  }
  get subtype() {
    if (this.data.type == 'follower') return this.data.data.subtype;
  }
}
//#endregion
