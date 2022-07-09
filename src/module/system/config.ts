export const PILLARS = {
    defenses: {
      deflection: 'PILLARS.Deflection',
      fortitude: 'PILLARS.Fortitude',
      reflex: 'PILLARS.Reflex',
      will: 'PILLARS.Will',
    },
    
    attributeTypes: {
      benefit: 'PILLARS.Benefit',
      hindrance: 'PILLARS.Hindrance',
    },
    
    skillTypes: {
      academic: 'PILLARS.Academic',
      artistic: 'PILLARS.Artistic',
      language: 'PILLARS.Language',
      martial: 'PILLARS.Martial',
      physical: 'PILLARS.Physical',
      social: 'PILLARS.Social',
      worldly: 'PILLARS.Worldly',
    },
    
    traitTypes: {
      adventure: 'PILLARS.Adventure',
      experience: 'PILLARS.Experience',
    },
    
    tiers: {
      novice: 'PILLARS.Novice',
      apprentice: 'PILLARS.Apprentice',
      master: 'PILLARS.Master',
      expert: 'PILLARS.Expert',
      paragon: 'PILLARS.Paragon',
  },

  followerTypes: {
    generalist: 'PILLARS.Generalist',
    specialist: 'PILLARS.Specialist',
    expert: 'PILLARS.Expert',
  },

  followerSkills : {
    generalist : [{number : 6, rank : 6}],
    specialist : [{number : 2, rank : 8}, {number : 3, rank : 6}],
    expert : [{number : 1, rank : 10}, {number : 3, rank : 6}]
  },
  
  seasons: {
    0: 'PILLARS.Spring',
    1: 'PILLARS.Summer',
    2: 'PILLARS.Autumn',
    3: 'PILLARS.Winter',
  },
  
  tierBonus: {
    novice: {
      def: 0,
      bonus: 0,
    },
    apprentice: {
      def: 3,
      bonus: 0.1,
    },
    master: {
      def: 6,
      bonus: 0.25,
    },
    expert: {
      def: 9,
      bonus: 0.5,
    },
    paragon: {
      def: 12,
      bonus: 1,
    },
  },
  
  lifePhases: {
    childhood: 'PILLARS.Childhood',
    adolescence: 'PILLARS.Adolescence',
    youngAdult: 'PILLARS.YoungAdult',
    adult: 'PILLARS.Adult',
    middleAge: 'PILLARS.MiddleAge',
    old: 'PILLARS.Old',
    venerable: 'PILLARS.Venerable',
  },
  
  lifePhaseModifier: {
    childhood: 0,
    adolescence: 0,
    youngAdult: 0,
    adult: 0,
    middleAge: 2,
    old: 5,
    venerable: 8,
  },
  
  agePointsDeathRank: {
    6: 1,
    10: 2,
    15: 3,
    21: 4,
    28: 5,
    36: 6,
    45: 7,
    999: 8,
  },
  
  lifeStyles: {
    impoverished: 'PILLARS.Impoverished',
    poor: 'PILLARS.Poor',
    comfortable: 'PILLARS.Comfortable',
    prosperous: 'PILLARS.Prosperous',
    rich: 'PILLARS.Rich',
    extravagant: 'PILLARS.Extravagant',
  },
  
  lifestyleModifier: {
    impoverished: 3,
    poor: 1,
    comfortable: 0,
    prosperous: -1,
    rich: -2,
    extravagant: -3,
  },
  
  powerRanges: {
    none: 'PILLARS.None',
    adjacent: 'PILLARS.Adjacent',
    meleeWeapon: 'PILLARS.MeleeWeapon',
    close: 'PILLARS.Close',
    equippedWeapon: 'PILLARS.EquippedWeapon',
    mid: 'PILLARS.Mid',
    far: 'PILLARS.Far',
    extreme: 'PILLARS.Extreme',
  },
  
  powerTargetTypes: {
    target: 'PILLARS.Target',
    circle: 'PILLARS.Circle',
    aura: 'PILLARS.Aura',
    cone: 'PILLARS.Cone',
    ray: 'PILLARS.Ray',
    line: 'PILLARS.Line',
    boundary: 'PILLARS.Boundary',
  },
  
  powerTargets: {
    self: 'PILLARS.Self',
    individualEU: 'PILLARS.IndividualEU',
    individual: 'PILLARS.Individual',
    space: 'PILLARS.Space',
  },
  
  powerCircles: {
    small: 'PILLARS.SmallCircle',
    medium: 'PILLARS.MediumCircle',
    large: 'PILLARS.LargeCircle',
  },
  
  powerAuras: {
    small: 'PILLARS.SmallAura',
    large: 'PILLARS.LargeAura',
  },
  
  powerCones: {
    small: 'PILLARS.SmallCone',
    medium: 'PILLARS.MediumCone',
    large: 'PILLARS.LargeCone',
  },
  
  powerRays: {
    narrow: 'PILLARS.NarrowRay',
    wide: 'PILLARS.WideRay',
  },
  
  powerLines: {
    short: 'PILLARS.ShortLine',
    long: 'PILLARS.LongLine',
  },
  
  powerBoundarys: {
    adjacent: 'PILLARS.AdjacentBoundary',
    small: 'PILLARS.SmallBoundary',
    large: 'PILLARS.LargeBoundary',
    huge: 'PILLARS.HugeBoundary',
  },
  
  powerDurations: {
    momentary: 'PILLARS.Momentary',
    momentary2R: 'PILLARS.Momentary2R',
    round: 'PILLARS.Round',
    encounter: 'PILLARS.Encounter',
    encounterPerRound: 'PILLARS.EncounterPerRound',
    concentration: 'PILLARS.Concentration',
    boundary: 'PILLARS.Boundary',
    day: 'PILLARS.Day',
    week: 'PILLARS.Week',
    month: 'PILLARS.Month',
    season: 'PILLARS.Season',
    year: 'PILLARS.Year',
  },
  
  powerSpeeds: {
    slow: 'PILLARS.Slow',
    move: 'PILLARS.Move',
    action: 'PILLARS.Action',
    immediate: 'PILLARS.Immediate',
    reaction: 'PILLARS.Reaction',
    triggered1rest: 'PILLARS.Triggered1Rest',
    triggered1encounter: 'PILLARS.Triggered1Encounter',
  },
  
  powerExclusions: {
    none: 'PILLARS.None',
    target: 'PILLARS.Target',
    single: 'PILLARS.Single',
    selective: 'PILLARS.Selective',
  },
  
  powerJumps: {
    jump3: 'PILLARS.3Hexes',
    jump6: 'PILLARS.6Hexes',
    jump9: 'PILLARS.9Hexes',
  },
  
  powerLevelValues: {
    powerRanges: {
      none: 0,
      adjacent: 1,
      meleeWeapon: 1.5,
      close: 2,
      equippedWeapon: 2.5,
      mid: 3,
      far: 4,
      extreme: 5,
    },
    powerTargets: {
      self: 0,
      individualEU: 0.5,
      individual: 1,
      space: 1.5,
    },
    powerCircles: {
      small: 2,
      medium: 3,
      large: 4,
    },
    powerAuras: {
      small: 1.5,
      large: 3.5,
    },
    powerCones: {
      small: 2,
      medium: 3,
      large: 4,
    },
    powerRays: {
      narrow: 1,
      wide: 3,
    },
    
    powerLines: {
      short: 2,
      long: 4,
    },
    powerBoundarys: {
      adjacent: 2,
      small: 5,
      large: 10,
      huge: 15,
    },
    powerDurations: {
      momentary: 0,
      momentary2R: 3,
      round: 1,
      encounter: 2,
      encounterPerRound: 3,
      concentration: 1.5,
      boundary: 3,
      day: 5,
      week: 6,
      month: 7,
      season: 8,
      year: 9,
    },
    powerSpeeds: {
      slow: 0,
      move: 1,
      action: 1.5,
      immediate: 5,
      reaction: 5,
      triggered1rest: 7,
      triggered1encounter: 9,
    },
    powerExclusions: {
      none: 0,
      target: 0.5,
      single: 1,
      selective: 2,
    },
    powerJumps: {
      jump3: 0.5,
      jump6: 1,
      jump9: 2,
    },
    bounce: 1,
    attacksDecreaseDefense: -1.5,
  },
  
  powerSources: {
    arcana: 'PILLARS.Arcana',
    discipline: 'PILLARS.Discipline',
    faith: 'PILLARS.Faith',
    focus: 'PILLARS.Focus',
    cunning: 'PILLARS.Cunning',
    mortification: 'PILLARS.Mortification',
    nature: 'PILLARS.Nature',
    rage: 'PILLARS.Rage',
    spirits: 'PILLARS.Spirits',
    zeal: 'PILLARS.Zeal',
  },

  areaTargetTypes: {
    circle: 'circle',
    aura: 'circle',
    cone: 'cone',
    ray: 'ray',
    line: 'ray',
  },

  areaTargetDistances: {
    circle: {
      small: { distance: 1.2 },
      medium: { distance: 2.8 },
      large: { distance: 5.25 },
    },

    aura: {
      small: { distance: 1.2 },
      large: { distance: 2.8 },
    },

    cone: {
      small: { distance: 2 },
      medium: { distance: 4 },
      large: { distance: 6 },
    },

    ray: {
      narrow: { distance: 20, width: 1 },
      wide: { distance: 20, width: 1.5 },
    },

    line: {
      short: { distance: 2 },
      long: { distance: 6 },
    },
  },

  powerSourceTypes: {
    external: 'PILLARS.External',
    personal: 'PILLARS.Personal',
    trained: 'PILLARS.Trained',
  },

  powerEffectType: {
    damage: 'PILLARS.Damage',
    condition: 'PILLARS.Condition',
    other: 'PILLARS.Other',
  },

  powerEffectResistTypes: {
    always: 'PILLARS.Always',
    reflex: 'PILLARS.Reflex',
    fortitude: 'PILLARS.Fortitude',
    will: 'PILLARS.Will',
  },

  damageTypes: {
    physical: 'PILLARS.Physical',
    burn: 'PILLARS.Burn',
    freeze: 'PILLARS.Freeze',
    raw: 'PILLARS.Raw',
    corrode: 'PILLARS.Corrode',
    shock: 'PILLARS.Shock',
  },

  weaponTypes: {
    smallMelee: 'PILLARS.SmallMelee',
    mediumMelee: 'PILLARS.MediumMelee',
    largeMelee: 'PILLARS.LargeMelee',
    mediumRanged: 'PILLARS.MediumRanged',
    largeRanged: 'PILLARS.LargeRanged',
    grenade: 'PILLARS.Grenade',
  },

  armorTypes: {
    physical: 'PILLARS.Physical',
    light: 'PILLARS.LightArmor',
    medium: 'PILLARS.MediumArmor',
    heavy: 'PILLARS.HeavyArmor',
  },

  equipmentTypes: {
    gear: 'PILLARS.Gear',
    tool: 'PILLARS.Tool',
    grimoire: 'PILLARS.Grimoire',
    maedr: 'PILLARS.Maedr',
    book: 'PILLARS.Book'
  },

  bookTypes: {
    powerSource: 'PILLARS.PowerSource',
    academic: 'PILLARS.Academic',
    artistic: 'PILLARS.Artistic',
    martial: 'PILLARS.Martial',
    physical: 'PILLARS.Physical',
    social: 'PILLARS.Social',
    worldly: 'PILLARS.Worldly',
  },

  suitabilities: {
    none: 'PILLARS.NoSuitability',
    good: 'PILLARS.GoodSuitability',
    fair: 'PILLARS.FairSuitability',
    poor: 'PILLARS.PoorSuitability',
  },

  actorSizes: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5],

  allowEmbeddedPowers: ['attribute', 'weapon', 'armor', 'shield', 'equipment', 'species', 'stock', 'godlike'],

  embeddedPowerSpendTypes: {
    encounter: 'PILLARS.PerEncounter',
    longRest: 'PILLARS.PerLongRest',
    charges: 'PILLARS.Charges',
  },

  rechargeTypes: {
    encounter: 'PILLARS.PerEncounter',
    longRest: 'PILLARS.PerLongRest',
  },
  sizeAttributes: {
    '-5': {
      novice: { damageIncrement: 1, toughness: 0 },
      apprentice: { damageIncrement: 2, toughness: 0 },
      master: { damageIncrement: 3, toughness: 0 },
      expert: { damageIncrement: 4, toughness: 1 },
      paragon: { damageIncrement: 5, toughness: 2 },
    },
    '-4': {
      novice: { damageIncrement: 2, toughness: 0 },
      apprentice: { damageIncrement: 3, toughness: 0 },
      master: { damageIncrement: 4, toughness: 1 },
      expert: { damageIncrement: 5, toughness: 2 },
      paragon: { damageIncrement: 6, toughness: 3 },
    },
    '-3': {
      novice: { damageIncrement: 3, toughness: 0 },
      apprentice: { damageIncrement: 4, toughness: 1 },
      master: { damageIncrement: 5, toughness: 2 },
      expert: { damageIncrement: 6, toughness: 3 },
      paragon: { damageIncrement: 7, toughness: 4 },
    },
    '-2': {
      novice: { damageIncrement: 4, toughness: 1 },
      apprentice: { damageIncrement: 5, toughness: 2 },
      master: { damageIncrement: 6, toughness: 3 },
      expert: { damageIncrement: 7, toughness: 4 },
      paragon: { damageIncrement: 8, toughness: 5 },
    },
    '-1': {
      novice: { damageIncrement: 5, toughness: 2 },
      apprentice: { damageIncrement: 6, toughness: 3 },
      master: { damageIncrement: 7, toughness: 4 },
      expert: { damageIncrement: 8, toughness: 5 },
      paragon: { damageIncrement: 9, toughness: 6 },
    },
    '0': {
      novice: { damageIncrement: 6, toughness: 3 },
      apprentice: { damageIncrement: 7, toughness: 4 },
      master: { damageIncrement: 8, toughness: 5 },
      expert: { damageIncrement: 9, toughness: 6 },
      paragon: { damageIncrement: 10, toughness: 7 },
    },
    '1': {
      novice: { damageIncrement: 7, toughness: 4 },
      apprentice: { damageIncrement: 8, toughness: 5 },
      master: { damageIncrement: 9, toughness: 6 },
      expert: { damageIncrement: 10, toughness: 7 },
      paragon: { damageIncrement: 11, toughness: 8 },
    },
    '2': {
      novice: { damageIncrement: 9, toughness: 6 },
      apprentice: { damageIncrement: 12, toughness: 8 },
      master: { damageIncrement: 15, toughness: 10 },
      expert: { damageIncrement: 20, toughness: 12 },
      paragon: { damageIncrement: 25, toughness: 14 },
    },
    '3': {
      novice: { damageIncrement: 12, toughness: 9 },
      apprentice: { damageIncrement: 15, toughness: 12 },
      master: { damageIncrement: 20, toughness: 15 },
      expert: { damageIncrement: 25, toughness: 18 },
      paragon: { damageIncrement: 30, toughness: 21 },
    },
    '4': {
      novice: { damageIncrement: 15, toughness: 12 },
      apprentice: { damageIncrement: 25, toughness: 16 },
      master: { damageIncrement: 35, toughness: 20 },
      expert: { damageIncrement: 45, toughness: 24 },
      paragon: { damageIncrement: 50, toughness: 28 },
    },
    '5': {
      novice: { damageIncrement: 20, toughness: 15 },
      apprentice: { damageIncrement: 40, toughness: 20 },
      master: { damageIncrement: 60, toughness: 25 },
      expert: { damageIncrement: 80, toughness: 30 },
      paragon: { damageIncrement: 100, toughness: 35 },
    },
  },

  meleeSpecials: {
    battering: {
      label: 'PILLARS.SpecialName.Battering',
      description: 'PILLARS.SpecialDescription.Battering',
      hasValue: false,
      skilled: true,
    },
    bleedingCut: {
      label: 'PILLARS.SpecialName.BleedingCut',
      description: 'PILLARS.SpecialDescription.BleedingCut',
      hasValue: false,
      skilled: true,
    },
    guard: {
      label: 'PILLARS.SpecialName.Guard',
      description: 'PILLARS.SpecialDescription.Guard',
      hasValue: false,
      skilled: true,
    },
    halfSword: {
      label: 'PILLARS.SpecialName.HalfSword',
      description: 'PILLARS.SpecialDescription.HalfSword',
      hasValue: false,
      skilled: true,
    },
    heavyHit: {
      label: 'PILLARS.SpecialName.HeavyHit',
      description: 'PILLARS.SpecialDescription.HeavyHit',
      hasValue: false,
      skilled: true,
    },
    lashingChain: {
      label: 'PILLARS.SpecialName.LashingChain',
      description: 'PILLARS.SpecialDescription.LashingChain',
      hasValue: false,
      skilled: true,
    },
    mercyStroke: {
      label: 'PILLARS.SpecialName.MercyStroke',
      description: 'PILLARS.SpecialDescription.MercyStroke',
      hasValue: false,
      skilled: true,
    },
    piercingBlow: {
      label: 'PILLARS.SpecialName.PiercingBlow',
      description: 'PILLARS.SpecialDescription.PiercingBlow',
      hasValue: false,
      skilled: true,
    },
    rapidStrike: {
      label: 'PILLARS.SpecialName.RapidStrike',
      description: 'PILLARS.SpecialDescription.RapidStrike',
      hasValue: false,
      skilled: true,
    },
    reach: {
      label: 'PILLARS.SpecialName.Reach',
      description: 'PILLARS.SpecialDescription.Reach',
      hasValue: true,
      skilled: false,
    },
    splitShield: {
      label: 'PILLARS.SpecialName.SplitShield',
      description: 'PILLARS.SpecialDescription.SplitShield',
      hasValue: false,
      skilled: true,
    },
    throw: {
      label: 'PILLARS.SpecialName.Throw',
      description: 'PILLARS.SpecialDescription.Throw',
      hasValue: false,
      skilled: true,
    },
    windmillSlash: {
      label: 'PILLARS.SpecialName.WindmillSlash',
      description: 'PILLARS.SpecialDescription.WindmillSlash',
      hasValue: false,
      skilled: true,
    },
  },

  rangedSpecials: {
    destructiveChanneling: {
      label: 'PILLARS.SpecialName.DestructiveChanneling',
      description: 'PILLARS.SpecialDescription.DestructiveChanneling',
      hasValue: false,
      skilled: true,
    },
    distantShot: {
      label: 'PILLARS.SpecialName.DistantShot',
      description: 'PILLARS.SpecialDescription.DistantShot',
      hasValue: false,
      skilled: true,
    },
    ignoreForceBarrier: {
      label: 'PILLARS.SpecialName.IgnoreForceBarrier',
      description: 'PILLARS.SpecialDescription.IgnoreForceBarrier',
      hasValue: false,
      skilled: false,
    },
    reload: {
      label: 'PILLARS.SpecialName.Reload',
      description: 'PILLARS.SpecialDescription.Reload',
      hasValue: false,
      skilled: false,
    },
    stationaryReload: {
      label: 'PILLARS.SpecialName.StationaryReload',
      description: 'PILLARS.SpecialDescription.StationaryReload',
      hasValue: false,
      skilled: false,
    },
    snapshot: {
      label: 'PILLARS.SpecialName.Snapshot',
      description: "PILLARS.SpecialDescription.Snapshot",
      hasValue: false,
      skilled: true,
    },
    stabilize: {
      label: 'PILLARS.SpecialName.Stabilize',
      description: 'PILLARS.SpecialDescription.Stabilize',
      hasValue: false,
      skilled: true,
    },
    blast: {
      label: 'PILLARS.SpecialName.Blast',
      description: 'PILLARS.SpecialDescription.Blast',
      hasValue: false,
      skilled: true,
    },
    overdraw: {
      label: 'PILLARS.SpecialName.Overdraw',
      description: 'PILLARS.SpecialDescription.Overdraw',
      hasValue: false,
      skilled: true,
    },
    rapidShot: {
      label: 'PILLARS.SpecialName.RapidShot',
      description: 'PILLARS.SpecialDescription.RapidShot',
      hasValue: false,
      skilled: true,
    },
    concealment: {
      label: 'PILLARS.SpecialName.Concealment',
      description: 'PILLARS.SpecialDescription.Concealment',
      hasValue: false,
      skilled: false,
    },
    roundBurn: {
      label: 'PILLARS.SpecialName.RoundBurn',
      description: 'PILLARS.SpecialDescription.RoundBurn',
      hasValue: true,
      skilled: false,
    },
  },

  bondTraits : {
    emotionSense : {
      key : "emotionSense",
      name : "PILLARS.BOND.EmotionSense",
      description : "PILLARS.BOND_DESCRIPTION.EmotionSense",
      effect : undefined,
      
    },
    silentAssistance : {
      key : "silentAssistance",
      name : "PILLARS.BOND.SilentAssistance",
      description : "PILLARS.BOND_DESCRIPTION.SilentAssistance",
      effect : undefined
    },
    bondedGrief : {
      key : "bondedGrief",
      name : "PILLARS.BOND.BondedGrief",
      description : "PILLARS.BOND_DESCRIPTION.BondedGrief",
      effect : {
        label: 'PILLARS.BOND.BondedGrief',
        icon: 'systems/pillars-of-eternity/assets/conditions/bloodied.png',
        disabled : true,
        changes: [
          { key: 'state', mode: 6, value: 'dis' },
          { key: 'data.defenses.deflection.value', mode: 2, value: '-2' },
          { key: 'data.defenses.fortitude.value', mode: 2, value: '-2' },
          { key: 'data.defenses.reflex.value', mode: 2, value: '-2' },
          { key: 'data.defenses.will.value', mode: 2, value: '-2' },
        ],
        flags: {
          'pillars-of-eternity': {
            bondTrait : "bondedGrief",
            changeCondition: {
              0: { description: 'PILLARS.AfflictionDescription.AllCheckPenalty', script: 'return true' },
            },
          },
        },
      }
    },
    bondedCharisma : {
      key : "bondedCharisma",
      name : "PILLARS.BOND.BondedCharisma",
      description : "PILLARS.BOND_DESCRIPTION.BondedCharisma",
      effect : undefined
    },
    bondedInitiative : {
      key : "bondedInitiative",
      name : "PILLARS.BOND.BondedInitiative",
      description : "PILLARS.BOND_DESCRIPTION.BondedInitiative",
      effect : undefined
    },
    bondedReassurance : {
      key : "bondedReassurance",
      name : "PILLARS.BOND.BondedReassurance",
      description : "PILLARS.BOND_DESCRIPTION.BondedReassurance",
      effect : undefined
    },
    bondedRecovery : {
      key : "bondedRecovery",
      name : "PILLARS.BOND.BondedRecovery",
      description : "PILLARS.BOND_DESCRIPTION.BondedRecovery",
      effect : undefined
    },
    bondedSprint : {
      key : "bondedSprint",
      name : "PILLARS.BOND.BondedSprint",
      description : "PILLARS.BOND_DESCRIPTION.BondedSprint",
      effect : undefined
    },
    bondedStudy : {
      key : "bondedStudy",
      name : "PILLARS.BOND.BondedStudy",
      description : "PILLARS.BOND_DESCRIPTION.BondedStudy",
      effect : undefined
    },
    bondedSurvival : {
      key : "bondedSurvival",
      name : "PILLARS.BOND.BondedSurvival",
      description : "PILLARS.BOND_DESCRIPTION.BondedSurvival",
      effect : undefined
    },
    bondedTransfer : {
      key : "bondedTransfer",
      name : "PILLARS.BOND.BondedTransfer",
      description : "PILLARS.BOND_DESCRIPTION.BondedTransfer",
      effect : undefined
    },
    bondedVengeance : {
      key : "bondedVengeance",
      name : "PILLARS.BOND.BondedVengeance",
      description : "PILLARS.BOND_DESCRIPTION.BondedVengeance",
      effect : undefined
    },
    bondedVigor : {
      key : "bondedVigor",
      name : "PILLARS.BOND.BondedVigor",
      description : "PILLARS.BOND_DESCRIPTION.BondedVigor",
      effect : undefined
    }
  }

};

