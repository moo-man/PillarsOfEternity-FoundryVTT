import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { ChatSpeakerDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData';
import { TokenDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tokenData';
import { PillarsActor } from '../module/actor/actor-pillars';
import { PillarsItem } from '../module/item/item-pillars';
import PillarsActiveEffect from '../module/system/pillars-effect';
import { PillarsEffectChangeDataProperties } from './effects';
import { PowerDamage, PowerHealing } from './powers';

export enum State {
  ADVANTAGED = 'adv',
  NORMAL = 'normal',
  DISADVANTAGED = 'dis',
}

export interface CheckDataFlattened {
  title: string;
  modifier: string;
  steps: number;
  proxy: string;
  assister: string;
  state: State;
  skillId: string;
  skillName: string;
  speaker: ChatSpeakerDataProperties;
  targetSpeakers: ChatSpeakerDataProperties[];
  rollClass: string; //this.constructor.name,
  rollMode: keyof CONFIG.Dice.RollModes;
  messageId: string;
}

export interface WeaponCheckDataFlattened extends CheckDataFlattened {
  add: CheckAddData;
  itemId: string;
}

export interface PowerCheckDataFlattened extends CheckDataFlattened {
  sourceId: string;
  itemId: string;
}

export interface AgingCheckDataFlattened {
  title: string;
  speaker: ChatSpeakerDataProperties;
  modifier: string;
  lifestyle: string;
}
export interface CheckOptions {
  name?: string;
  add?: CheckAddData;
}

export interface CheckDialogData {
  title: string;
  modifier: string;
  steps: 0;
  changeList: PillarsEffectChangeDataProperties[];
  changes: PillarsEffectChangeDataProperties[];
  actor: PillarsActor;
  targets: Token[];
  rollModes: CONFIG.Dice.RollModes;
  rollMode: keyof CONFIG.Dice.RollModes;
  item: PillarsItem;
  options: CheckOptions;
  state: { normal?: boolean; adv?: boolean; dis?: boolean };
}

export interface SkillDialogData extends CheckDialogData {
  assisters: AssisterData[];
  hasRank: boolean;
  skill: PillarsItem | undefined;
}

export interface AgingDialogData extends Dialog.Data {
  dialogData: {
    modifier: number;
    changeList: PillarsEffectChangeDataProperties[];
    changes: PillarsEffectChangeDataProperties[];
  };
}

export interface WeaponDialogData extends SkillDialogData {}

export interface PowerDialogData extends CheckDialogData {
  hasRank: boolean;
}

export interface AssisterData {
  name: string;
  id: string;
  rank: number;
  die: string;
}

export interface DamageOptions {
  shield: boolean;
}

export type SkillCheckData = {
  checkData: {
    title: string;
    modifier: string;
    steps: number;
    proxy: string;
    assister: string;
    state: State;
    skillId: string;
    skillName: string;
  };
  context: {
    speaker: ChatSpeakerDataProperties;
    targetSpeakers: ChatSpeakerDataProperties[];
    rollClass: string;
    rollMode: keyof CONFIG.Dice.RollModes;
    messageId: string;
  };
  result: ReturnType<Roll['toJSON']> & { results: Array<number | string> };
};

export type WeaponCheckData = {
  checkData: {
    add: CheckAddData
    itemId: string;
  };
} & SkillCheckData;

export interface CheckAddData {
  damage?: PowerDamage[];
  effects?: (PillarsActiveEffect | {data : Partial<ActiveEffectDataConstructorData & { id: string }>, id : string})[];
}

export type PowerCheckData = {
  checkData: {
    sourceId: string;
    itemId: string;
  };
  result: {
    chosenWeapon: string;
  };
} & SkillCheckData;

export type AgingCheckData = {
  checkData: {
    title: string;
    modifier: string;
    lifestyle: string;
  };
  context: {
    speaker: ChatSpeakerDataProperties;
    rollClass: string;
  };
  result: {};
};

export interface DamageRollData {
  damages: (DialogDamage & DialogHealing)[];
  checkId: string;
  damageData: [];
  rollMessageIds: string[];
  healing: boolean;
  usingShield: string[];
}

export type DialogDamage = {
  mult?: number | undefined;
  target?: string | TokenDocument | null | undefined;
  img?: string | null | undefined;
  misses?: TokenDataProperties[];
  healing?: boolean;
} & PowerDamage;

export type DialogHealing = {
  target?: string | TokenDocument | null | undefined;
  img?: string | null | undefined;
  healing?: boolean;
} & PowerHealing;

export interface ConsolidatedDamage extends Omit<DialogDamage, 'target'> {
  value?: string;
  target: DamageTarget[];
  parts: DamageTermToolTip[];
  roll: Roll;
}

export interface DamageTarget {
  token?: TokenDataProperties | null;
  crit: number;
  shield?: boolean;
}

export interface DamageTermOptions extends RollTerm.Options {
  crit: string | number;
  accumulator?: number;
  targets: DamageTarget[];
}

export interface DamageTermToolTip extends DiceTerm.ToolTipData {
  options: DamageTermOptions;
}
