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
        this._setPowerSourcePercentage(sheetData)
    }   


    constructItemLists(sheetData) {
        let items = {}
        
        items.attributes = {benefits : [], hindrances: []}
        items.attributes.benefits = sheetData.actor.getItemTypes("attribute").filter(i => i.category.value == "benefit");
        items.attributes.hindrances = sheetData.actor.getItemTypes("attribute").filter(i => i.category.value == "hindrance");

        items.skills = sheetData.actor.getItemTypes("skill")
        items.traits = sheetData.actor.getItemTypes("trait")
        items.powers = sheetData.actor.getItemTypes("power")
        items.powerSources = sheetData.actor.getItemTypes("powerSource")

        items.backgrounds = sheetData.actor.getItemTypes("background")  
        items.settings = sheetData.actor.getItemTypes("setting")  
        items.connections = sheetData.actor.getItemTypes("connection")  
        items.reputations = sheetData.actor.getItemTypes("reputation")  

        items.inventory = this.constructInventory(sheetData)

        items.equipped = {}
        items.equipped.weapons = items.inventory.weapons.items.filter(i => i.equipped.value)
        items.equipped.armor = items.inventory.armor.items.filter(i => i.equipped.value)
        items.equipped.shields = items.inventory.shields.items.filter(i => i.equipped.value)
        return items
    }

    constructInventory(sheetData) {
        let inventory = {
            gear : {
                label: "Gear",
                type : "equipment",
                items : sheetData.actor.getItemTypes("equipment").filter(i => i.category.value == "gear")
            },
            tools : {
                label: "Tools",
                type : "equipment",
                items : sheetData.actor.getItemTypes("equipment").filter(i => i.category.value == "tool")
            },
            weapons : {
                label: "Weapons",
                type : "weapon",
                items : sheetData.actor.getItemTypes("weapon")
            },
            armor : {
                label: "Armor",
                type : "armor",
                items : sheetData.actor.getItemTypes("armor")
            },
            shields : {
                label: "Shields",
                type : "shield",
                items : sheetData.actor.getItemTypes("shield")
            },
        }
        return inventory
    }

    _setPowerSourcePercentage(sheetData)
    {
        let sources = sheetData.items.powerSources
        sources.forEach(s => {
            s.pool.pct = (s.pool.current / s.pool.max) * 100
        })
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

        $("input[type=number]").focusin(function () {
            $(this).select()
        });

        html.find(".item-edit").click(this._onItemEdit.bind(this))
        html.find(".item-delete").click(this._onItemDelete.bind(this))
        html.find(".item-create").click(this._onItemCreate.bind(this))
        html.find(".item-post").click(this._onPostItem.bind(this))
        html.find(".sheet-checkbox").click(this._onCheckboxClick.bind(this))
        html.find(".item-dropdown").mousedown(this._onDropdown.bind(this))
        html.find(".item-dropdown-alt").mousedown(this._onDropdownAlt.bind(this))


        html.find(".item-property").change(this._onEditItemProperty.bind(this))
    }

    // Handle custom drop events (currently just putting items into containers)
    _onDrop(event) {
            super._onDrop(event);
    }

    _onItemEdit(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        return this.actor.items.get(itemId).sheet.render(true)
    }
    _onItemDelete(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        return this.actor.deleteEmbeddedDocuments("Item", [itemId])
    }
    _onItemCreate(event) {
        let type = $(event.currentTarget).attr("data-type");
        let category = $(event.currentTarget).attr("data-category");
        let createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type}
        if (category)
            createData["data.category.value"] = category
        return this.actor.createEmbeddedDocuments("Item", [createData])
    }

    _onPostItem(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        return this.actor.items.get(itemId).postToChat()
    }
    
    _onCheckboxClick(event) {
        let target = $(event.currentTarget).attr("data-target")
        if (target == "item") {
            target = $(event.currentTarget).attr("data-item-target")
            let item = this.actor.items.get($(event.currentTarget).parents(".item").attr("data-item-id"))
            return item.update({ [`${target}`]: !getProperty(item.data, target) })
        }
        if (target)
            return this.actor.update({[`${target}`] : !getProperty(this.actor.data, target)});
    }

    _onEditItemProperty(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let target = $(event.currentTarget).attr("data-target")
        let value = event.target.value
        let item = this.actor.items.get(itemId)

        if (Number.isNumeric(value))
            value = parseInt(value)

        return item.update({[target] : value})
    }

    _onDropdown(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId)
        this._dropdown(event, item.dropdownData())
    }
    _onDropdownAlt(event) {
        if (event.button == 2)
        {
            let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
            let item = this.actor.items.get(itemId)
            this._dropdown(event, item.dropdownData())
        }
    }

    /* -------------------------------------------- */
}
