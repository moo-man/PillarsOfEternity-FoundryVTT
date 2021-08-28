import RollDialog from "../apps/roll-dialog.js";
import SkillTest from "../system/skill-test.js";

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
        data.defenses.deflection.value = 10 - (data.size.value * 2)
        data.defenses.reflexes.value = 15 - (data.size.value * 2)
        data.defenses.fortitude.value = 15 + (data.size.value * 2)
        data.defenses.will.value = 15

        data.stride.value = speciesItem.stride.value
        data.details.species  = speciesItem.species.value;
        data.details.stock = speciesItem.stock.value

        data.health.threshold = game.pillars.config.woundThresholds[data.size.value]

        switch (this.size.value) {
            case -4:
                data.health.max = 4
                break;
            case -3:
                data.health.max = 8
                break;
            case -2:
                data.health.max = 16
                break;
            case -1:
                data.health.max = 32
                break;
            case 0:
                data.health.max = 36
                break;
            case 1:
                data.health.max = 40
                break;
            case 2:
                data.health.max = 75
                break;
            case 3:
                data.health.max = 125
                break;
            case 4:
                data.health.max = 250
                break;
            case 5:
                data.health.max = 500
                break;
        }

        return this.update({"data" : data})

    }

    setCultureData(cultureItem)
    {
        return this.update({"data.details.culture" : cultureItem.name})
    }

    prepareBaseData() {

       
    };

    prepareDerivedData() {

        this.health.bloodied = (this.health.max / 2) >= this.health.value
    }

    //#region Data Preparation
    prepareData() {
        try {
            super.prepareData();
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
        for (let i of this.items)
            i.prepareOwnedData()

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
            throw new Error("No skill assigned to the weapon")

        let data = this.getWeaponDialogData("weapon", weapon)
        let testData =  await RollDialog.create(data)
        testData.title = data.title
        testData.skillId = weapon.Skill.id
        testData.itemId = weapon.id
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

    getSkillDialogData(type, item)
    {
        let dialogData = {}
        dialogData.title = `${item.name} Test`
        dialogData.assisters = this.constructAssisterList(item)
        dialogData.modifier = 0
        dialogData.hasRank = item.xp.rank
        return dialogData
    }

    getWeaponDialogData(type, item)
    {
        let dialogData = {}
        dialogData.title = `${item.name} Test`
        //dialogData.assisters = this.constructAssisterList(weapon.Skill)
        dialogData.modifier = (item.misc.value || 0) + (item.accuracy.value || 0)
        dialogData.hasRank = item.Skill.rank
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

    //#region Getters
    // @@@@@@@@ CALCULATION GETTERS @@@@@@


    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

    // @@@@@@@ ITEM GETTERS @@@@@@@@@


    // @@@@@@@@ DATA GETTERS @@@@@@@@@@

    get attributes() { return this.data.data.attributes }
    get defenses() { return this.data.data.defenses }
    get endurance() { return this.data.data.endurance }
    get health() { return this.data.data.health }
    get size() { return this.data.data.size }
    get details() { return this.data.data.details}
    get knownConnections() { return this.data.data.knownConnections}
    get stride() { return this.data.data.stride}
    get initiative() { return this.data.data.initiative}
    get seasons() { return this.data.data.seasons}


    get combat() {return this.data.data.combat}
    //#endregion
}