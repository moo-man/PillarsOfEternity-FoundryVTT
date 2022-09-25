import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { Defense, LifePhase, Season, SeasonContextData, SeasonData } from './types/common';
import {
  EmbeddedPower,
  PowerBaseEffect,
  PowerDamage,
  PowerDuration,
  PowerGroup,
  PowerGroups,
  PowerHealing,
  PowerMisc,
  PowerRange,
  PowerSummon,
  PowerTarget,
} from './types/powers';
import { BondTrait, WeaponSpecial } from './types/items';
import { PILLARS } from "./module/system/config";
import DamageDialog from './module/apps/damage-dialog';
import SkillCheck from './module/system/skill-check';
import DamageRoll from './module/system/damage-roll';
import { PillarsActorSheet } from './module/actor/actor-sheet';
import { PillarsItemSheet } from './module/item/item-sheet';
import BookOfSeasons from './module/apps/book-of-seasons';
import RollDialog from './module/apps/roll-dialog';
import ActorConfigure from './module/apps/actor-configure';
import HealingDialog from './module/apps/healing-dialog';
import WeaponCheck from './module/system/weapon-check';
import PowerCheck from './module/system/power-check';
import Migration from './module/system/migrations';
import { PILLARS_UTILITY } from './module/system/utility';
import { PillarsChat } from './module/system/chat';
import PowerTemplate from './module/system/power-template';
import TimeTracker from './module/apps/time-tracker';
import SeasonalActivityApplication from './module/apps/seasonal/seasonal-activity';

//#region Actor

//#region Source Data
export interface PillarsActorSourceSystemData {
  defenses: {
    [key in Defense]: {
      value: number;
      base: number;
      bonus: number;
      penalty: number;
      checked: boolean;
    };
  };
  health: ActorHealthSourceData
  endurance: ActorEnduranceSourceData
  soak: {
    base: number;
    shield: number;
    physical: number;
    burn: number;
    freeze: number;
    raw: number;
    corrode: number;
    shock: number;
  };
  toughness: {
    value: number;
  };
  damageIncrement: {
    value: number;
  };
  size: {
    value: number;
  };
  stride: {
    value: number;
  };
  run: {
    value: number;
  };
  initiative: {
    value: number;
  };
  description: {
    value: string;
    gm: string;
  };
  tier: {
    value: string;
  };
  wealth: {
    cp: number;
  };
  notes: {
    value: string;
  };
}

export interface PillarsCharacterSourceSystemData
  extends PillarsActorSourceSystemData {
  life: {
    age: number;
    apparentAge: number;
    phase: LifePhase;
    agingPoints: number;
    march: number;
  };
  details: {
    cause: string;
    call: string;
    goal: string;
    relationships: string;
    culture: string;
    species: string;
    stock: string;
    godlike: string;
  };
  knownConnections: {
    value: {name : string}[];
  };
  childhood: {
    value: string;
  };
  seasons : SeasonData[]
}

export interface PillarsFollowerSourceSystemData
  extends PillarsActorSourceSystemData {
  details: {
    culture: string;
    species: string;
    stock: string;
    godlike: string;
  },
  life : {
    birthYear : number,
    phase : LifePhase,
    startYear : number,
  }
  subtype : {
    value : string
  }
  loyalty : {
    value : number
  }
  upkeep: {
    value : number
  }
}

export interface PillarsHeadquartersSourceSystemData {
  residents : {
    list : {id : string, count : number}[],
    extra: 0
  },
  staff : {
    list : {id : string, count : number}[],
    extra : 0
  },
  size : number,
  accommodations : {
      prepared : number
  },
  library : {
    [key: string] : unknown
  },

  disrepair: number,
  log : {
    [key: string] : unknown
  }
}

interface CharacterDataSource {
  type: 'character';
  data: PillarsCharacterSourceSystemData;
}

interface NPCDataSource {
  type: 'npc';
  data: PillarsActorSourceSystemData;
}

interface FollowerDataSource {
  type: 'follower';
  data: PillarsFollowerSourceSystemData;
}

interface HeadquartersDataSource {
  type: 'headquarters';
  data: PillarsHeadquartersSourceSystemData;
}


export type PillarsActorSourceData = CharacterDataSource | NPCDataSource | FollowerDataSource | HeadquartersDataSource;

export type PillarsNonHeadquartersActorSourceData = CharacterDataSource | NPCDataSource | FollowerDataSource

//#endregion

//#region Prepared Data

