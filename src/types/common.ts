import { Category, Equipped, Physical, Used, XP } from "../global";
import { PillarsItem } from "../module/document/item-pillars";
import { PILLARS } from "../module/system/config";
import { EmbeddedPower } from "./powers";

export enum Defense {
  DEFLECTION = "deflection",
  WILL = "will",
  REFLEX = "reflex",
  FORTITUDE = "fortitude",
}

export enum ItemType {
  attribute = "attribute",
  skill = "skill",
  trait = "trait",
  power = "power",
  powerSource = "powerSource",
  weapon = "weapon",
  armor = "armor",
  shield = "shield",
  equipment = "equipment",
  connection = "connection",
  culture = "culture",
  background = "background",
  setting = "setting",
  species = "species",
  stock = "stock",
  godlike = "godlike",
  reputation = "reputation",
  injury = "injury",
  bond = "bond",
  space = "space",
  defense = "defense",
}

export enum Tier {
  NOVICE = "novice",
  APPRENTICE = "apprentice",
  MASTER = "master",
  EXPERT = "expert",
  PARAGON = "paragon",
}

export enum LifePhase {
  CHILDHOOD = "childhood",
  ADOLESCENCE = "adolescence",
  YOUNGADULT = "youngAdult",
  ADULT = "adult",
  MIDDLEAGE = "middleAge",
  OLD = "old",
  VENERABLE = "venerable",
}

export enum SoakType {
  BASE = "base",
  SHIELD = "shield",
  PHYSICAL = "physical",
  BURN = "burn",
  FREEZE = "freeze",
  RAW = "raw",
  CORRODE = "corrode",
  SHOCK = "shock",
}

export enum DamageType {
  PHYSICAL = "physical",
  BURN = "burn",
  FREEZE = "freeze",
  RAW = "raw",
  CORRODE = "corrode",
  SHOCK = "shock",
}

// export type UpdateValue = string | number | UpdateObject[]

// export type UpdateObject = {
//   [key : string] : unknown
// }

interface Useable {
  system: Used
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


interface UsableItem {
  data : Useable
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

interface XPItem {
  data : XPData
  
}

interface XPData {
    data : XP & {modifier : {value : number}}
}

export interface BookYearData {
  year: number;
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
  aging: string;
}

export interface ItemDialogData {
  filters : ItemFilter[],
  text : string,
  diff : Record<string, unknown>
  collection : Collection<PillarsItem>,
  choices : number
}

export interface ItemFilter {
  type : "comparison" | "regex",
  test : string,
  target : string,
  value : string | number
}

export function isUsable(item: any): item is Useable 
{
    return item.system.used;
}

export function isUsableItem(item: any): item is UsableItem 
{
    return item.system.used;
}

export function hasEmbeddedPowers(item: any): item is EmbeddedPowersItem 
{
    return PILLARS.allowEmbeddedPowers.includes(item.type);
}

export function hasCategory(item: any) : item is CategoryItem 
{
    return true;
}

export function isEquippable(item : any) : item is EquippableItem
{
    return item.system.equipped != undefined;
}

export function isEquippableData(item : any) : item is EquippableData
{
    return item.data.equipped != undefined;
}

export function isPhysical(item : any) : item is PhysicalItem
{
    return item.system.weight != undefined && item.system.quantiy != undefined && item.system.cost != undefined;
}

export function hasXP(item : any) : item is XPItem
{
    return item.system.xp;
}

export function hasXPData(item : any) : item is XPData
{
    return item.data.xp;
}