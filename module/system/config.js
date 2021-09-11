export const POE = {};

POE.attributeTypes = {
    "benefit": "Benefit",
    "hindrance": "Hindrance"
}


POE.skillTypes = {
    "academic": "Academic",
    "artistic": "Artistic",
    "language": "Language",
    "martial": "Martial",
    "physical": "Physical",
    "social": "Social",
    "worldly": "Worldly"
}

POE.traitTypes = {
    "adventure": "Adventure",
    "experience": "Experience"
}


POE.powerRanges = {
    "none": "None",
    "adjacent": "Adjacent",
    "meleeWeapon": "Melee Weapon",
    "close": "Close",
    "equippedWeapon": "Equipped Weapon",
    "mid": "Mid",
    "far": "Far",
    "extreme": "Extreme",
}

POE.powerTargetTypes = {
    "target": "Target",
    "circle": "Circle",
    "aura": "Aura",
    "cone": "Cone",
    "ray": "Ray",
    "line": "Line",
    "boundary": "Boundary",
}

POE.powerTargets = {
    "self": "Self",
    "individualEU": "Individual EU",
    "individual": "Individual",
    "space": "Space"
}

POE.powerCircles = {
    "small": "Small Circle",
    "medium": "Medium Circle",
    "large": "Large Circle"
}

POE.powerAuras = {
    "small": "Small Aura",
    "large": "Large Aura"
}

POE.powerCones = {
    "small": "Small Cone",
    "medium": "Medium Cone",
    "large": "Large Cone"
}

POE.powerRays = {
    "narrow": "Narrow Ray",
    "wide": "Wide Ray"
}

POE.powerLines = {
    "short": "Short Line",
    "long": "Long Line"
}

POE.powerBoundarys = {
    "adjacent": "Adjacent Boundary",
    "small": "Small Boundary",
    "large": "Large Boundary",
    "huge": "Huge Boundary"
}

POE.powerDurations = {
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
}

POE.powerSpeeds = {
    "slow": "Slow",
    "move": "Move",
    "action": "Action",
    "immediate": "Immediate",
    "reaction": "Reaction",
    "triggered1rest": "Triggered 1/Rest",
    "triggered1encounter": "Triggered 1/Encounter",
}

POE.powerExclusions = {
    "none": "None",
    "target": "Target",
    "single": "Single",
    "selective": "Selective"
}

POE.powerSources = {
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
}

POE.areaTargetTypes = {
    "circle": "circle",
    "aura": "circle",
    "cone": "cone",
    "ray": "ray",
    "line": "ray"
}

POE.areaTargetDistances = {
    circle: {
        "small": { distance: 1 },
        "medium": { distance: 2.7 },
        "large": { distance: 5.2 }
    },

    aura: {
        "small": { distance: 1 },
        "large": { distance: 2.7 }
    },

    cone: {
        "small": { distance: 3 },
        "medium": { distance: 5 },
        "large": { distance: 7 }
    },

    ray: {
        "narrow": { distance: 10, width: 1 },
        "wide": { distance: 10, width: 3 }
    },

    line: {
        "short": { distance: 3 },
        "long": { distance: 8 }
    }
}


POE.powerSourceTypes = {
    "external": "External",
    "personal": "Personal",
    "trained": "Trained"
}

POE.powerEffectType  = {
    "damage" : "Damage",
    "condition" : "Condition",
    "other" : "Other"
}

POE.powerEffectResistTypes = {
    "always" : "Always",
    "reflex" : "Reflex",
    "fortitude": "Fortitude",
    "will" : "Will"
}


POE.damageTypes = {
    "burn" : "Burn",
    "freeze" : "Freeze",
    "raw" : "Raw",
    "corrode" : "Corrode",
    "shock" : "Shock"
}

POE.weaponTypes = {
    "smallMelee": "Small Melee",
    "mediumMelee": "Medium Melee",
    "largeMelee": "Large Melee",
    "mediumRanged": "Medium Ranged",
    "largeRanged": "Large Ranged",
    "grenade": "Grenade"
}

POE.armorTypes = {
    "physical" : "Physical",
    "light": "Light Armor",
    "medium": "Medium Armor",
    "heavy": "Heavy Armor"
}


POE.equipmentTypes = {
    "gear": "Gear",
    "tool": "Tool"
}

POE.suitabilities = {
    "none": "No Penalty",
    "good": "Good (-2)",
    "fair": "Fair (-4)",
    "poor": "Poor (-8)"
}

POE.actorSizes = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

POE.sizeAttributes = {
    "-4":
        {
            light: 1,
            heavy: 2,
            maxHealthEndurance: 4,
            windedExert : 1
        },
    "-3":
        {
            light: 2,
            heavy: 3,
            maxHealthEndurance: 8,
            windedExert : 2
        },
    "-2":
        {
            light: 6,
            heavy: 12,
            maxHealthEndurance: 16,
            windedExert : 4
        },
    "-1":
        {
            light: 10,
            heavy: 20,
            maxHealthEndurance: 32,
            windedExert : 8
        },
    "0":
        {
            light: 12,
            heavy: 24,
            maxHealthEndurance: 36,
            windedExert : 9
        },
    "1":
        {
            light: 14,
            heavy: 28,
            maxHealthEndurance: 40,
            windedExert : 10
        },
    "2":
        {
            light: 24,
            heavy: 48,
            maxHealthEndurance: 75,
            windedExert : 18
        },
    "3":
        {
            light: 40,
            heavy: 80,
            maxHealthEndurance: 125,
            windedExert : 30
        },
    "4":
        {
            light: 80,
            heavy: 160,
            maxHealthEndurance: 250,
            windedExert : 60
        },
    "5":
        {
            light: 166,
            heavy: 332,
            maxHealthEndurance: 500,
            windedExert : 125
        }
}