export interface BasePreparedPillarsActorData
  extends PillarsActorSourceSystemData {
  health: ActorHealthPreparedData
  endurance: ActorEndurancePreparedData;
  weight: number;
}

export interface PreparedPillarsCharacterData
  extends BasePreparedPillarsActorData {
  life: {
    age: number;
    apparentAge: number;
    phase: LifePhase;
    agingPoints: number;
    march: number;
  };
  details: {
    cause: string;
    call: string;
    goal: string;
    relationships: string;
    culture: string;
    species: string;
    stock: string;
    godlike: string;
  };
  knownConnections: {
    value: {name : string}[];
  };
  childhood: {
    value: string;
  };
  seasons : SeasonData[]
}

interface PillarsActorTooltips {
  defenses: {
    deflection: string[];
    reflex: string[];
    fortitude: string[];
    will: string[];
  };
  health: {
    max: string[];
    threshold: {
      bloodied: string[];
      incap: string[];
    };
  };
  endurance: {
    max: string[];
    threshold: {
      winded: string[];
    };
  };
  initiative: {
    value: string[];
  };
  soak: {
    base: string[];
    shield: string[];
    physical: string[];
    burn: string[];
    freeze: string[];
    raw: string[];
    corrode: string[];
    shock: string[];
  };
  stride: {
    value: string[];
  };
  run: {
    value: string[];
  };
  toughness: {
    value: string[];
  };
  damageIncrement: {
    value: string[];
  };
}

export interface PreparedPillarsFollowerData
  extends BasePreparedPillarsActorData {
  details: {
    culture: string;
    species: string;
    stock: string;
    godlike: string;
  },
  life : {
    age : number
    birthYear : number,
    phase : LifePhase,
    startYear : number,
  },
  subtype : {
    value : string
  }
  loyalty : {
    value : number
  }
  upkeep: {
    value : number
  }
}


export interface PreparedPillarsHeadquartersData extends PillarsHeadquartersSourceSystemData {

}

type PreparedPillarsNPC = {
  type: 'npc';
  data: BasePreparedPillarsActorData;
  flags: {
    tooltips: PillarsActorTooltips;
  };
};

type PreparedPillarsFollower = {
  type: 'follower';
  data: PreparedPillarsFollowerData;
  flags: {
    tooltips: PillarsActorTooltips;
  };
};

type PreparedPillarsCharacter = {
  type: 'character';
  data: PreparedPillarsCharacterData;
  flags: {
    tooltips: PillarsActorTooltips;
  };
};

type PreparedPillarsHeadquarters = {
  type : "headquarters";
  data : PreparedPillarsHeadquartersData
}

export type PreparedPillarsActorData =
  | PreparedPillarsCharacter
  | PreparedPillarsNPC
  | PreparedPillarsFollower
  | PreparedPillarsHeadquarters;
  

  export type PreparedPillarsNonHeadquartersActorData = 
  | PreparedPillarsCharacter
  | PreparedPillarsNPC
  | PreparedPillarsFollower;
  

//#endregion 

//#endregion

//#region Items

//#region Templates
export interface Category {
  category: {
    value: string;
  };
}
interface Description {
  description: {
    value: string;
    gm: string;
  };
}
export interface Rank {
  rank: {
    value: number;
  };
}
export interface XP {
  xp: {
    value: number;
    rank?: number;
    level?: number;
  };
}
export interface Physical {
  cost: {
    value: number;
  };
  weight: {
    value: number;
  };
  quantity: {
    value: number;
  };
  size : {
    value : keyof typeof PILLARS.itemSizes
  }
}
export interface Used {
  used: {
    value: boolean;
  };
}
export interface Equipped {
  equipped: {
    value: boolean;
  };
}

interface Powers {
  powers: EmbeddedPower[];
  powerRecharge: string;
  powerCharges: {
    value: number;
    max: number;
  };
}

//#endregion

export interface AttributeSource {
  type: 'attribute';
  data: AttributeSourceData;
}

export interface AttributeSourceData extends Description, Powers {
  category: {
    value: string;
  };
}

export interface SkillSource {
  type: 'skill';
  data: SkillSourceData;
}

export interface SkillSourceData extends Description, Category, XP, Used {
  specialization: {
    value: string;
    has: boolean;
  };
  requires: {
    value: [];
  };
  modifier: {
    value: number;
  };
}

export interface TraitSource {
  type: 'trait';
  data: TraitSourceData;
}

export interface TraitSourceData extends Description, Category, Used, Powers {
  category: {
    value: string;
  };
}

