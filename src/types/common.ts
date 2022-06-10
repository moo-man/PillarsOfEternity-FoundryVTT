import { Category, Equipped, Physical, Used } from '../global';
import { PILLARS } from '../module/system/config';
import { EmbeddedPower } from './powers';

export enum Defense {
  DEFLECTION = 'deflection',
  WILL = 'will',
  REFLEX = 'reflex',
  FORTITUDE = 'fortitude',
}

export enum ItemType {
  attribute = 'attribute',
  skill = 'skill',
  trait = 'trait',
  power = 'power',
  powerSource = 'powerSource',
  weapon = 'weapon',
  armor = 'armor',
  shield = 'shield',
  equipment = 'equipment',
  connection = 'connection',
  culture = 'culture',
  background = 'background',
  setting = 'setting',
  species = 'species',
  stock = 'stock',
  godlike = 'godlike',
  reputation = 'reputation',
  injury = 'injury',
}

export enum Tier {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  MASTER = 'master',
  EXPERT = 'expert',
  PARAGON = 'paragon',
}

export enum LifePhase {
  CHILDHOOD = 'childhood',
  ADOLESCENCE = 'adolescence',
  YOUNGADULT = 'youngAdult',
  ADULT = 'adult',
  MIDDLEAGE = 'middleAge',
  OLD = 'old',
  VENERABLE = 'venerable',
}

export enum SoakType {
  BASE = 'base',
  SHIELD = 'shield',
  PHYSICAL = 'physical',
  BURN = 'burn',
  FREEZE = 'freeze',
  RAW = 'raw',
  CORRODE = 'corrode',
  SHOCK = 'shock',
}

export enum DamageType {
  PHYSICAL = 'physical',
  BURN = 'burn',
  FREEZE = 'freeze',
  RAW = 'raw',
  CORRODE = 'corrode',
  SHOCK = 'shock',
}

// export type UpdateValue = string | number | UpdateObject[]

// export type UpdateObject = {
//   [key : string] : unknown
// }

interface Useable {
  data: Used
}

interface EmbeddedPowersItem {
  data: {
    data: {
      powers: EmbeddedPower[]
      powerRecharge : string,
      powerCharges : {
          value : number,
          max : number
      }
    };
  };
}

interface CategoryItem {
  data : {
    data: Category
  }
}

interface EquippableItem {
  data : EquippableData
}

interface EquippableData {
    data: Equipped 
}

interface PhysicalItem {
  data : {
    data : Physical
  }
}

export interface Season {
  year: number;
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
  aging: string;
}

export function isUsable(item: any): item is Useable {
  return true;
}

export function hasEmbeddedPowers(item: any): item is EmbeddedPowersItem {
  return PILLARS.allowEmbeddedPowers.includes(item.type);
}

export function hasCategory(item: any) : item is CategoryItem {
  return true
}

export function isEquippable(item : any) : item is EquippableItem
{
  return item.data.data.equipped != undefined
}

export function isEquippableData(item : any) : item is EquippableData
{
  return item.data.equipped != undefined
}

export function isPhysical(item : any) : item is PhysicalItem
{
  return item.data.data.weight != undefined && item.data.data.quantiy != undefined && item.data.data.cost != undefined
}