export const PILLARS = {
defenses : {
    deflection: "Deflection",
    fortitude: "Fortitude",
    reflex: "Reflex",
    will: "Will"
},

attributeTypes : {
    "benefit": "Benefit",
    "hindrance": "Hindrance"
},


skillTypes : {
    "academic": "Academic",
    "artistic": "Artistic",
    "language": "Language",
    "martial": "Martial",
    "physical": "Physical",
    "social": "Social",
    "worldly": "Worldly"
},

traitTypes : {
    "adventure": "Adventure",
    "experience": "Experience"
},

tiers : {
    "novice": "Novice",
    "apprentice": "Apprentice",
    "master": "Master",
    "expert": "Expert",
    "paragon": "Paragon"
},

tierBonus : {
    "novice": {
        def: 0,
        bonus: 0,
    },
    "apprentice": {
        def: 3,
        bonus: 0.1,
    },
    "master": {
        def: 6,
        bonus: 0.25,
    },
    "expert": {
        def: 9,
        bonus: 0.5,
    },
    "paragon": {
        def: 12,
        bonus: 1,
    }
},


lifePhases : {
    childhood: "Childhood",
    adolescence: "Adolescence",
    youngAdult: "Young Adult",
    adult: "Adult",
    middleAge: "Middle Age",
    old: "Old",
    venerable: "Venerable"
},

lifePhaseModifier : {
    childhood: 0,
    adolescence: 0,
    youngAdult: 0,
    adult: 0,
    middleAge: 2,
    old: 5,
    venerable: 8
},

agePointsDeathRank : {
    6: 1,
    10: 2,
    15: 3,
    21: 4,
    28: 5,
    36: 6,
    45: 7,
    999: 8
},

lifeStyles : {
    impoverished: "Impoverished",
    poor: "Poor",
    comfortable: "Comfortable",
    prosperous: "Prosperous",
    rich: "Rich",
    extravagant: "Extravagant",
},

lifestyleModifier : {
    impoverished: 3,
    poor: 1,
    comfortable: 0,
    prosperous: -1,
    rich: -2,
    extravagant: -3,
},

powerRanges : {
    "none": "None",
    "adjacent": "Adjacent",
    "meleeWeapon": "Melee Weapon",
    "close": "Close",
    "equippedWeapon": "Equipped Weapon",
    "mid": "Mid",
    "far": "Far",
    "extreme": "Extreme"
},

powerTargetTypes : {
    "target": "Target",
    "circle": "Circle",
    "aura": "Aura",
    "cone": "Cone",
    "ray": "Ray",
    "line": "Line",
    "boundary": "Boundary"
},

powerTargets : {
    "self": "Self",
    "individualEU": "Individual EU",
    "individual": "Individual",
    "space": "Space"
},


powerCircles : {
    "small": "Small Circle",
    "medium": "Medium Circle",
    "large": "Large Circle"
},


powerAuras : {
    "small": "Small Aura",
    "large": "Large Aura"
},


powerCones : {
    "small": "Small Cone",
    "medium": "Medium Cone",
    "large": "Large Cone"
},


powerRays : {
    "narrow": "Narrow Ray",
    "wide": "Wide Ray"
},

powerLines : {
    "short": "Short Line",
    "long": "Long Line"
},


powerBoundarys : {
    "adjacent": "Adjacent Boundary",
    "small": "Small Boundary",
    "large": "Large Boundary",
    "huge": "Huge Boundary"
},


powerDurations : {
    "momentary": "Momentary",
    "momentary2R": "Momentary 2R",
    "round": "Round",
    "encounter": "Encounter",
    "encounterPerRound": "Encounter Per Round",
    "concentration": "Concentration",
    "boundary": "Boundary",
    "day": "Day",
    "week": "Week",
    "month": "Month",
    "season": "Season",
    "year": "Year"
},


powerSpeeds : {
    "slow": "Slow",
    "move": "Move",
    "action": "Action",
    "immediate": "Immediate",
    "reaction": "Reaction",
    "triggered1rest": "Triggered 1/Rest",
    "triggered1encounter": "Triggered 1/Encounter"
},


powerExclusions : {
    "none": "None",
    "target": "Target",
    "single": "Single",
    "selective": "Selective"
},

powerJumps : {
    "jump3": "3 Hexes",
    "jump6": "6 Hexes",
    "jump9": "9 Hexes"
},


powerLevelValues : {
    powerRanges: {
        "none": 0,
        "adjacent": 1,
        "meleeWeapon": 1.5,
        "close": 2,
        "equippedWeapon": 2.5,
        "mid": 3,
        "far": 4,
        "extreme": 5
    },
    powerTargets: {
        "self": 0,
        "individualEU": 0.5,
        "individual": 1,
        "space": 1.5
    },
    powerCircles: {
        "small": 2,
        "medium": 3,
        "large": 4
    },
    powerAuras: {
        "small": 1.5,
        "large": 3.5
    },
    powerCones: {
        "small": 2,
        "medium": 3,
        "large": 4
    },
    powerRays: {
        "narrow": 1,
        "wide": 3
    },

    powerLines: {
        "short": 2,
        "long": 4
    },
    powerBoundarys: {
        "adjacent": 2,
        "small": 5,
        "large": 10,
        "huge": 15
    },
    powerDurations: {
        "momentary": 0,
        "momentary2R": 3,
        "round": 1,
        "encounter": 2,
        "encounterPerRound": 3,
        "concentration": 1.5,
        "boundary": 3,
        "day": 5,
        "week": 6,
        "month": 7,
        "season": 8,
        "year": 9
    },
    powerSpeeds: {
        "slow": 0,
        "move": 1,
        "action": 1.5,
        "immediate": 5,
        "reaction": 5,
        "triggered1rest": 7,
        "triggered1encounter": 9
    },
    powerExclusions: {
        "none": 0,
        "target": 0.5,
        "single": 1,
        "selective": 2
    },
    powerJumps: {
        "jump3": 0.5,
        "jump6": 1,
        "jump9": 2
    },
    bounce: 1,
    attacksDecreaseDefense: -1.5
},

powerSources : {
    "arcana": "Arcana",
    "discipline": "Discipline",
    "faith": "Faith",
    "focus": "Focus",
    "cunning": "Cunning",
    "mortification": "Mortification",
    "nature": "Nature",
    "rage": "Rage",
    "spirits": "Spirits",
    "zeal": "Zeal"
},

areaTargetTypes : {
    "circle": "circle",
    "aura": "circle",
    "cone": "cone",
    "ray": "ray",
    "line": "ray"
},

areaTargetDistances : {
    circle: {
        "small": { distance: 1.2 },
        "medium": { distance: 2.8 },
        "large": { distance: 5.25 }
    },

    aura: {
        "small": { distance: 1.2 },
        "large": { distance: 2.8 }
    },

    cone: {
        "small": { distance: 2 },
        "medium": { distance: 4 },
        "large": { distance: 6 }
    },

    ray: {
        "narrow": { distance: 20, width: 1 },
        "wide": { distance: 20, width: 1.5 }
    },

    line: {
        "short": { distance: 2 },
        "long": { distance: 6 }
    }
},


powerSourceTypes : {
    "external": "External",
    "personal": "Personal",
    "trained": "Trained"
},

powerEffectType : {
    "damage": "Damage",
    "condition": "Condition",
    "other": "Other"
},

powerEffectResistTypes : {
    "always": "Always",
    "reflex": "Reflex",
    "fortitude": "Fortitude",
    "will": "Will"
},


damageTypes : {
    "physical": "Physical",
    "burn": "Burn",
    "freeze": "Freeze",
    "raw": "Raw",
    "corrode": "Corrode",
    "shock": "Shock"
},

weaponTypes : {
    "smallMelee": "Small Melee",
    "mediumMelee": "Medium Melee",
    "largeMelee": "Large Melee",
    "mediumRanged": "Medium Ranged",
    "largeRanged": "Large Ranged",
    "grenade": "Grenade"
},

armorTypes : {
    "physical": "Physical",
    "light": "Light Armor",
    "medium": "Medium Armor",
    "heavy": "Heavy Armor"
},


equipmentTypes : {
    "gear": "Gear",
    "tool": "Tool",
    "grimoire" : "Grimoire"
},

suitabilities : {
    "none": "No Penalty",
    "good": "Good (-2)",
    "fair": "Fair (-4)",
    "poor": "Poor (-8)"
},

actorSizes : [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5],

allowEmbeddedPowers : ["attribute", "weapon", "armor", "shield", "equipment", "species", "stock", "godlike"],


embeddedPowerSpendTypes : {
    "encounter" : "Per Encounter",
    "longRest" : "Per Long Rest",
    "charges" : "Charges",
},

rechargeTypes : {
    "encounter" : "Per Encounter",
    "longRest" : "Per Long Rest"
},
sizeAttributes : {
    "-5": {
        novice: { damageIncrement: 1, toughness: 0 },
        apprentice: { damageIncrement: 2, toughness: 0 },
        master: { damageIncrement: 3, toughness: 0 },
        expert: { damageIncrement: 4, toughness: 1 },
        paragon: { damageIncrement: 5, toughness: 2 }
    },
    "-4": {
        novice: { damageIncrement: 2, toughness: 0 },
        apprentice: { damageIncrement: 3, toughness: 0 },
        master: { damageIncrement: 4, toughness: 1 },
        expert: { damageIncrement: 5, toughness: 2 },
        paragon: { damageIncrement: 6, toughness: 3 }
    },
    "-3": {
        novice: { damageIncrement: 3, toughness: 0 },
        apprentice: { damageIncrement: 4, toughness: 1 },
        master: { damageIncrement: 5, toughness: 2 },
        expert: { damageIncrement: 6, toughness: 3 },
        paragon: { damageIncrement: 7, toughness: 4 }
    },
    "-2": {
        novice: { damageIncrement: 4, toughness: 1 },
        apprentice: { damageIncrement: 5, toughness: 2 },
        master: { damageIncrement: 6, toughness: 3 },
        expert: { damageIncrement: 7, toughness: 4 },
        paragon: { damageIncrement: 8, toughness: 5 }
    },
    "-1": {
        novice: { damageIncrement: 5, toughness: 2 },
        apprentice: { damageIncrement: 6, toughness: 3 },
        master: { damageIncrement: 7, toughness: 4 },
        expert: { damageIncrement: 8, toughness: 5 },
        paragon: { damageIncrement: 9, toughness: 6 }
    },
    "0": {
        novice: { damageIncrement: 6, toughness: 3 },
        apprentice: { damageIncrement: 7, toughness: 4 },
        master: { damageIncrement: 8, toughness: 5 },
        expert: { damageIncrement: 9, toughness: 6 },
        paragon: { damageIncrement: 10, toughness: 7 }
    },
    "1": {
        novice: { damageIncrement: 7, toughness: 4 },
        apprentice: { damageIncrement: 8, toughness: 5 },
        master: { damageIncrement: 9, toughness: 6 },
        expert: { damageIncrement: 10, toughness: 7 },
        paragon: { damageIncrement: 11, toughness: 8 }
    },
    "2": {
        novice: { damageIncrement: 9, toughness: 6 },
        apprentice: { damageIncrement: 12, toughness: 8 },
        master: { damageIncrement: 15, toughness: 10 },
        expert: { damageIncrement: 20, toughness: 12 },
        paragon: { damageIncrement: 25, toughness: 14 }
    },
    "3": {
        novice: { damageIncrement: 12, toughness: 9 },
        apprentice: { damageIncrement: 15, toughness: 12 },
        master: { damageIncrement: 20, toughness: 15 },
        expert: { damageIncrement: 25, toughness: 18 },
        paragon: { damageIncrement: 30, toughness: 21 }
    },
    "4": {
        novice: { damageIncrement: 15, toughness: 12 },
        apprentice: { damageIncrement: 25, toughness: 16 },
        master: { damageIncrement: 35, toughness: 20 },
        expert: { damageIncrement: 45, toughness: 24 },
        paragon: { damageIncrement: 50, toughness: 28 }
    },
    "5": {
        novice: { damageIncrement: 20, toughness: 15 },
        apprentice: { damageIncrement: 40, toughness: 20 },
        master: { damageIncrement: 60, toughness: 25 },
        expert: { damageIncrement: 80, toughness: 30 },
        paragon: { damageIncrement: 100, toughness: 35 }
    }
},


meleeSpecials : {

    battering: {
        label: "Battering",
        description: "Base damage is halved. Endurance loss from Soak is tripled.",
        hasValue: false,
        skilled: true
    },
    bleedingCut: {
        label: "Bleeding Cut",
        description: "Halve the initial damage total.  If the attack penetrates the victim’s Soak, on the following round, the target takes the full listed damage as Raw (i.e. ignoring armor).  This attack can only be used on Kith, Wilder, and Beasts.  It has no effect on Primordials, Spirits, or Vessels.",
        hasValue: false,
        skilled: true
    },
    guard: {
        label: "Guard",
        description: "As an Action, a character can protect any hexes within the Reach of a weapon.  Until the character performs another action (in any phase) other than a Withdraw, hexes around them are considered guarded if someone moves into them.  As long as the guarding character is aware of the intrusion (i.e., the intruder is not hidden and the defender is not stunned, blinded, etc.), they get one attack at any character moving into range until they miss, at which points the Guard ends.  A character who is hit by the Guard is immediately moved back into the hex they came from.  A character who is charging or running takes double damage and is automatically Knocked Down (this includes mounted characters and their mounts) as well as moved back.  Characters who are already in range of the Guard are free to ignore it.",
        hasValue: false,
        skilled: true
    },
    halfSword: {
        label: "Half-Sword",
        description: "Ignore 6 points of a target’s Soak from armor (only).  The weapon is considered one Size category smaller for purposes of Grapple Attacks.  Reduce Deflection by 2 until next Action.  This action can only be performed with a free hand (i.e., no weapon or shield in the other hand).",
        hasValue: false,
        skilled: true
    },
    heavyHit: {
        label: "Heavy Hit",
        description: "Make an attack with a Penalty Step to double the base Damage.",
        hasValue: false,
        skilled: true
    },
    lashingChain: {
        label: "Lashing Chain",
        description: "Ignore any Deflection from shields or weapons. Reduce Deflection by 2 until next Action.",
        hasValue: false,
        skilled: true
    },
    mercyStroke: {
        label: "Mercy Stroke",
        description: "The Crit Die becomes the Damage and vice versa.",
        hasValue: false,
        skilled: true
    },
    piercingBlow: {
        label: "Piercing Blow",
        description: "Attack with one Penalty Step and ignore 6 points of a target’s Soak from armor (only).",
        hasValue: false,
        skilled: true
    },
    rapidStrike: {
        label: "Rapid Strike",
        description: "Perform two attacks with two Penalty Steps to Accuracy. The targets may be different.",
        hasValue: false,
        skilled: true
    },
    reach: {
        label: "Reach",
        description: "This weapon can attack at a range of 2 or 3 hexes from the wielder, respectively. This feature requires no special skill in the weapon.",
        hasValue: true,
        skilled: false
    },
    splitShield: {
        label: "Split Shield",
        description: "Attack the target’s Deflection, but a shield’s contribution reduces their Deflection instead of increasing it.  Damage is done directly to the shield and may exceed the listed Shield Soak.",
        hasValue: false,
        skilled: true
    },
    throw: {
        label: "Throw",
        description: "The weapon can be thrown. Doing so uses the base skill of the weapon.",
        hasValue: false,
        skilled: true
    },
    windmillSlash: {
        label: "Windmill Slash",
        description: "Attack with one Penalty Step and increase the Damage and Crit Die from d6s to d8s.",
        hasValue: false,
        skilled: true
    }
},

rangedSpecials : {
    "destructiveChanneling": {
        label: "Destructive Channeling",
        description: "Take a Crit Die of Raw damage to raise the Damage dice to 2d8.",
        hasValue: false,
        skilled: true
    },
    "distantShot": {
        label: "Distant Shot",
        description: "Reduce the damage die to 1d6 but double the base range.",
        hasValue: false,
        skilled: true
    },
    "ignoreForceBarrier": {
        label: "Ignore Force Barrier",
        description: "This weapon ignores Soak from Force Barriers. This requires no cpecial skill on the part of the user.",
        hasValue: false,
        skilled: false
    },
    "reload": {
        label: "Reload",
        description: "This weapon must be reloaded as a Move after firing before it can be fired again.",
        hasValue: false,
        skilled: false
    },
    "stationaryReload": {
        label: "Stationary Reload",
        description: "This weapon must be reloaded as a Move after firing before it can be fired again, but the character cannot move.",
        hasValue: false,
        skilled: false
    },
    "snapshot": {
        label: "Snapshot",
        description: "In the first round of a character's combat, if this weapon is already loaded and in hand, it can be fired before the Move phase. Characters perform Snapshots in standard Initiative order. Additionally, Snapshot makes the Standard Attack of this weapon an Immediate instead of an Action.",
        hasValue: false,
        skilled: true
    },
    "stabilize": {
        label: "Stabilize",
        description: "An attacker can use Stabilize as an Immediate action just prior to firing the weapon to gain a Bonus Step to their Accuracy. If done while Prone, the attacker gains 2 Bonus Steps.",
        hasValue: false,
        skilled: true
    },
    "blast": {
        label: "Blast",
        description: "Halve the base Damage, but the attack hits a Small Circle (1 hex + 6 hexes around it).",
        hasValue: false,
        skilled: true
    },
    "overdraw": {
        label: "Overdraw",
        description: "Attack with 1 Penalty Step to Accuracy to add an automatic Crit die if the attack does not Miss.",
        hasValue: false,
        skilled: true
    },
    "rapidShot": {
        label: "Rapid Shot",
        description: "Perform two attacks with 2 Penalty Steps to Accuracy. The targets may be different as long as they are within range.",
        hasValue: false,
        skilled: true
    },
    "concealment": {
        label: "Concealment",
        description: "Grants Concealment to all affected hexes. Attacks vs. Deflection and Awareness rolls into, out of, or through the affected Hexes have Disadvantage. Concealment breaks line of sight for purposes of making Stealth rolls.",
        hasValue: false,
        skilled: false
    },
    "roundBurn": {
        label: "Round Burn",
        description: "Burning oil causes damage on impact and on the round after, at which point it is extinguished. The initial attack is Accuracy vs. Reflex. All subsequent instances of damage Always Hit with no chance of Crit, i.e., they do the listed damage to everyone passing through it.",
        hasValue: true,
        skilled: false
    }
}
}