export interface PowerSource {
  type: 'power';
  data: PowerSourceData;
  ownedId?: string
  groups? : PowerGroups
  display? : PowerGroup
}

export interface PowerSourceData extends Description, Category {
  level: {
    value: number;
    modifier: number;
    cost : number // NOTE: Does not exist on source, actually exists only on prepared data
};
  source: {
    value: string;
  };
  roll: {
    value: boolean;
  };
  base: {
    effects: PowerBaseEffect[];
    cost: number;
  };
  embedded: {
    item: string;
    spendType: string;
    uses: {
      value: number;
      max: number;
    };
    chargeCost: number;
  };
  damage: {
    value: PowerDamage[];
  };
  healing: PowerHealing[];
  range: PowerRange[];
  target: PowerTarget[];
  duration: PowerDuration[];
  summons: PowerSummon[];
  misc: PowerMisc[];

  speed: {
    value: string//PowerSpeeds;
    text: string;
  };
  limitations: {
    group: '';
    value: string;
  };
  improvised: {
    value: boolean;
  };
  pl : number // NOTE: Does not exist on source, actually exists only on prepared data
}

export interface PowerSourceSource {
  type: 'powerSource';
  data: PowerSourceSourceData;
}

export interface PowerSourceSourceData extends Description, Category, XP {
  category: {
    value: string;
  };
  source: {
    value: string;
  };
  pool: {
    max: number;
    current: number;
    pct : number // NOTE: Does not exist on source, actually exists only on sheet data
  };
  attack : number // NOTE: Does not exist on source, actually exists only on prepared data
}

export interface WeaponSource {
  type: 'weapon';
  data: WeaponSourceData;
}

export interface WeaponSourceData
  extends Description,
    Category,
    Physical,
    Equipped,
    Powers {
  skill: {
    value: string;
  };
  accuracy: {
    value: number;
  };
  misc: {
    value: number;
  };
  damage: {
    value: [];
  };
  special: {
    value: WeaponSpecial[];
  };
  range: {
    value: string;
  };
}

export interface ArmorSource {
  type: 'armor';
  data: ArmorSourceData;
}

export interface ArmorSourceData
  extends Description,
    Category,
    Physical,
    Equipped,
    Powers {
  soak: {
    value: number;
  };
  winded: {
    value: number;
  };
  initiative: {
    value: number;
  };
  stride: {
    value: number;
  };
  run: {
    value: number;
  };
  toughness: {
    value: number;
  };
}

export interface ShieldSource {
  type: 'shield';
  data: ShieldSourceData;
}

export interface ShieldSourceData
  extends Description,
    Category,
    Physical,
    Equipped,
    Used,
    Powers {
  soak: {
    value: number;
  };
  health: {
    max: number;
    current: number;
  };
  winded: {
    value: number;
  };
  deflection: {
    value: number;
  };
}

export interface EquipmentSource {
  type: 'equipment';
  data: EquipmentSourceData;
}

export interface EquipmentSourceData
  extends Description,
    Category,
    Physical,
    Equipped,
    Powers {
  category: {
    value: string;
  };
  skill: {
    value: string;
    suitability: string;
  };
  subtype : {
    value : string
  },
  range : number[],
  subject : {
    value: string
  }
  training : {
      value : number
  },
  language : {
      value : string
  },
  wearable: {
    value: boolean;
  };
  qualities : {
    greater :  string,
    lesser : string
  }
}

export interface ConnectionSource {
  type: 'connection';
  data: ConnectionSourceData;
}

export interface ConnectionSourceData extends Description, XP {
  group: {
    value: string;
  };
  modifier: {
    value: number;
  };
}

export interface CultureSource {
  type: 'culture';
  data: CultureSourceData;
}

export interface CultureSourceData extends Description {
  languages: {
    native: [];
    local: [];
  };
  skills: {
    value: [];
  };
}

export interface BackgroundSource {
  type: 'background';
  data: BackgroundSourceData;
}

export interface BackgroundSourceData extends Description {
  setting: {
    value: string;
    id: string;
  };
  skills: {
    value: [];
  };
  years: {
    value: number;
  };
}

export interface SettingSource {
  type: 'setting';
  data: SettingSourceData;
}

export interface SettingSourceData extends Description {
  xp: {
    free: number;
    connections: number;
  };
  cp: {
    value: number;
  };
  transition: {
    value: number;
  };
}

export interface SpeciesSource {
  type: 'species';
  data: SpeciesSourceData;
}

