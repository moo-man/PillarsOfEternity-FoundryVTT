import RollDialog from "../apps/roll-dialog.js";
import SkillCheck from "../system/skill-check.js";
import PillarsActiveEffect from "../system/pillars-effect.js"
import AgingDialog from "../apps/aging-dialog.js";

/**
 * Extend FVTT Actor class for Pillars functionality
 * @extends {Actor}
 */
export class PillarsActor extends Actor {


    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user)
        // Set wounds, advantage, and display name visibility
        if (!data.token)
            this.data.update(
                {
                    "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,         // Default disposition to neutral
                    "token.name": data.name,                                      // Set token name to actor name
                    "token.bar1": { "attribute": "health" },                 // Default Bar 1 to Wounds
                    "token.bar2": { "attribute": "endurance" },               // Default Bar 2 to Advantage
                    "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display name to be on owner hover
                    "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display bars to be on owner hover
                    "token.dimSight": 12,
                    "token.brightSight": 6,
                })

        this.data.update({ "flags.pillars-of-eternity.autoEffects": true })
        // Default characters to HasVision = true and Link Data = true
        if (data.type == "character") {
            this.data.update({ "token.vision": true });
            this.data.update({ "token.actorLink": true });
        }
    }

    setSpeciesData(data) {
        let speciesItem = this.getItemTypes("species")[0]
        let stockItem = this.getItemTypes("stock")[0]
        let godlikeItem = this.getItemTypes("godlike")[0]
        let cultureItem = this.getItemTypes("culture")[0]
        if (speciesItem) {
            data.details.species = speciesItem.name;
            data.stride.value = speciesItem.stride.value
            this.data.flags.tooltips.stride.value.push(`${speciesItem.stride.value} (${speciesItem.name})`)
            data.size.value = speciesItem.size.value
            this.setSizeData(data)
        }
        else if (Number.isNumeric(data.size.value)) {
            this.setSizeData(data)
        }
        if (stockItem)
            data.details.stock = stockItem.name
        if (cultureItem)
            data.details.culture = cultureItem.name
        if (godlikeItem)
            data.details.godlike = godlikeItem.name


        //return this.update({"data" : data})
    }

    setSizeData(data) {
        let tier = this.tier.value || "novice"
        let attributes = game.pillars.config.sizeAttributes[data.size.value][tier]
        data.damageIncrement.value = attributes.damageIncrement
        data.toughness.value = attributes.toughness
        this.data.flags.tooltips.toughness.value.push(data.toughness.value + " (Base)")
        this.data.flags.tooltips.damageIncrement.value.push(data.damageIncrement.value + " (Base)")

        data.defenses.deflection.value = 10 - (data.size.value * 2)
        data.defenses.reflex.value = 15 - (data.size.value * 2)
        data.defenses.fortitude.value = 15 + (data.size.value * 2)
        data.defenses.will.value = 15

        this.data.flags.tooltips.endurance.threshold.winded.push(this.endurance.threshold.winded + " (Base)")
        this.data.flags.tooltips.health.threshold.bloodied.push(this.health.threshold.bloodied + " (Base)")
        this.data.flags.tooltips.health.threshold.incap.push(this.health.threshold.incap + " (Base)")

        this.data.flags.tooltips.defenses.deflection.push("10" + " (Base)")
        this.data.flags.tooltips.defenses.reflex.push("15" + " (Base)")
        this.data.flags.tooltips.defenses.fortitude.push("15" + " (Base)")
        this.data.flags.tooltips.defenses.will.push("15" + " (Base)")

        this.data.flags.tooltips.defenses.deflection.push(-data.size.value * 2 + " (Size)")
        this.data.flags.tooltips.defenses.reflex.push(-data.size.value * 2 + " (Size)")
        this.data.flags.tooltips.defenses.fortitude.push(data.size.value * 2 + " (Size)")
    }

    prepareBaseData() {
        this.data.flags.tooltips = {
            defenses: {
                deflection: [],
                reflex: [],
                fortitude: [],
                will: []
            },
            health: {
                max: [],
                threshold: {
                    bloodied: [],
                    incap: []
                }
            },
            endurance: {
                max: [],
                threshold: {
                    winded: []
                }
            },
            initiative: {
                value: []
            },
            soak: {
                base: [],
                shield: []
            },
            stride: {
                value: []
            },
            run: {
                value: []
            },
            toughness: {
                value: []
            },
            damageIncrement: {
                value: []
            }
        }

        this.setSpeciesData(this.data.data)
        this.run.value = 0 // Set run to 0 so active effects can still be applied to the the derived value
        this.data.flags.tooltips.run.value.push(`Stride x 2 (Base)`)



        let tierBonus = (game.pillars.config.tierBonus[this.tier.value])

        if (tierBonus) {

            for (let defense in this.defenses) {
                this.defenses[defense].value += tierBonus.def
                this.data.flags.tooltips.defenses[defense].push(tierBonus.def + " (Tier)")
            }
        }


        let checkedCount = 0;
        for (let defense in this.defenses)
            checkedCount += this.defenses[defense].checked ? 1 : 0

        if (checkedCount > 0) {
            let bonus = 5 - checkedCount
            for (let defense in this.defenses)
                if (this.defenses[defense].checked) {
                    this.defenses[defense].value += bonus
                    this.data.flags.tooltips.defenses[defense].push(bonus + " (Checked Bonus)")
                }
        }
    };

    prepareDerivedData() {

        let equippedArmor = this.getItemTypes("armor").filter(i => i.equipped.value)[0]
        let equippedShield = this.getItemTypes("shield").filter(i => i.equipped.value)[0]

        this.run.value += this.stride.value * 2

        this.health.threshold.bloodied += this.health.modifier
        this.health.threshold.incap += this.health.modifier
        this.endurance.threshold.winded += this.endurance.bonus
        if (equippedArmor) {
            this.endurance.threshold.winded += (equippedArmor.winded.value || 0)
            this.data.flags.tooltips.endurance.threshold.winded.push(equippedArmor.winded.value + " (Armor)")
        }
        if (equippedShield) {
            this.endurance.threshold.winded += (equippedShield.winded.value || 0)
            this.data.flags.tooltips.endurance.threshold.winded.push(equippedShield.winded.value + " (Shield)")
        }

        this.health.bloodied = this.health.value > this.health.threshold.bloodied
        this.endurance.winded = this.endurance.value > this.endurance.threshold.winded
        this.health.incap = this.health.value > this.health.threshold.incap
        this.endurance.incap = this.endurance.value >= this.endurance.max
        this.health.dead = this.health.value >= this.health.max

        if (this.type == "character") {
            let thresholds = game.pillars.config.agePointsDeathRank
            for (let pointThreshold in thresholds) {
                if (parseInt(this.life.agingPoints) < parseInt(pointThreshold)) {
                    this.life.march = thresholds[pointThreshold]
                    break;
                }
            }
            this.life.march -= 1
        }
    }

    //#region Data Preparation
    prepareData() {
        try {
            super.prepareData();
            this.itemCategories = this.itemTypes
            for (let type in this.itemCategories)
                this.itemCategories[type] = this.itemCategories[type].sort((a, b) => a.data.sort > b.data.sort ? 1 : -1)

            this.prepareItems()
            this.prepareCombat()
            this.prepareEffectTooltips()

        }
        catch (e) {
            console.error(e);
        }
    }

    prepareItems() {
        let weight = 0;
        for (let i of this.items) {
            i.prepareOwnedData()
            if (i.weight)
                weight += i.weight.value
        }
        this.data.weight = weight
    }


    prepareCombat() {
        let equippedArmor = this.getItemTypes("armor").filter(i => i.equipped.value)[0]
        let equippedShield = this.getItemTypes("shield").filter(i => i.equipped.value)[0]

        if (equippedArmor) {
            this.soak.base += equippedArmor.soak.value || 0
            this.initiative.value += equippedArmor.initiative.value
            this.toughness.value += equippedArmor.toughness.value
            this.stride.value += equippedArmor.stride.value
            this.run.value += equippedArmor.run.value

            this.data.flags.tooltips.soak.base.push(equippedArmor.soak.value + " (Armor)")
            this.data.flags.tooltips.initiative.value.push(equippedArmor.initiative.value + " (Armor)")
            this.data.flags.tooltips.toughness.value.push(equippedArmor.toughness.value + " (Armor)")
            this.data.flags.tooltips.stride.value.push(equippedArmor.stride.value + " (Armor)")
            this.data.flags.tooltips.run.value.push(equippedArmor.run.value + " (Armor)")
        }
        if (equippedShield) {
            this.soak.shield = this.soak.base + (equippedShield.soak.value || 0)
            this.data.flags.tooltips.soak.shield = this.data.flags.tooltips.soak.shield.concat(this.data.flags.tooltips.soak.base)
            this.data.flags.tooltips.soak.shield.push(equippedShield.soak.value + " (Shield)")
            this.defenses.deflection.value += equippedShield.deflection.value
            this.data.flags.tooltips.defenses.deflection.push(equippedShield.deflection.value + " (Shield)")
        }
    }

    prepareEffectTooltips() {
        let tooltips = this.data.flags.tooltips
        let tooltipKeys = Object.keys(flattenObject(this.data.flags.tooltips))
        for (let effect of this.effects.filter(e => !e.data.disabled)) {
            for (let change of effect.data.changes) {
                let foundTooltipKey = tooltipKeys.find(key => change.key.includes(key))
                if (foundTooltipKey) {
                    let tooltip = getProperty(tooltips, foundTooltipKey)
                    tooltip.push(change.value + ` (${effect.data.label})`)
                }
            }
        }
    }

    //#endregion

    //#region Roll Setup

    async setupSkillCheck(skill) {
        let skillItem
        if (typeof skill == "string")
            skillItem = this.items.getName(skill)
        else {
            skillItem = skill;
            skill = skillItem.name
        }

        let data = this.getSkillDialogData("skill", skillItem, { name: skill })
        let checkData = await RollDialog.create(data)
        checkData.skillName = skill
        checkData.title = data.title
        checkData.skillId = skillItem?.id
        checkData.speaker = this.speakerData();
        checkData.targetSpeaker = this.targetSpeakerData();
        return checkData
    }

    async setupWeaponCheck(weapon) {
        if (typeof weapon == "string")
            weapon = this.items.get(weapon)

        if (!weapon.skill.value)
            throw ui.notifications.error("No skill assigned to the weapon")

        let data = this.getWeaponDialogData("weapon", weapon)
        let checkData = await RollDialog.create(data)
        checkData.title = data.title
        checkData.skillId = weapon.Skill?.id
        checkData.skillName = weapon.skill.value
        checkData.itemId = weapon.id
        checkData.speaker = this.speakerData();
        checkData.targetSpeaker = this.targetSpeakerData();
        return checkData
    }

    async setupPowerCheck(power) {
        if (typeof power == "string")
            power = this.items.get(power)

        if (!power.SourceItem)
            throw ui.notifications.error("Could not find Power Source")

        if (power.SourceItem.pool.current < power.level.value)
            throw ui.notifications.error("Not enough power!")

        let data = this.getPowerDialogData("power", power)
        let checkData = await RollDialog.create(data)
        checkData.title = data.title
        checkData.sourceId = power.SourceItem.id
        checkData.itemId = power.id
        checkData.speaker = this.speakerData();
        checkData.targetSpeaker = this.targetSpeakerData();
        return checkData
    }

    async setupAgingRoll() {
        let dialogData = { modifier: game.pillars.config.lifePhaseModifier[this.life.phase] || 0, effects: this.getDialogRollEffects() }
        let checkData = await AgingDialog.create(dialogData)
        checkData.title = "Aging Roll"
        checkData.speaker = this.speakerData();
        return checkData
    }

    //#endregion

    //#region Convenience Helpers
    getItemTypes(type) {
        return (this.itemCategories || this.itemTypes)[type]
    }

    getDialogData(type, item, options) {
        let dialogData = {}
        dialogData.title = `${item?.name || options.name} Check`
        dialogData.modifier = ""
        dialogData.steps = 0
        dialogData.effects = this.getDialogRollEffects()
        return dialogData
    }

    getSkillDialogData(type, item, options) {
        let dialogData = this.getDialogData(type, item, options)
        dialogData.assisters = this.constructAssisterList(item?.name || options.name)
        dialogData.hasRank = item ? item.xp.rank : false
        return dialogData
    }

    getWeaponDialogData(type, item, options) {
        let dialogData = this.getDialogData(type, item)
        dialogData.title = `${item?.name || options.name} Attack`
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.misc.value || 0) + (item.accuracy.value || 0)
        dialogData.hasRank = item.Skill ? item.Skill.rank : false
        return dialogData
    }

    getPowerDialogData(type, item, options) {
        let dialogData = this.getDialogData(type, item)
        if (item.damage.value.length)
            dialogData.title = `${item?.name || options.name} Attack`
        else
            dialogData.title = item?.name || options.name
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.SourceItem.attack || 0)
        dialogData.hasRank = false;
        return dialogData
    }



    constructAssisterList(itemName) {
        let assisters = game.actors.contents.filter(i => (i.hasPlayerOwner || i.data.token.disposition > 0) && i.id != this.id)
        assisters = assisters.filter(a => a.items.getName(itemName))
        assisters = assisters.map(a => {
            return {
                name: a.name,
                id: a.id,
                rank: a.items.getName(itemName).rank,
                die: `d${SkillCheck.rankToDie(a.items.getName(itemName))}`
            }
        })
        return assisters.filter(a => a.rank > 5)
    }


    /**
     * Get effects listed in the dialog
     * Effects are sourced from the rolling actor and targeted actor, if applicable
     * Effects from the rolling actor are filtered to remove "targeter" effects
     * Effects from the target are filtered to remove "self" effects
     */
    getDialogRollEffects() {
        let effects = this.effects.filter(i => i.hasRollEffect).map(i => i.toObject())
        let selfEffects = []
        let targetEffects = []

        // Remove "target" effects from self actor
        effects.forEach(e => {
            for (let i = 0; i < e.changes.length; i++) {
                if (e.changes[i].key.includes("targeter."))
                    delete e.changes[i]
            }
            e.changes = e.changes.filter(i => i)
        })

        // If the effect only had target effects, remove the effect entirely
        selfEffects = effects.filter(i => i.changes.length > 0)

        // Get target effects, removing "target" from the keys to get the proper path, and delete effects that don't refer to the targeter
        let target = Array.from(game.user.targets)[0]
        if (target) {
            targetEffects = target.actor.effects.filter(i => i.hasRollEffect).filter(i => i.data.changes.find(i => i.key.includes("targeter."))).map(i => i.toObject())
            targetEffects.forEach(e => {
                for (let i = 0; i < e.changes.length; i++) {
                    if (!e.changes[i].key.includes("targeter."))
                        delete e.changes[i]
                    else
                        e.changes[i].key = e.changes[i].key.replace("targeter.", "")
                }
                e.changes = e.changes.filter(i => i)
                e.label = `Target: ${e.label}`
            })
        }

        return targetEffects.concat(selfEffects).map(e => new PillarsActiveEffect(e))
    }

    //#endregion

    speakerData() {
        if (this.isToken) {
            return {
                token: this.token.id,
                scene: this.token.parent.id
            }
        }
        else {
            return {
                actor: this.id
            }
        }
    }


    targetSpeakerData() {
        if (game.user.targets.size > 0)
            return Array.from(game.user.targets).map(i => i.actor)[0].speakerData();
    }


    use(type, name) {
        let item = this.getItemTypes(type).find(i => i.name == name)
        if (item)
            return item.update({ "data.used.value": true })
        let worldItem = game.items.contents.find(i => i.type == type && i.name == name)
        if (worldItem) {
            worldItem = worldItem.toObject()
            worldItem.data.used.value = true;
            return this.createEmbeddedDocuments("Item", [worldItem])
        }

        // If no owned item and no world item, just make the item
        return this.createEmbeddedDocuments("Item", [{ name, type, sort: 0, data: { used: { value: true } } }])

    }


    hasCondition(condition) {
        return this.effects.find(i => i.conditionId == condition)
    }


    addCondition(condition) {


        let effect = duplicate(CONFIG.statusEffects.find(e => e.id == condition))
        if (!effect)
            return new Error("Condition key must exist in CONFIG.statusEffects")

        if (condition == "incapacitated")
            this.handleDefeatedStatus()

        if (condition == "dead" || condition == "incapacitated")
            setProperty(effect, "flags.core.overlay", true)

        setProperty(effect, "flags.core.statusId", effect.id)
        delete effect.id
        return this.createEmbeddedDocuments("ActiveEffect", [effect])
    }

    removeCondition(condition) {
        let effect = this.hasCondition(condition)
        if (condition == "incapacitated")
            this.handleDefeatedStatus()
        if (effect)
            return effect.delete()
    }

    handleDefeatedStatus() {
        if (game.combat) {
            let combatant
            if (this.isToken)
                combatant = game.combat.getCombatantByToken(this.token.id);
            else
                combatant = game.combat.combatants.find(c => c.data.actorId == this.id)

            if (combatant) return combatant.update({ defeated: (this.health.incap || this.endurance.incap) });
        }
    }

    async applyDamage(value, type, multiplier) {
        // value *= multiplier
        // let current  = this[type].value

        // if (value < 0)
        //     value += this.combat.soak

        // current += value

        // // if (type == "health" && value < 0 && Math.abs(value) >= this.health.threshold.severe)
        // //     await this.addWound("severe")
        // // else if (type == "health" && value < 0 && Math.abs(value) >= this.health.threshold.heavy)
        // //     await this.addWound("heavy")
        // // else if (type == "health" && value < 0 && Math.abs(value) >= this.health.threshold.light)
        // //     await this.addWound("light")

        // ui.notifications.notify(`${-value} Damage applied to ${this.name}'s ${type.slice(0, 1).toUpperCase() + type.slice(1)}`)

        // return this.update({[`data.${type}.value`] : current})
    }

    // addWound(type)
    // {
    //     return this.update({[`data.health.wounds.${type}`] : this.health.wounds[type] + 1 })
    // }


    //#region Getters
    // @@@@@@@@ CALCULATION GETTERS @@@@@@
    get woundModifier() {
        let woundModifier = 0
        woundModifier += this.health.wounds.light * (this.health.threshold.light / 2)
        woundModifier += this.health.wounds.heavy * (this.health.threshold.heavy / 2)
        woundModifier += this.health.wounds.severe * (this.health.threshold.severe / 2)
        return woundModifier
    }

    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

    // @@@@@@@ ITEM GETTERS @@@@@@@@@


    // @@@@@@@@ DATA GETTERS @@@@@@@@@@

    get attributes() { return this.data.data.attributes }
    get defenses() { return this.data.data.defenses }
    get endurance() { return this.data.data.endurance }
    get health() { return this.data.data.health }
    get life() { return this.data.data.life }
    get size() { return this.data.data.size }
    get tier() { return this.data.data.tier }
    get details() { return this.data.data.details }
    get knownConnections() { return this.data.data.knownConnections }
    get stride() { return this.data.data.stride }
    get run() { return this.data.data.run }
    get initiative() { return this.data.data.initiative }
    get seasons() { return this.data.data.seasons }
    get soak() { return this.data.data.soak }
    get toughness() { return this.data.data.toughness }


    get combat() { return this.data.data.combat }
    //#endregion
}