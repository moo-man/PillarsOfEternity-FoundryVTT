import { POE_UTILITY } from "../system/utility.js"
/**
 * Extend the FVTT Item class for Pillars functionality
 * @extends {ItemSheet}
 */
export class PillarsItem extends Item {


    //#region Data Preparation 
    prepareData() {
        super.prepareData();
    }

    prepareOwnedData() 
    {

    }

    prepareWeapon() {
      
    }


    //#endregion

    //#region General Functions

    async postToChat()
    {
        let chatData = this.dropdownData();

        chatData.item = this;

        chatData.showGeneral = this.isWeapon

        let html = await renderTemplate("systems/pillars-of-eternity/templates/chat/post-item.html", chatData)
        let cardData = POE_UTILITY.chatDataSetup(html)
        cardData.flags = {
            "pillars-of-eternity" : {
                transfer : this.toObject()
            }
        }
        ChatMessage.create(cardData);
    }

    dropdownData() {
        return this[`_${this.type}DropdownData`]()
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

    // @@@@@@@@ FORMATTED GETTERS @@@@@@@@

  

    // @@@@@@@@ DATA GETTERS @@@@@@@@@@
    get category() {return this.data.data.category}
    get target() {return this.data.data.target}
    //      Processed data getters

    //#endregion

}