CONFIG.statusEffects = [
    {
        id: "bloodied",
        label: "Bloodied",
        icon: "systems/pillars-of-eternity/assets/conditions/bloodied.png",
        changes: [
            { key: "steps", mode: 6, value: "-2" },
            { key: "data.defenses.deflection.value", mode: 2, value: "-3" },
            { key: "data.defenses.fortitude.value", mode: 2, value: "-3" },
            { key: "data.defenses.reflex.value", mode: 2, value: "-3" },
            { key: "data.defenses.will.value", mode: 2, value: "-3" }],
            flags: {
                "pillars-of-eternity": {
                    changeCondition : {
                        0: { description: "Penalty to all Checks", script: "return true" }
                    }
                }
            }
    },
    {
        id: "winded",
        label: "Winded",
        icon: "systems/pillars-of-eternity/assets/conditions/winded.png",
        changes: [
            { key: "steps", mode: 6, value: "-1" },
            { key: "data.defenses.deflection.value", mode: 2, value: "-2" },
            { key: "data.defenses.fortitude.value", mode: 2, value: "-2" },
            { key: "data.defenses.reflex.value", mode: 2, value: "-2" },
            { key: "data.defenses.will.value", mode: 2, value: "-2" }],
        flags: {
            "pillars-of-eternity": {
                changeCondition : {
                    0: { description: "Penalty to all Checks", script: "return true" }
                }
            }
        }
    },
    {
        id: "weakened",
        label: "Weakened",
        icon: "systems/pillars-of-eternity/assets/conditions/weakened.png",
        changes: [{ key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags: {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "sickened",
        label: "Sickened",
        icon: "systems/pillars-of-eternity/assets/conditions/sickened.png",
        changes: [{ key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "enfeebled",
        label: "Enfeebled",
        icon: "systems/pillars-of-eternity/assets/conditions/enfeebled.png",
        changes: [{ key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "fit",
        label: "Fit",
        icon: "systems/pillars-of-eternity/assets/conditions/fit.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Disadvantage", script : ""}
                }
            }
        }
    },
    {
        id: "hardy",
        label: "Hardy",
        icon: "systems/pillars-of-eternity/assets/conditions/hardy.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Disadvantage", script : ""}
                }
            }
        }
    },
    {
        id: "robust",
        label: "Robust",
        icon: "systems/pillars-of-eternity/assets/conditions/robust.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage if involves physical activity", script: "if (data.skill && (data.skill.category.value :: 'physical' || data.skill.category.value :: 'martial')) return true" },
                    1 : {description : "Attacks against Fortitude have Disadvantage", script : ""}
                }
            }
        }
    },
    {
        id: "prone",
        label: "Prone",
        icon: "systems/pillars-of-eternity/assets/conditions/prone.png",
        changes: [{ key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true" },
                    1 : {description : "Attacks against Deflection or Reflex within 3 hexes have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "knocked-down",
        label: "Knocked Down",
        icon: "systems/pillars-of-eternity/assets/conditions/knocked-down.png",
        changes: [{ key: "state", mode: 6, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true" },
                    1 : {description : "Attacks against Deflection or Reflex within 3 hexes have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "down-n-out",
        label: "Down and Out",
        icon: "systems/pillars-of-eternity/assets/conditions/down-n-out.png",
        changes: [{ key: "state", mode: 6, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", script: "if (data.item.type :: 'weapon' && data.item.skill.value !: 'gun' && data.item.skill.value !: 'crossbow') return true" },
                    1 : {description : "Attacks against Deflection or Reflex within 3 hexes have Advantage", script : ""}
                }
            }
        }
    },
    {
        id: "hampered",
        label: "Hampered",
        icon: "systems/pillars-of-eternity/assets/conditions/hampered.png",
        changes: [{ key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Reflex have Advantage", script: "return data.item.isVsReflex" },
                }
            }
        }
    },
    {
        id: "immobilized",
        label: "Immobilized",
        icon: "systems/pillars-of-eternity/assets/conditions/immobilized.png",
        changes: [{ key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Reflex have Advantage", script: "return data.item.isVsReflex" },
                }
            }
        }
    },
    {
        id: "paralyzed",
        label: "Paralyzed",
        icon: "systems/pillars-of-eternity/assets/conditions/paralyzed.png",
        changes: [{ key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Deflection or Reflex have Advantage", script: "return (data.item.isVsReflex || data.item.isVsDeflection)" },
                }
            }
        }
    },
    {
        id: "nimble",
        label: "Nimble",
        icon: "systems/pillars-of-eternity/assets/conditions/nimble.png",
        changes: [{ key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Reflex or Disengagement have Disadvantage", script: "return data.item.isVsReflex" },
                }
            }
        }
    },
    {
        id: "quickened",
        label: "Quickened",
        icon: "systems/pillars-of-eternity/assets/conditions/quickened.png",
        changes: [{ key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Reflex or Disengagement have Disadvantage", script: "return data.item.isVsReflex" },
                }
            }
        }
    },
    {
        id: "swift",
        label: "Swift",
        icon: "systems/pillars-of-eternity/assets/conditions/swift.png",
        changes: [{ key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Reflex or Disengagement have Disadvantage", script: "return data.item.isVsReflex" },
                }
            }
        }
    },
    {
        id: "distracted",
        label: "Distracted",
        icon: "systems/pillars-of-eternity/assets/conditions/distracted.png",
        changes: [{ key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Deflection have Advantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "deafened",
        label: "Deafened",
        icon: "icons/svg/deaf.svg",
        changes: [{ key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Attacks against Deflection have Advantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "dazzled",
        label: "Dazzled",
        icon: "systems/pillars-of-eternity/assets/conditions/dazzled.png",
        changes: [{ key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage on Weapon Attacks or Skill checks that require sight", script: "return data.item.type :: 'weapon'" },
                    1 : { description: "Attacks against Deflection have Advantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "blinded",
        label: "Blinded",
        icon: "systems/pillars-of-eternity/assets/conditions/blinded.png",
        changes: [{ key: "steps", mode: 6, value: "-3" }, { key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Disadvantage on Weapon Attacks or Skill checks that require sight", script: "return data.item.type :: 'weapon'" },
                    1 : { description: "Attacks against Deflection have Advantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "aware",
        label: "Aware",
        icon: "systems/pillars-of-eternity/assets/conditions/aware.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage on Disengagement Attacks", script: "" },
                    1 : { description: "Attacks against Deflection have Disadvantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "insightful",
        label: "Insightful",
        icon: "systems/pillars-of-eternity/assets/conditions/insightful.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage on Weapon Attacks or Skill checks that require sight", script: "return data.item.type :: 'weapon'" },
                    1 : { description: "Attacks against Deflection have Disadvantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "all-seeing",
        label: "All-Seeing",
        icon: "systems/pillars-of-eternity/assets/conditions/all-seeing.png",
        changes: [{ key: "state", mode: 6, value: "adv" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Advantage on Weapon Attacks or Skill checks that require sight", script: "return data.item.type :: 'weapon'" },
                    1 : { description: "Attacks against Deflection have Disadvantage", script: "return data.item.isVsDeflection" },
                }
            }
        }
    },
    {
        id: "demoralized",
        label: "Demoralized",
        icon: "systems/pillars-of-eternity/assets/conditions/demoralized.png",
        changes: [{ key: "data.initiative.value", mode: 2, value: "-5" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    1 : { description: "Attacks against Will have Advantage", script: "return data.item.isVsWill" },
                }
            }
        }
    },
    {
        id: "frightened",
        label: "Frightened",
        icon: "systems/pillars-of-eternity/assets/conditions/frightened.png",
        changes: [{ key: "data.initiative.value", mode: 2, value: "-5" }, { key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    1 : { description: "Attack and skill rolls within line of sight of the source of fear have Disadvantage", script: "" },
                    2 : { description: "Attacks against Will have Advantage", script: "return data.item.isVsWill" },
                }
            }
        }
    },
    {
        id: "terrified",
        label: "Terrified",
        icon: "systems/pillars-of-eternity/assets/conditions/terrified.png",
        changes: [{ key: "data.initiative.value", mode: 2, value: "-5" }, { key: "state", mode: 6, value: "dis" }, { key: "state", mode: 7, value: "adv" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    1 : { description: "Attack and skill rolls within line of sight of the source of fear have Disadvantage", script: "" },
                    2 : { description: "Attacks against Will have Advantage", script: "return data.item.isVsWill" },
                }
            }
        }
    },
    {
        id: "charmed",
        label: "Charmed",
        icon: "systems/pillars-of-eternity/assets/conditions/charmed.png"
    },
    {
        id: "dominated",
        label: "Dominated",
        icon: "systems/pillars-of-eternity/assets/conditions/dominated.png"
    },
    {
        id: "determined",
        label: "Determined",
        icon: "systems/pillars-of-eternity/assets/conditions/determined.png",
        changes: [{ key: "steps", mode: 6, value: "1" }, { key: "state", mode: 7, value: "dis" }],
        flags:             
        {
            "pillars-of-eternity": {
                changeCondition : {
                    0 : { description: "Bonus step to one roll per round", script: "" },
                    1 : { description: "Attacks against Will have Disadvantage", script: "return data.item.isVsWill" },
                }
            }
        }
    },
    {
        id: "resolute",
        label: "Resolute",
        icon: "systems/pillars-of-eternity/assets/conditions/resolute.png"
    },
    {
        id: "inspiring",
        label: "Inspiring",
        icon: "systems/pillars-of-eternity/assets/conditions/inspiring.png"
    },
    {
        id: "incapacitated",
        label: "Incapacitated",
        icon: "icons/svg/skull.svg"
    },
    {
        id: "dead",
        label: "Dead",
        icon: "systems/pillars-of-eternity/assets/conditions/dead.svg"
    }
]
