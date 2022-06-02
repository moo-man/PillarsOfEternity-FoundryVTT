import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { Defense, LifePhase, Season } from './types/common';
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
import { WeaponSpecial } from './types/items';
import { PILLARS } from "./module/system/config.js";


//#region Actor

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
    phase: keyof LifePhase;
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
  seasons : Season[]
}

interface CharacterDataSource {
  type: 'character';
  data: PillarsCharacterSourceSystemData;
}

interface NPCDataSource {
  type: 'npc';
  data: PillarsActorSourceSystemData;
}

export type PillarsActorSourceData = CharacterDataSource | NPCDataSource;

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
  seasons : Season[]
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

type PreparedPillarsNPC = {
  type: 'npc';
  data: BasePreparedPillarsActorData;
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

export type PreparedPillarsActorData =
  | PreparedPillarsCharacter
  | PreparedPillarsNPC;

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
  groups : PowerGroups
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
  wearable: {
    value: boolean;
  };
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
InjurySourceData

//#endregion

declare global {
  interface Game {
    pillars: {
      apps: {};
      rollClass: {};
      config : typeof PILLARS
    };
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

  interface EffectChangeData {
    mode? : number
  }

}