export interface SpeciesSourceData extends Description, Powers {
  size: {
    value: number;
  };
  stride: {
    value: number;
  };
  species: {
    value: string;
  };
  phases : {
    childhood :  number[],
    adolescence : number[],
    youngAdult : number[],
    adult : number[],
    middleAge : number[],
    old : number[],
    venerable : number[]
},
}

export interface StockSource {
  type: 'stock';
  data: StockSourceData;
}

export interface StockSourceData extends Description, Powers {}

export interface GodlikeSource {
  type: 'godlike';
  data: GodlikeSourceData;
}

export interface GodlikeSourceData extends Description, Powers {}

export interface ReputationSource {
  type: 'reputation';
  data: ReputationSourceData;
}

export interface ReputationSourceData extends Description, XP {
  group: {
    value: string;
  };
  modifier: {
    value: number;
  };
}

export interface InjurySource {
  type: 'injury';
  data: InjurySourceData;
}

export interface InjurySourceData extends Description {}

export interface BondSource {
  type: 'bond';
  data: BondSourceData;
  active : boolean // NOTE: Does not exist on source, actually exists only on prepared data
}

export interface BondSourceData extends Description, XP {
  traits : string[]
  partner : string
  modifier : {
    value : number
  }
}

type PillarsItemDataSource =
 | AttributeSource
 | SkillSource
 | TraitSource
 | PowerSource
 | PowerSourceSource
 | WeaponSource
 | ArmorSource
 | ShieldSource
 | EquipmentSource
 | ConnectionSource
 | CultureSource
 | BackgroundSource
 | SettingSource
 | SpeciesSource
 | StockSource
 | GodlikeSource
 | ReputationSource
 | InjurySource
 | BondSource

export type PillarsItemSystemData  =
AttributeSourceData |
SkillSourceData |
TraitSourceData |
PowerSourceData |
PowerSourceSourceData |
WeaponSourceData |
ArmorSourceData |
ShieldSourceData |
EquipmentSourceData |
ConnectionSourceData |
CultureSourceData |
BackgroundSourceData |
SettingSourceData |
SpeciesSourceData |
StockSourceData |
GodlikeSourceData |
ReputationSourceData |
InjurySourceData |
BondSourceData

//#endregion

declare global {
  interface Game {
    pillars: {
      apps : {
        PillarsActorSheet : typeof PillarsActorSheet,
        PillarsItemSheet : typeof PillarsItemSheet,
        BookOfSeasons : typeof BookOfSeasons,
        RollDialog : typeof RollDialog,
        ActorConfigure : typeof ActorConfigure,
        DamageDialog : typeof DamageDialog,
        HealingDialog : typeof HealingDialog
      },
      rollClass : {
        SkillCheck : typeof SkillCheck,
        WeaponCheck : typeof WeaponCheck,
        PowerCheck : typeof PowerCheck,
      },
      seasonalActivities : typeof SeasonalActivityApplication[]
      DamageRoll : typeof DamageRoll
      migration : typeof Migration,
      utility: typeof PILLARS_UTILITY,
      config : typeof PILLARS,
      chat : typeof PillarsChat,
      templates : typeof PowerTemplate,
      TimeTracker : TimeTracker,
      postReadyPrepare : Actor[]
    };
    dice3d : {
      DiceFactory : {

      }
      constructor : {

      }
    }
  }
  interface SourceConfig {
    Actor: PillarsActorSourceData;
    Item: PillarsItemDataSource;
  }
  interface DataConfig {
    Actor: PreparedPillarsActorData;
    Item: PillarsItemDataSource; // Prepared Items don't have different structure
  }

  interface CONFIG {
    statusEffects : Partial<ActiveEffectDataConstructorData & { id: string }>[];
  }


  interface ChatMessage {
    getCheck : () => SkillCheck | undefined
    getDamage : () => DamageRoll | undefined
  }

  namespace ClientSettings {
    interface Values {
      'pillars-of-eternity.playerApplyDamage': boolean;
      'pillars-of-eternity.systemMigrationVersion': string;
      'pillars-of-eternity.season': {season: Season, year : number, context? : SeasonContextData};
      'pillars-of-eternity.latestSeason': {season: Season, year : number};
      'pillars-of-eternity.seasonPosition': {left: number, top : number};
    }
  }
}



// Below this line does not work
// --------------------------------------------------------------

declare namespace RollTerm {
  interface Options {
    crit : string
    accumulator : number
  }
}

interface Die {
  explodePillars : () => void
}

declare namespace Die {
  interface Modifiers {
    xp : "pillars-explode"
  }
}


