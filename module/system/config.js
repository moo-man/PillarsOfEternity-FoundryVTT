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


POE.meleeSpecials = {

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

POE.rangedSpecials = {
    "destructiveChanneling" : {
        label : "Destructive Channeling",
        description : "Take a Crit Die of Raw damage to raise the Damage dice to 2d8.",
        hasValue : false,
        skilled : true
    },
    "distantShot" : {
        label : "Distant Shot",
        description : "Reduce the damage die to 1d6 but double the base range.",
        hasValue : false,
        skilled : true
    },
    "ignoreForceBarrier" : {
        label : "Ignore Force Barrier",
        description : "This weapon ignores Soak from Force Barriers. This requires no cpecial skill on the part of the user.",
        hasValue : false,
        skilled : false
    },
    "reload" : {
        label : "Reload",
        description : "This weapon must be reloaded as a Move after firing before it can be fired again.",
        hasValue : false,
        skilled : false
    },
    "snapshot" : {
        label : "Snapshot",
        description : "In the first round of a character's combat, if this weapon is already loaded and in hand, it can be fired before the Move phase. Characters perform Snapshots in standard Initiative order. Additionally, Snapshot makes the Standard Attack of this weapon an Immediate instead of an Action.",
        hasValue : false,
        skilled : true
    },
    "stabilize" : {
        label : "Stabilize",
        description : "An attacker can use Stabilize as an Immediate action just prior to firing the weapon to gain a Bonus Step to their Accuracy. If done while Prone, the attacker gains 2 Bonus Steps.",
        hasValue : false,
        skilled : true
    },
    "blast" : {
        label : "Blast",
        description : "Halve the base Damage, but the attack hits a Small Circle (1 hex + 6 hexes around it).",
        hasValue : false,
        skilled : true
    },
    "overdraw" : {
        label : "Overdraw",
        description : "Attack with 1 Penalty Step to Accuracy to add an automatic Crit die if the attack does not Miss.",
        hasValue : false,
        skilled : true
    },
    "rapidShot" : {
        label : "Rapid Shot",
        description : "Perform two attacks with 2 Penalty Steps to Accuracy. The targets may be different as long as they are within range.",
        hasValue : false,
        skilled : true
    },
    "concealment" : {
        label : "Concealment",
        description : "Grants Concealment to all affected hexes. Attacks vs. Deflection and Awareness rolls into, out of, or through the affected Hexes have Disadvantage. Concealment breaks line of sight for purposes of making Stealth rolls.",
        hasValue : false,
        skilled : false
    },
    "roundBurn" : {
        label : "Round Burn",
        description : "Burning oil causes damage on impact and on the round after, at which point it is extinguished. The initial attack is Accuracy vs. Reflex. All subsequent instances of damage Always Hit with no chance of Crit, i.e., they do the listed damage to everyone passing through it.",
        hasValue : true,
        skilled : false
    }
}

CONFIG.statusEffects = [
    {
        id : "bloodied",
        label : "Bloodied",
        icon : "systems/pillars-of-eternity/assets/conditions/bloodied.png",
        changes : [
            {key: "steps", mode : 0, value : -2}, 
            {key: "data.defenses.deflection.value", mode : 2, value : -3},
            {key: "data.defenses.fortitude.value", mode : 2, value : -3},
            {key: "data.defenses.reflexes.value", mode : 2, value : -3},
            {key: "data.defenses.will.value", mode : 2, value : -3}],
        flags : { "pillars-of-eternity.description" : "All Rolls", "pillars-of-eternity.manual" : true}
    },
    {
        id : "winded",
        label : "Winded",
        icon : "systems/pillars-of-eternity/assets/conditions/winded.png",
        changes : [
            {key: "steps", mode : 0, value : -1}, 
            {key: "data.defenses.deflection.value", mode : 2, value : -2},
            {key: "data.defenses.fortitude.value", mode : 2, value : -2},
            {key: "data.defenses.reflexes.value", mode : 2, value : -2},
            {key: "data.defenses.will.value", mode : 2, value : -2}],
        flags : { "pillars-of-eternity.description" : "All Rolls", "pillars-of-eternity.manual" : true}
    },
    {
        id : "weakened",
        label : "Weakened",
        icon : "systems/pillars-of-eternity/assets/conditions/weakened.png",
        changes : [{key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Advantage"}
    },
    {
        id : "sickened",
        label : "Sickened",
        icon : "systems/pillars-of-eternity/assets/conditions/sickened.png",
        changes : [{key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Advantage"}
    },
    {
        id : "enfeebled",
        label : "Enfeebled",
        icon : "systems/pillars-of-eternity/assets/conditions/enfeebled.png",
        changes : [{key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Advantage"}
    },
    {
        id : "fit",
        label : "Fit",
        icon : "systems/pillars-of-eternity/assets/conditions/fit.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Advantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Disadvantage"}
    },
    {
        id : "hardy",
        label : "Hardy",
        icon : "systems/pillars-of-eternity/assets/conditions/hardy.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Advantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Disadvantage"}
    },
    {
        id : "robust",
        label : "Robust",
        icon : "systems/pillars-of-eternity/assets/conditions/robust.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Advantage if involves physical activity", "pillars-of-eternity.targetDescription" : "Attacks against Fortitude have Disadvantage"}
    },
    {
        id : "prone",
        label : "Prone",
        icon : "systems/pillars-of-eternity/assets/conditions/prone.png",
        changes : [{key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value: "adv"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", "pillars-of-eternity.targetDescription" : "Attacks against Deflection or Reflex within 3 hexes"}
    },
    {
        id : "knocked-down",
        label : "Knocked Down",
        icon : "systems/pillars-of-eternity/assets/conditions/knocked-down.png",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", "pillars-of-eternity.targetDescription" : "Attacks against Deflection or Reflex within 3 hexes"}
    },
    {
        id : "down-n-out",
        label : "Down and Out",
        icon : "systems/pillars-of-eternity/assets/conditions/down-n-out.png",
        changes : [{key: "state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon attacks (besides firearms, crossbows, or arbalests)", "pillars-of-eternity.targetDescription" : "Attacks against Deflection or Reflex within 3 hexes"}
    },
    {
        id : "hampered",
        label : "Hampered",
        icon : "systems/pillars-of-eternity/assets/conditions/hampered.png",
        changes : [{key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Reflex have Advantage"}
    },
    {
        id : "immobilized",
        label : "Immobilized",
        icon : "systems/pillars-of-eternity/assets/conditions/immobilized.png",
        changes : [{key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Reflex have Advantage"}
    },
    {
        id : "paralyzed",
        label : "Paralyzed",
        icon : "systems/pillars-of-eternity/assets/conditions/paralyzed.png",
        changes : [{key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Deflection or Reflex have Advantage"}
    },
    {
        id : "nimble",
        label : "Nimble",
        icon : "systems/pillars-of-eternity/assets/conditions/nimble.png",
        changes : [{key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Reflex or Disengagement have Disadvantage"}
    },
    {
        id : "quickened",
        label : "Quickened",
        icon : "systems/pillars-of-eternity/assets/conditions/quickened.png",
        changes : [{key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Reflex or Disengagement have Disadvantage"}
    },
    {
        id : "swift",
        label : "Swift",
        icon : "systems/pillars-of-eternity/assets/conditions/swift.png",
        changes : [{key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Reflex or Disengagement have Disadvantage"}
    },
    {
        id : "distracted",
        label : "Distracted",
        icon : "systems/pillars-of-eternity/assets/conditions/distracted.png",
        changes : [{key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Advantage"}
    },
    {
        id : "deafened",
        label : "Deafened",
        icon : "icons/svg/deaf.svg",
        changes : [{key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Advantage"}
    },
    {
        id : "dazzled",
        label : "Dazzled",
        icon : "systems/pillars-of-eternity/assets/conditions/dazzled.png",
        changes : [{key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon Attacks or Skill checks that require sight", "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Advantage"}
    },
    {
        id : "blinded",
        label : "Blinded",
        icon : "systems/pillars-of-eternity/assets/conditions/blinded.png",
        changes : [{key: "steps", mode : 0, value : -3}, {key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Disadvantage on Weapon Attacks or Skill checks that require sight, Deflection Attacks gain 3 Penalty Steps", "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Advantage"}
    },
    {
        id : "aware",
        label : "Aware",
        icon : "systems/pillars-of-eternity/assets/conditions/aware.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Advantage on Disengagement Attacks", "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Disadvantage"}
    },
    {
        id : "insightful",
        label : "Insightful",
        icon : "systems/pillars-of-eternity/assets/conditions/insightful.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Attack rolls and skill checks that require sight", "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Disadvantage"}
    },
    {
        id : "all-seeing",
        label : "All-Seeing",
        icon : "systems/pillars-of-eternity/assets/conditions/all-seeing.png",
        changes : [{key: "state", mode : 0, value : "adv"}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Attack rolls and skill checks that require sight", "pillars-of-eternity.targetDescription" : "Attacks against Deflection have Disadvantage"}
    },
    {
        id : "demoralized",
        label : "Demoralized",
        icon : "systems/pillars-of-eternity/assets/conditions/demoralized.png",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.targetDescription" : "Attacks against Will have Advantage"}
    },
    {
        id : "frightened",
        label : "Frightened",
        icon : "systems/pillars-of-eternity/assets/conditions/frightened.png",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}, {key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Attack and skill rolls within line of sight of the source of fear", "pillars-of-eternity.targetDescription" : "Attacks against Will have Advantage"}
    },
    {
        id : "terrified",
        label : "Terrified",
        icon : "systems/pillars-of-eternity/assets/conditions/terrified.png",
        changes : [{key: "data.initiative.value", mode : 2, value : -5}, {key: "state", mode : 0, value : "dis"}, {key: "targeter.state", mode : 0, value : "adv"}],
        flags : { "pillars-of-eternity.description" : "Attack and skill rolls within line of sight of the source of fear", "pillars-of-eternity.targetDescription" : "Attacks against Will have Advantage"}
    },
    {
        id : "charmed",
        label : "Charmed",
        icon : "systems/pillars-of-eternity/assets/conditions/charmed.png"
    },
    {
        id : "dominated",
        label : "Dominated",
        icon : "systems/pillars-of-eternity/assets/conditions/dominated.png"
    },
    {
        id : "determined",
        label : "Determined",
        icon : "systems/pillars-of-eternity/assets/conditions/determined.png",
        changes : [{key: "steps", mode : 0, value : 1}, {key: "targeter.state", mode : 0, value : "dis"}],
        flags : { "pillars-of-eternity.description" : "Bonus step to one roll per round", "pillars-of-eternity.targetDescription" : "Attacks against Will have Disadvantage"}
    },
    {
        id : "resolute",
        label : "Resolute",
        icon : "systems/pillars-of-eternity/assets/conditions/resolute.png"
    },
    {
        id : "inspiring",
        label : "Inspiring",
        icon : "systems/pillars-of-eternity/assets/conditions/inspiring.png"
    }
]
