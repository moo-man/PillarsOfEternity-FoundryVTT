import PILLARS_UTILITY  from "../system/utility.js"
/**
 * Extend the FVTT Item class for Pillars functionality
 * @extends {ItemSheet}
 */
export class PillarsItem extends Item {


    //#region Data Preparation 
    prepareData() {
        super.prepareData();

        if (this.isOwned)
            this.prepareOwnedData()
    }

    prepareOwnedData() 
    {
        if (this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`])
            this[`prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`]()
    }

    prepareWeapon() {
      
    }

    prepareSkill() {

    }

    prepareOwnedSkill() {
        this.xp.rank = PILLARS_UTILITY.getSkillRank(this.xp.value)
    }

    prepareOwnedPowerSource() {
        this.xp.level = PILLARS_UTILITY.getPowerSourceLevel(this.xp.value)
    }


    //#endregion

    //#region General Functions

    async postToChat()
    {
        let chatData = this.dropdownData();

        chatData.item = this;

        chatData.showGeneral = this.isWeapon

        let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/post-item.html", chatData)
        let cardData = PILLARS_UTILITY.chatDataSetup(html)
        cardData.flags = {
            "pillars-of-eternity" : {
                transfer : this.toObject()
            }
        }
        ChatMessage.create(cardData);
    }

    dropdownData() {
        return {text : this.description.value}//this[`_${this.type}DropdownData`]()
    }

    //#endregion

    //#region Getters
    // @@@@@@@@ CALCULATION GETTERS @@@@@@@
    get isMelee() {
        return this.category.value == "smallMelee" 
            || this.category.value == "mediumMelee" 
            || this.category.value == "largeMelee"
    }

    get isRanged() {
        return this.category.value == "mediumRanged" 
            || this.category.value == "largeRanged" 
            || this.category.value == "grenade"
    }

    get canEquip() {
        return (this.type == "equipment" && this.wearable.value) || this.type == "weapon" || this.type == "armor" || this.type == "shield"
    }

    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

    get Range() {return game.pillars.config.powerRanges[this.data.data.range.value]}

    get Target() {

        let targetSubTypes = game.pillars.config[`power${this.target.value[0].toUpperCase() + this.target.value.slice(1)}s`]
        let target = targetSubTypes[this.target.subtype]
        if (!target)
            target = game.pillars.config.powerTargetTypes[this.data.data.target.value]

        return target
    }
    get Duration() {return game.pillars.config.powerDurations[this.data.data.duration.value]}
    get Speed() {return game.pillars.config.powerSpeeds[this.data.data.speed.value]}
    get Exclusion() {return game.pillars.config.powerExclusions[this.data.data.exclusion.value]}

    // @@@@@@@@ DATA GETTERS @@@@@@@@@@
    get category() {return this.data.data.category}
    get target() {return this.data.data.target}
    get xp() {return this.data.data.xp}
    get used() {return this.data.data.used}
    get equipped() {return this.data.data.equipped}
    get wearable() {return this.data.data.wearable}
    get skill() {return this.data.data.skill}
    get weight() {return this.data.data.weight}
    get cost() {return this.data.data.cost}
    get quantity() {return this.data.data.quantity}
    get cost() {return this.data.data.cost}
    get range() {return this.data.data.range}
    get target() {return this.data.data.target}
    get duration() {return this.data.data.duration}
    get speed() {return this.data.data.speed}
    get exclusion() {return this.data.data.exclusion}
    get pool() {return this.data.data.pool}
    get description() {return this.data.data.description}

    //      Processed data getters

    //#endregion

}