CONFIG.statusEffects = [
    {
      id: 'bloodied',
      label: 'PILLARS.AfflictionBloodied',
      icon: 'systems/pillars-of-eternity/assets/conditions/bloodied.png',
      changes: [
        { key: 'steps', mode: 6, value: '-2' },
        { key: 'data.defenses.deflection.value', mode: 2, value: '-3' },
        { key: 'data.defenses.fortitude.value', mode: 2, value: '-3' },
        { key: 'data.defenses.reflex.value', mode: 2, value: '-3' },
        { key: 'data.defenses.will.value', mode: 2, value: '-3' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AllCheckPenalty', script: 'return true' },
          },
        },
      },
    },
    {
      id: 'winded',
      label: 'PILLARS.AfflictionWinded',
      icon: 'systems/pillars-of-eternity/assets/conditions/winded.png',
      changes: [
        { key: 'steps', mode: 6, value: '-1' },
        { key: 'data.defenses.deflection.value', mode: 2, value: '-2' },
        { key: 'data.defenses.fortitude.value', mode: 2, value: '-2' },
        { key: 'data.defenses.reflex.value', mode: 2, value: '-2' },
        { key: 'data.defenses.will.value', mode: 2, value: '-2' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AllCheckPenalty', script: 'return true' },
          },
        },
      },
    },
    {
      id: 'weakened',
      label: 'PILLARS.AfflictionWeakened',
      icon: 'systems/pillars-of-eternity/assets/conditions/weakened.png',
      changes: [
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.DisadvantageInvolvingPhysicalActivity',
              script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksAdvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'sickened',
      label: 'PILLARS.AfflictionSickened',
      icon: 'systems/pillars-of-eternity/assets/conditions/sickened.png',
      changes: [
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.DisadvantageInvolvingPhysicalActivity',
              script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksAdvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'enfeebled',
      label: 'PILLARS.AfflictionEnfeebled',
      icon: 'systems/pillars-of-eternity/assets/conditions/enfeebled.png',
      changes: [
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.DisadvantageInvolvingPhysicalActivity',
              script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksAdvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'fit',
      label: 'PILLARS.AfflictionFit',
      icon: 'systems/pillars-of-eternity/assets/conditions/fit.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageInvolvingPhysicalActivity', script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksDisadvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'hardy',
      label: 'PILLARS.AfflictionHardy',
      icon: 'systems/pillars-of-eternity/assets/conditions/hardy.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageInvolvingPhysicalActivity', script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksDisadvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'robust',
      label: 'PILLARS.AfflictionRobust',
      icon: 'systems/pillars-of-eternity/assets/conditions/robust.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageInvolvingPhysicalActivity', script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
            1: { description: 'PILLARS.AfflictionDescription.FortitudeAttacksDisadvantage', script: '' },
          },
        },
      },
    },
    {
      id: 'prone',
      label: 'PILLARS.AfflictionProne',
      icon: 'systems/pillars-of-eternity/assets/conditions/prone.png',
      changes: [
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.AfflictionDescription.WeaponAttacksDisadvantageExcept',
              script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.AttacksAgainstDeflectionReflexWithin', script: '' },
          },
        },
      },
    },
    {
      id: 'knocked-down',
      label: 'PILLARS.AfflictionKnockedDown',
      icon: 'systems/pillars-of-eternity/assets/conditions/knocked-down.png',
      changes: [{ key: 'state', mode: 6, value: 'dis' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.AfflictionDescription.WeaponAttacksDisadvantageExcept',
              script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.AttacksAgainstDeflectionReflexWithin', script: '' },
          },
        },
      },
    },
    {
      id: 'down-n-out',
      label: 'PILLARS.AfflictionDownAndOut',
      icon: 'systems/pillars-of-eternity/assets/conditions/down-n-out.png',
      changes: [{ key: 'state', mode: 6, value: 'dis' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: {
              description: 'PILLARS.AfflictionDescription.WeaponAttacksDisadvantageExcept',
              script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true",
            },
            1: { description: 'PILLARS.AfflictionDescription.AttacksAgainstDeflectionReflexWithin', script: '' },
          },
        },
      },
    },
    {
      id: 'hampered',
      label: 'PILLARS.AfflictionHampered',
      icon: 'systems/pillars-of-eternity/assets/conditions/hampered.png',
      changes: [{ key: 'state', mode: 7, value: 'adv' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexAttacksAdvantage', script: 'return data.item.isVsReflex' },
          },
        },
      },
    },
    {
      id: 'immobilized',
      label: 'PILLARS.AfflictionImmobilized',
      icon: 'systems/pillars-of-eternity/assets/conditions/immobilized.png',
      changes: [{ key: 'state', mode: 7, value: 'adv' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexAttacksAdvantage', script: 'return data.item.isVsReflex' },
          },
        },
      },
    },
    {
      id: 'paralyzed',
      label: 'PILLARS.AfflictionParalyzed',
      icon: 'systems/pillars-of-eternity/assets/conditions/paralyzed.png',
      changes: [{ key: 'state', mode: 7, value: 'adv' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexDeflectionAttacksAdvantage', script: 'return (data.item.isVsReflex || data.item.isVsDeflection)' },
          },
        },
      },
    },
    {
      id: 'nimble',
      label: 'PILLARS.AfflictionNimble',
      icon: 'systems/pillars-of-eternity/assets/conditions/nimble.png',
      changes: [{ key: 'state', mode: 7, value: 'dis' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexDisengagementAttacksAdvantage', script: 'return data.item.isVsReflex' },
          },
        },
      },
    },
    {
      id: 'quickened',
      label: 'PILLARS.AfflictionQuickened',
      icon: 'systems/pillars-of-eternity/assets/conditions/quickened.png',
      changes: [{ key: 'state', mode: 7, value: 'dis' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexDisengagementAttacksAdvantage', script: 'return data.item.isVsReflex' },
          },
        },
      },
    },
    {
      id: 'swift',
      label: 'PILLARS.AfflictionSwift',
      icon: 'systems/pillars-of-eternity/assets/conditions/swift.png',
      changes: [{ key: 'state', mode: 7, value: 'dis' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.ReflexDisengagementAttacksAdvantage', script: 'return data.item.isVsReflex' },
          },
        },
      },
    },
    {
      id: 'distracted',
      label: 'PILLARS.AfflictionDistracted',
      icon: 'systems/pillars-of-eternity/assets/conditions/distracted.png',
      changes: [{ key: 'state', mode: 7, value: 'adv' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksAdvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'deafened',
      label: 'PILLARS.AfflictionDeafened',
      icon: 'icons/svg/deaf.svg',
      changes: [{ key: 'state', mode: 7, value: 'adv' }],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksAdvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'dazzled',
      label: 'PILLARS.AfflictionDazzled',
      icon: 'systems/pillars-of-eternity/assets/conditions/dazzled.png',
      changes: [
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.DisadvantageWeaponSkillSight', script: "return data.item.type :: 'weapon'" },
            1: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksAdvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'blinded',
      label: 'PILLARS.AfflictionBlinded',
      icon: 'systems/pillars-of-eternity/assets/conditions/blinded.png',
      changes: [
        { key: 'steps', mode: 6, value: '-3' },
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.DisadvantageWeaponSkillSight', script: "return data.item.type :: 'weapon'" },
            1: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksAdvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'aware',
      label: 'PILLARS.AfflictionAware',
      icon: 'systems/pillars-of-eternity/assets/conditions/aware.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageDisengagementAttacks', script: '' },
            1: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksDisadvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'insightful',
      label: 'PILLARS.AfflictionInsightful',
      icon: 'systems/pillars-of-eternity/assets/conditions/insightful.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageWeaponSkillSight', script: "return data.item.type :: 'weapon'" },
            1: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksDisadvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'all-seeing',
      label: 'PILLARS.AfflictionAllSeeing',
      icon: 'systems/pillars-of-eternity/assets/conditions/all-seeing.png',
      changes: [
        { key: 'state', mode: 6, value: 'adv' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.AdvantageWeaponSkillSight', script: "return data.item.type :: 'weapon'" },
            1: { description: 'PILLARS.AfflictionDescription.DeflectionAttacksDisadvantage', script: 'return data.item.isVsDeflection' },
          },
        },
      },
    },
    {
      id: 'demoralized',
      label: 'PILLARS.AfflictionDemoralized',
      icon: 'systems/pillars-of-eternity/assets/conditions/demoralized.png',
      changes: [
        { key: 'data.initiative.value', mode: 2, value: '-5' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            1: { description: 'PILLARS.AfflictionDescription.WillAttacksAdvantage', script: 'return data.item.isVsWill' },
          },
        },
      },
    },
    {
      id: 'frightened',
      label: 'PILLARS.AfflictionFrightened',
      icon: 'systems/pillars-of-eternity/assets/conditions/frightened.png',
      changes: [
        { key: 'data.initiative.value', mode: 2, value: '-5' },
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            1: { description: 'PILLARS.AfflictionDescription.AttacksWithinSightOfFear', script: '' },
            2: { description: 'PILLARS.AfflictionDescription.WillAttacksAdvantage', script: 'return data.item.isVsWill' },
          },
        },
      },
    },
    {
      id: 'terrified',
      label: 'PILLARS.AfflictionTerrified',
      icon: 'systems/pillars-of-eternity/assets/conditions/terrified.png',
      changes: [
        { key: 'data.initiative.value', mode: 2, value: '-5' },
        { key: 'state', mode: 6, value: 'dis' },
        { key: 'state', mode: 7, value: 'adv' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            1: { description: 'PILLARS.AfflictionDescription.AttacksWithinSightOfFear', script: '' },
            2: { description: 'PILLARS.AfflictionDescription.WillAttacksAdvantage', script: 'return data.item.isVsWill' },
          },
        },
      },
    },
    {
      id: 'charmed',
      label: 'PILLARS.AfflictionCharmed',
      icon: 'systems/pillars-of-eternity/assets/conditions/charmed.png',
    },
    {
      id: 'dominated',
      label: 'PILLARS.AfflictionDominated',
      icon: 'systems/pillars-of-eternity/assets/conditions/dominated.png',
    },
    {
      id: 'determined',
      label: 'PILLARS.AfflictionDetermined',
      icon: 'systems/pillars-of-eternity/assets/conditions/determined.png',
      changes: [
        { key: 'steps', mode: 6, value: '1' },
        { key: 'state', mode: 7, value: 'dis' },
      ],
      flags: {
        'pillars-of-eternity': {
          changeCondition: {
            0: { description: 'PILLARS.AfflictionDescription.BonusStepOncePerRound', script: '' },
            1: { description: 'PILLARS.AfflictionDescription.WillAttacksDisadvantage', script: 'return data.item.isVsWill' },
          },
        },
      },
    },
    {
      id: 'resolute',
      label: 'PILLARS.AfflictionResolute',
      icon: 'systems/pillars-of-eternity/assets/conditions/resolute.png',
    },
    {
      id: 'inspiring',
      label: 'PILLARS.AfflictionInspiring',
      icon: 'systems/pillars-of-eternity/assets/conditions/inspiring.png',
    },
    {
      id: 'incapacitated',
      label: 'PILLARS.AfflictionIncapacitated',
      icon: 'icons/svg/skull.svg',
    },
    {
      id: 'dead',
      label: 'PILLARS.AfflictionDead',
      icon: 'systems/pillars-of-eternity/assets/conditions/dead.svg',
    },
  ];