POE.itemSpecials = {

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
}

CONFIG.statusEffects = [
    {
        id : "bloodied",
        label : "Bloodied",
        icon : "icons/svg/blood.svg",
        changes : [
            {key: "steps", mode : 0, value : -2}, 
            {key: "data.defenses.deflection.value", mode : 2, value : -3},
            {key: "data.defenses.fortitude.value", mode : 2, value : -3},
            {key: "data.defenses.reflexes.value", mode : 2, value : -3},
            {key: "data.defenses.will.value", mode : 2, value : -3}],
        flags : { "pillars-of-eternity.description" : "All Rolls"}
    },
    {
        id : "winded",
        label : "Winded",
        icon : "icons/svg/unconscious.svg",
        changes : [
            {key: "steps", mode : 0, value : -1}, 
            {key: "data.defenses.deflection.value", mode : 2, value : -2},
            {key: "data.defenses.fortitude.value", mode : 2, value : -2},
            {key: "data.defenses.reflexes.value", mode : 2, value : -2},
            {key: "data.defenses.will.value", mode : 2, value : -2}],
        flags : { "pillars-of-eternity.description" : "All Rolls"}
    },
    {
        id : "weakened",
        label : "Weakened",
        icon : "icons/svg/degen.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "sickened",
        label : "Sickened",
        icon : "icons/svg/degen.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "enfeebled",
        label : "Enfeebled",
        icon : "icons/svg/degen.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "fit",
        label : "Fit",
        icon : "icons/svg/regen.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "hardy",
        label : "Hardy",
        icon : "icons/svg/regen.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "robust",
        label : "Robust",
        icon : "icons/svg/regen.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Involves Physical Activity"}
    },
    {
        id : "prone",
        label : "Prone",
        icon : "icons/svg/falling.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)"}
    },
    {
        id : "knocked-down",
        label : "Knocked Down",
        icon : "icons/svg/falling.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)"}
    },
    {
        id : "down-n-out",
        label : "Down and Out",
        icon : "icons/svg/falling.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)"}
    },
    {
        id : "hampered",
        label : "Hampered",
        icon : "icons/svg/paralysis.svg"
    },
    {
        id : "immobilized",
        label : "Immobilized",
        icon : "icons/svg/paralysis.svg"
    },
    {
        id : "paralyzed",
        label : "Paralyzed",
        icon : "icons/svg/paralysis.svg"
    },
    {
        id : "nimble",
        label : "Nimble",
        icon : "icons/svg/ice-aura.svg"
    },
    {
        id : "quickened",
        label : "Quickened",
        icon : "icons/svg/ice-aura.svg"
    },
    {
        id : "swift",
        label : "Swift",
        icon : "icons/svg/ice-aura.svg"
    },
    {
        id : "ditracted",
        label : "Distracted",
        icon : "icons/svg/sun.svg"
    },
    {
        id : "deafened",
        label : "Deafened",
        icon : "icons/svg/deaf.svg"
    },
    {
        id : "dazzled",
        label : "Dazzled",
        icon : "icons/svg/blind.svg",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon Attacks or Skill checks that require sight"}
    },
    {
        id : "blinded",
        label : "Blinded",
        icon : "icons/svg/blind.svg",
        changes : [{key: "steps", mode : 0, value : -3}],
        flags : { "pillars-of-eternity.description" : "Skill checks requiring sight"}
    },
    {
        id : "aware",
        label : "Aware",
        icon : "icons/svg/eye.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Disengagement Attacks"}
    },
    {
        id : "insightful",
        label : "Insightful",
        icon : "icons/svg/eye.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Attack rolls and skill checks that require sight"}
    },
    {
        id : "all-seeing",
        label : "All-Seeing",
        icon : "icons/svg/eye.svg",
        changes : [{key: "state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Attack rolls and skill checks that require sight"}
    },
    {
        id : "demoralized",
        label : "Demoralized",
        icon : "icons/svg/unconscious.svg",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}]
    },
    {
        id : "frightened",
        label : "Frightened",
        icon : "icons/svg/terror.svg",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}, {key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Attack and skill rolls within line of sight of the source of fear"}
    },
    {
        id : "terrified",
        label : "Terrified",
        icon : "icons/svg/terror.svg",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}, {key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Attack and skill rolls within line of sight of the source of fear"}
    },
    {
        id : "charmed",
        label : "Charmed",
        icon : "icons/svg/stoned.svg"
    },
    {
        id : "dominated",
        label : "Dominated",
        icon : "icons/svg/stoned.svg"
    },
    {
        id : "determined",
        label : "Determined",
        icon : "icons/svg/statue.svg",
        changes : [{key: "steps", mode : 0, value : 1}],
        flags : { "pillars-of-eternity.description" : "Bonus step to one roll per round"}
    },
    {
        id : "resolute",
        label : "Resolute",
        icon : "icons/svg/statue.svg"
    },
    {
        id : "inspiring",
        label : "Inspiring",
        icon : "icons/svg/statue.svg"
    }
]
