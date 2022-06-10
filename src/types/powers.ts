// export enum PowerRanges  {
//     NONE = "None",
//     ADJACENT = "Adjacent",
//     MELEEWEAPON = "Melee Weapon",
//     CLOSE = "Close",
//     EQUIPPEDWEAPON = "Equipped Weapon",
//     MID = "Mid",
//     FAR = "Far",
//     EXTREME = "Extreme"
// }

import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PowerSource } from "../global";
import { PillarsActor } from "../module/actor/actor-pillars";
import { PillarsItem } from "../module/item/item-pillars";
import { PILLARS } from "../module/system/config";

// export enum PowerTargetTypes  {
//     TARGET = "Target",
//     CIRCLE = "Circle",
//     AURA = "Aura",
//     CONE = "Cone",
//     RAY = "Ray",
//     LINE = "Line",
//     BOUNDARY = "Boundary"
// }

// export enum PowerTargets  {
//     SELF = "Self",
//     INDIVIDUALEU = "Individual EU",
//     INDIVIDUAL = "Individual",
//     SPACE = "Space"
// }

// export enum PowerCircles  {
//     SMALL = "Small Circle",
//     MEDIUM = "Medium Circle",
//     LARGE = "Large Circle"
// }

// export enum PowerAuras  {
//     SMALL = "Small Aura",
//     LARGE = "Large Aura"
// }

// export enum PowerCones  {
//     SMALL = "Small Cone",
//     MEDIUM = "Medium Cone",
//     LARGE = "Large Cone"
// }

// export enum PowerRays  {
//     NARROW = "Narrow Ray",
//     WIDE = "Wide Ray"
// }

// export enum PowerLines  {
//     SHORT = "Short Line",
//     LONG = "Long Line"
// }

// export enum PowerBoundarys  {
//     ADJACENT = "Adjacent Boundary",
//     SMALL = "Small Boundary",
//     LARGE = "Large Boundary",
//     HUGE = "Huge Boundary"
// }

// export enum PowerDurations  {
//     MOMENTARY = "Momentary",
//     MOMENTARY2R = "Momentary 2R",
//     ROUND = "Round",
//     ENCOUNTER = "Encounter",
//     ENCOUNTERPERROUND = "Encounter Per Round",
//     CONCENTRATION = "Concentration",
//     BOUNDARY = "Boundary",
//     DAY = "Day",
//     WEEK = "Week",
//     MONTH = "Month",
//     SEASON = "Season",
//     YEAR = "Year"
// }

// export enum PowerSpeeds  {
//     SLOW = "Slow",
//     MOVE = "Move",
//     ACTION = "Action",
//     IMMEDIATE = "Immediate",
//     REACTION = "Reaction",
//     TRIGGERED1REST = "Triggered 1/Rest",
//     TRIGGERED1ENCOUNTER = "Triggered 1/Encounter"
// }

// export enum PowerExclusions  {
//     NONE = "None",
//     TARGET = "Target",
//     SINGLE = "Single",
//     SELECTIVE = "Selective"
// }

// export enum PowerJumps  {
//     JUMP3 = "3 Hexes",
//     JUMP6 = "6 Hexes",
//     JUMP9 = "9 Hexes"
// }

export interface PowerTarget {
  group: string;
  value: string;
  subtype: string;
  targeted: false;
  exclusion: string; //PowerExclusions;
  subchoices? : {[key : string] : string}; // In Sheet Data
}

export interface PowerDuration {
  group: string;
  value: string; //PowerDurations;
}

export interface PowerRange {
  group: string;
  value: string; //PowerRanges;
}

export interface PowerHealing {
  group: string;
  label : string
  value: string;
  type: string;
}

export interface PowerMisc {
  group: string;
  value: string;
  modifier: number;
}

export interface PowerDamage {
  label : string,
  group: string;
  base: string;
  crit: string;
  defense: string;
  type: string;
  defaultCrit: number;
}

export interface PowerBaseEffect {
  text: string
  group: string
  value: string
  defense: string
}

export interface PowerSummon {
  group : string,
  data : ItemDataConstructorData,
  modifier? : number
}

export interface PowerGroups {
  [K: string]: PowerGroup;
}

export interface PowerGroup {
  target: PowerTarget[];
  range: PowerRange[];
  duration: PowerDuration[];
  damage: PowerDamage[];
  effects: PowerBaseEffect[];
  healing: PowerHealing[];
  misc: PowerMisc[];
  display: PowerDisplay
}

export interface PowerDisplay {
    target: string;
    range: string;
    duration: string;
    damage: string;
    effects: string;
    healing: string;
    misc: string;
}

export interface EmbeddedPower extends PowerSource
{
    name? : string
    _id? : string

}

export interface PowersConstructorContext extends Context<PillarsActor> {
  embedded? :{
    object: PillarsItem,
    index : number
  }
}