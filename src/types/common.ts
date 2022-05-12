export enum Defense {
    DEFLECTION = "deflection",
    WILL = "will",
    REFLEX = "reflex",
    FORTITUDE = "fortitude"
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
  }

  export enum Tier {
    NOVICE = "novice",
    APPRENTICE = "apprentice",
    MASTER = "master",
    EXPERT = "expert",
    PARAGON = "paragon"
  }

  export enum LifePhase {
    CHILDHOOD = "childhood",
    ADOLESCENCE = "adolescence",
    YOUNGADULT = "youngAdult",
    ADULT = "adult",
    MIDDLEAGE = "middleAge",
    OLD = "old",
    VENERABLE = "venerable"
  }

  export enum SoakType {
    BASE = "base",
    SHIELD = "shield",
    PHYSICAL = "physical",
    BURN = "burn",
    FREEZE = "freeze",
    RAW = "raw",
    CORRODE = "corrode",
    SHOCK = "shock"
  }

  // export type UpdateValue = string | number | UpdateObject[]

  // export type UpdateObject = {
  //   [key : string] : unknown
  // }

  export interface Useable {
      data : {
        used : {
          value : boolean
        } 
    }
  }

  export interface Season {
      year : number,
      spring : string
      summer : string
      autumn : string
      winter : string
      aging : string
  }