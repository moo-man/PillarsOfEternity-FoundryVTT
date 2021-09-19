import RollDialog from "../apps/roll-dialog.js";
import SkillTest from "../system/skill-test.js";
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
                })

        let createData = foundry.utils.deepClone(this.data.data)

        this.setSizeData(createData)

        createData.health.value = createData.health.max
        createData.endurance.value = createData.endurance.max

        this.data.update({data : createData})

        // Default characters to HasVision = true and Link Data = true
        if (data.type == "character") {
            this.data.update({ "token.vision": true });
            this.data.update({ "token.actorLink": true });
        }
    }

    setSpeciesData(speciesItem) 
    {
        let data = this.toObject().data
        data.size.value = speciesItem.size.value
        this.setSizeData(data)

        data.stride.value = speciesItem.stride.value
        data.details.species  = speciesItem.species.value;
        data.details.stock = speciesItem.stock.value
        return this.update({"data" : data})
    }

    setSizeData(data)
    {
        let attributes = game.pillars.config.sizeAttributes[data.size.value]
        
        data.defenses.deflection.value = 10 - (data.size.value * 2)
        data.defenses.reflexes.value = 15 - (data.size.value * 2)
        data.defenses.fortitude.value = 15 + (data.size.value * 2)
        data.defenses.will.value = 15

        data.health.threshold = {light : attributes.light, heavy : attributes.heavy}
        data.health.max = attributes.maxHealthEndurance
        data.endurance.max = attributes.maxHealthEndurance
        data.health.bloodiedThreshold = data.health.max / 2

        data.endurance.windedThreshold = attributes.windedExert
        data.endurance.exert = attributes.windedExert
    }

    setCultureData(cultureItem)
    {
        return this.update({"data.details.culture" : cultureItem.name})
    }

    prepareBaseData() {

       
    };

    prepareDerivedData() {

        if (game.actors && game.actors.get(this.id))
        {
            this.data.update({"data.health.bloodied" :  this.health.bloodiedThreshold >= this.health.value})
            this.data.update({"data.endurance.winded" :  this.endurance.windedThreshold >= this.endurance.value})

            if (this.health.bloodied)
            {
                let existing = this.effects.find(e => e.getFlag("core", "statusId") == "bloodied")
                if (!existing)
                {
                    let effect = duplicate(CONFIG.statusEffects.find(e => e.id == "bloodied"))
                    effect.flags["core.statusId"] = effect.id
                    delete effect.id
                    this.createEmbeddedDocuments("ActiveEffect", [effect])
                }
            }
            else {
                let existing = this.effects.find(e => e.getFlag("core", "statusId") == "bloodied")
                if (existing)
                    this.deleteEmbeddedDocuments("ActiveEffect", [existing.id])
            }

            if (this.endurance.winded)
            {
                let existing = this.effects.find(e => e.getFlag("core", "statusId") == "winded")
                if (!existing)
                {
                    let effect = duplicate(CONFIG.statusEffects.find(e => e.id == "winded"))
                    effect.flags["core.statusId"] = effect.id
                    delete effect.id
                    this.createEmbeddedDocuments("ActiveEffect", [effect])
                }
            }
            else {
                let existing = this.effects.find(e => e.getFlag("core", "statusId") == "winded")
                if (existing)
                    this.deleteEmbeddedDocuments("ActiveEffect", [existing.id])
            }
        }

        let thresholds = game.pillars.config.agePointsDeathRank
        for(let pointThreshold in game.pillars.config.agePointsDeathRank)
        {
            if (parseInt(this.life.agingPoints) < parseInt(pointThreshold))
            {
                this.life.march = game.pillars.config.agePointsDeathRank[pointThreshold]
                break;
            }
        }
        this.life.march -= 1
    }

    //#region Data Preparation
    prepareData() {
        try {
            super.prepareData();
            super.prepareEmbeddedEntities();
            this.itemCategories = this.itemTypes
            this.prepareSpecies();
            this.prepareItems()
            this.prepareCombat()

        }
        catch (e) {
            console.error(e);
        }
    }

    prepareSpecies(){
        let culture = this.getItemTypes("culture")[0]
        if (culture)
            this.details.culture = culture.name
    }

    prepareItems() {
        let weight = 0;
        for (let i of this.items)
        {
            i.prepareOwnedData()
            if (i.weight)
                weight += i.weight.value
        }
        this.data.weight = weight
    }


    prepareCombat()
    {
        this.data.data.combat = {
            soak : 0
        }

        let equippedArmor = this.getItemTypes("armor").filter(i => i.equipped.value)[0]
        let equippedShield = this.getItemTypes("shield").filter(i => i.equipped.value)[0]

        if (equippedArmor)
        {
            this.combat.soak += equippedArmor.soak.value || 0
            this.initiative.value += equippedArmor.initiative.value
        }
        if (equippedShield)
            this.combat.soak += equippedShield.soak.value || 0        
    }

    //#endregion

    //#region Roll Setup

    async setupSkillTest(skill)
    {
        if (typeof skill == "string")
            skill = this.items.get(skill)

        let data = this.getSkillDialogData("skill", skill)
        let testData =  await RollDialog.create(data)
        testData.title = data.title
        testData.skillId = skill.id
        testData.speaker = this.speakerData();
        return testData
    }

    async setupWeaponTest(weapon)
    {
        if (typeof weapon == "string")
            weapon = this.items.get(weapon)

        if (!weapon.Skill)
            throw ui.notifications.error("No skill assigned to the weapon")

        let data = this.getWeaponDialogData("weapon", weapon)
        let testData =  await RollDialog.create(data)
        testData.title = data.title
        testData.skillId = weapon.Skill.id
        testData.itemId = weapon.id
        testData.speaker = this.speakerData();
        return testData
    }

    async setupPowerTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        if (!power.SourceItem)
            throw ui.notifications.error("Could not find Power Source")

        if (power.SourceItem.pool.current < power.cost.value)
            throw ui.notifications.error("Not enough power!")

        let data = this.getPowerDialogData("power", power)
        let testData =  await RollDialog.create(data)
        testData.title = data.title
        testData.sourceId = power.SourceItem.id
        testData.itemId = power.id
        testData.speaker = this.speakerData();
        return testData
    }

    async setupAgingRoll()
    {
        let dialogData = {modifier : game.pillars.config.lifePhaseModifier[this.life.phase] || 0, effects : this.getDialogRollEffects()} 
        let testData =  await AgingDialog.create(dialogData)
        testData.title = "Aging Roll"
        testData.speaker = this.speakerData();
        return testData
    }

    //#endregion

    //#Region Rolling 
    async rollSkillTest(testData)
    {

    }

    //#region Convenience Helpers
    getItemTypes(type) {
        return (this.itemCategories || this.itemTypes)[type]
    }

    getDialogData(type, item)
    {
        let dialogData = {}
        dialogData.title = `${item.name} Test`
        dialogData.modifier = ""
        dialogData.steps = 0
        dialogData.effects = this.getDialogRollEffects()
        return dialogData
    }

    getSkillDialogData(type, item)
    {
        let dialogData = this.getDialogData(type, item)
        dialogData.assisters = this.constructAssisterList(item)
        dialogData.hasRank = item.xp.rank
        return dialogData
    }

    getWeaponDialogData(type, item)
    {
        let dialogData = this.getDialogData(type, item)
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.misc.value || 0) + (item.accuracy.value || 0)
        dialogData.hasRank = item.Skill.rank
        return dialogData
    }

    getPowerDialogData(type, item)
    {
        let dialogData = this.getDialogData(type, item)
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.SourceItem.attack || 0)
        dialogData.hasRank = false;
        return dialogData
    }



    constructAssisterList(item)
    {
        let assisters = game.users.filter(i => i.active && !i.isGM).map(i => i.character)
        assisters = assisters.filter(a => a.items.getName(item.name))
        assisters = assisters.map(a => {
            return {
                name : a.name,
                id : a.id,
                rank : a.items.getName(item.name).rank,
                die : `d${SkillTest.rankToDie(a.items.getName(item.name))}`
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
            for(let i = 0; i < e.changes.length; i++)
            {
                if (e.changes[i].key.includes("targeter."))
                    delete e.changes[i]
            }
            e.changes = e.changes.filter(i => i)
        })

        // If the effect only had target effects, remove the effect entirely
        selfEffects = effects.filter(i => i.changes.length > 0)

        // Get target effects, removing "target" from the keys to get the proper path, and delete effects that don't refer to the targeter
        let target = Array.from(game.user.targets)[0]
        if (target)
        {
            targetEffects = target.actor.effects.filter(i => i.hasRollEffect).filter(i => i.data.changes.find(i => i.key.includes("targeter."))).map(i => i.toObject())
            targetEffects.forEach(e => {
                for(let i = 0; i < e.changes.length; i++)
                {
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

    speakerData() {
        if (this.isToken)
        {
            return {
                token : this.token.id,
                scene : this.token.parent.id
            }
        }
        else
        {
            return {
                actor : this.id
            }
        }
    }

    //#endregion

    async applyDamage(value, type, multiplier)
    {
        value *= multiplier
        let current  = this[type].value

        current += value

        current = Math.clamped(current, 0, this[type].max)

        if (type == "health", value < 0 && Math.abs(value) >= this.health.max)
            await this.addWound("severe")
        else if (type == "health", value < 0 && Math.abs(value) >= this.health.threshold.heavy)
            await this.addWound("heavy")
        else if (type == "health", value < 0 && Math.abs(value) >= this.health.threshold.light)
            await this.addWound("light")

        ui.notifications.notify(`${-value} Damage applied to ${this.name}'s ${type.slice(0, 1).toUpperCase() + type.slice(1)}`)
        
        return this.update({[`data.${type}.value`] : current})
    }
    
    addWound(type)
    {
        let wounds = foundry.utils.deepClone(this.health.wounds[type])
        for (let i = 0; i < wounds.length ; i++)
        {
            if (wounds[i] == 0 || wounds[i] == 2)
            {
                wounds[i] = 1
                break;
            }
        }
        return this.update({[`data.health.wounds.${type}`] : wounds})
    }
    //#region Getters
    // @@@@@@@@ CALCULATION GETTERS @@@@@@


    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

    // @@@@@@@ ITEM GETTERS @@@@@@@@@


    // @@@@@@@@ DATA GETTERS @@@@@@@@@@

    get attributes() { return this.data.data.attributes }
    get defenses() { return this.data.data.defenses }
    get endurance() { return this.data.data.endurance }
    get health() { return this.data.data.health }
    get life() { return this.data.data.life}
    get size() { return this.data.data.size }
    get details() { return this.data.data.details}
    get knownConnections() { return this.data.data.knownConnections}
    get stride() { return this.data.data.stride}
    get initiative() { return this.data.data.initiative}
    get seasons() { return this.data.data.seasons}


    get combat() {return this.data.data.combat}
    //#endregion
}