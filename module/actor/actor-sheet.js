/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pillars-of-eternity", "sheet", "actor"],
            template: "systems/pillars-of-eternity/templates/actor/actor-sheet.html",
            width: 1200,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }],
            scrollY: []
        });
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.data = data.data.data

        this.prepareSheetData(data);
        return data;
    }

    prepareSheetData(sheetData) {
        sheetData.items = this.constructItemLists(sheetData)
    }


    constructItemLists(sheetData) {
        let items = {}
        
        items.attributes = {benefits : [], hindrances: []}
        items.attributes.benefits = sheetData.actor.getItemTypes("attribute").filter(i => i.category.value == "benefit");
        items.attributes.hindrances = sheetData.actor.getItemTypes("attribute").filter(i => i.category.value == "hindrance");

        items.skills = sheetData.actor.getItemTypes("skill")
        items.traits = sheetData.actor.getItemTypes("trait")
        return items
    }

    constructInventory() {
       
    }

     _dropdown(event, dropdownData) {
        let dropdownHTML = ""
        event.preventDefault()
        let li = $(event.currentTarget).parents(".item")
        // Toggle expansion for an item
        if (li.hasClass("expanded")) // If expansion already shown - remove
        {
            let summary = li.children(".item-summary");
            summary.slideUp(200, () => summary.remove());
        } else {
            // Add a div with the item summary belowe the item
            let div
            if (!dropdownData) {
                return
            } else {
                dropdownHTML = `<div class="item-summary">${dropdownData.text}`;
            }
            if (dropdownData.tags) {
                let tags = `<div class='tags'>`
                dropdownData.tags.forEach(tag => {
                    tags = tags.concat(`<span class='tag'>${tag}</span>`)
                })
                dropdownHTML = dropdownHTML.concat(tags)
            }
            dropdownHTML += "</div>"
            div = $(dropdownHTML)
            li.append(div.hide());
            div.slideDown(200);
        }
        li.toggleClass("expanded");
    }

    /* -------------------------------------------- */
    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        $("input[type=text]").focusin(function () {
            $(this).select();
        });
    }

    // Handle custom drop events (currently just putting items into containers)
    _onDrop(event) {
            super._onDrop(event);
    }

    _onItemEdit(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        this.actor.items.get(itemId).sheet.render(true)
    }
    _onItemDelete(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        this.actor.deleteEmbeddedDocuments("Item", [itemId])
    }
    _onItemCreate(event) {
        let type = $(event.currentTarget).attr("data-item");
        this.actor.createEmbeddedDocuments("Item", [{ name: `New ${type.capitalize()}`, type: type }])
    }

    _onPostItem(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        this.actor.items.get(itemId).postToChat()
    }
    
    _onCheckboxClick(event) {
        let target = $(event.currentTarget).attr("data-target")
        if (target == "item") {
            target = $(event.currentTarget).attr("data-item-target")
            let item = this.actor.items.get($(event.currentTarget).parents(".item").attr("data-item-id"))
            item.update({ [`${target}`]: !getProperty(item.data, target) })
            return;
        }
        if (target)
            this.actor.update({[`${target}`] : !getProperty(this.actor.data, target)});
    }
    _onDropdown(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId)
        this._dropdown(event, item.dropdownData())
    }
    async _onSkillClick(event) {
        let skill = $(event.currentTarget).parents(".skill").attr("data-target")
        let skipDialog = event.ctrlKey
        let { rollResults, cardData } = await this.actor.rollSkill(skill, {skipDialog})
        PillarsChat.renderRollCard(rollResults, cardData)
    }
    async _onWeaponClick(event) {
        let weaponId = $(event.currentTarget).parents(".weapon").attr("data-item-id")
        let skipDialog = event.ctrlKey
        let use = $(event.currentTarget).attr("data-use");
        let weapon = this.actor.items.get(weaponId)
        let { rollResults, cardData } = await this.actor.rollWeapon(weapon, { use, skipDialog })
        PillarsChat.renderRollCard(rollResults, cardData)
    }

    /* -------------------------------------------- */
}
