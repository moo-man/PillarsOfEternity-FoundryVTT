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

    prepareBaseData() {
        this.defenses.deflection.value = 10 - (this.size.value * 2)
        this.defenses.reflexes.value = 15 - (this.size.value * 2)
        this.defenses.fortitude.value = 15 + (this.size.value * 2)
        this.defenses.will.value = 15

        switch (this.size.value) {
            case -4:
                this.health.max = 4
                break;
            case -3:
                this.health.max = 8
                break;
            case -2:
                this.health.max = 16
                break;
            case -1:
                this.health.max = 32
                break;
            case 0:
                this.health.max = 36
                break;
            case 1:
                this.health.max = 40
                break;
            case 2:
                this.health.max = 75
                break;
            case 3:
                this.health.max = 125
                break;
            case 4:
                this.health.max = 250
                break;
            case 5:
                this.health.max = 500
                break;

        }
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
        let species = this.getItemTypes("species")[0]
        let culture = this.getItemTypes("culture")[0]
        if (species)
        {
            this.size.value = species.size.value
            this.stride.value = species.stride.value
            this.details.species  = species.species.value;
            this.details.stock = species.stock.value
        }
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



    //#region Convenience Helpers
    getItemTypes(type) {
        return (this.itemCategories || this.itemTypes)[type]
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