import PowerTemplate from "../system/power-template.js";
import SkillCheck from "../system/skill-check.js";
import WeaponCheck from "../system/weapon-check.js";
import PowerCheck from "../system/power-check.js";
import AgingRoll from "../system/aging-roll.js";

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
            scrollY: [".details", ".inventory-lists", ".items", ".powers" , ".general"]
        });
    }


      /**
   * Overrides the default ActorSheet.render to add lity.
   * 
   * This adds scroll position saving support, as well as tooltips for the
   * custom buttons.
   * 
   * @param {bool} force      used upstream.
   * @param {Object} options  used upstream.
   */
  async _render(force = false, options = {}) {
    this._saveScrollPos(); // Save scroll positions
    await super._render(force, options);
    this._setScrollPos();  // Set scroll positions

    //this._refocus(this._element)
  }


  /**
   * Saves all the scroll positions in the sheet for setScrollPos() to use
   * 
   * All elements in the sheet that use ".save-scroll" class has their position saved to
   * this.scrollPos array, which is used when rendering (rendering a sheet resets all 
   * scroll positions by default).
   */
  _saveScrollPos() {
    if (this.form === null)
      return;

    const html = $(this.form).parent();
    this.scrollPos = [];
    let lists = $(html.find(".items"));
    for (let list of lists) {
      this.scrollPos.push($(list).scrollTop());
    }
  }

  /**
   * Sets all scroll positions to what was saved by saveScrollPos()
   * 
   * All elements in the sheet that use ".save-scroll" class has their position set to what was
   * saved by saveScrollPos before rendering. 
   */
  _setScrollPos() {
    if (this.scrollPos) {
      const html = $(this.form).parent();
      let lists = $(html.find(".items"));
      for (let i = 0; i < lists.length; i++) {
        $(lists[i]).scrollTop(this.scrollPos[i]);
      }
    }
  }



  /**
   * Override header buttons to add custom ones.
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Add "Post to chat" button
    // We previously restricted this to GM and editable items only. If you ever find this comment because it broke something: eh, sorry!
    buttons.unshift(
      {
        class: "seasons",
        label : "Seasons",
        icon: "fas fa-book",
        onclick: ev => {new game.pillars.apps.BookOfSeasons(this.actor).render(true)}
      })
    buttons.unshift({
        class: "configure",
        icon: "fas fa-wrench",
        onclick: async (ev) => new game.pillars.apps.ActorConfigure(this.actor).render(true)
    })
    return buttons
  }


    /** @override */
    getData() {
        const data = super.getData();
        data.data = data.data.data
        this.prepareSheetData(data);
        this.formatTooltips(data)
        return data
    }

    prepareSheetData(sheetData) {
        sheetData.items = this.constructItemLists(sheetData)
        sheetData.effects = this.constructEffectLists(sheetData) 
        this._setPowerSourcePercentage(sheetData)
        //this._createWoundsArrays(sheetData)
        this._enrichKnownConnections(sheetData)
        this._createDeathMarchArray(sheetData)
    }   

    formatTooltips(data)
    {
        data.tooltips = foundry.utils.deepClone(this.actor.data.flags.tooltips)
        for (let def in data.tooltips.defenses)
            data.tooltips.defenses[def] = data.tooltips.defenses[def].join(" + ").replaceAll("+ -", "- ")
        data.tooltips.health.max = data.tooltips.health.max.join(" + ").replaceAll("+ -", "- ")
        data.tooltips.endurance.max = data.tooltips.endurance.max.join(" + ").replaceAll("+ -", "- ")
        data.tooltips.initiative.value = data.tooltips.initiative.value.join(" + ").replaceAll("+ -", "- ")
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
        items.equipped.meleeWeapons = items.inventory.weapons.items.filter(i => i.equipped.value && i.isMelee)
        items.equipped.rangedWeapons = items.inventory.weapons.items.filter(i => i.equipped.value && i.isRanged)
        items.equipped.armor = items.inventory.armor.items.filter(i => i.equipped.value)
        items.equipped.shields = items.inventory.shields.items.filter(i => i.equipped.value)
        return items
    }

    constructInventory(sheetData) {
        let inventory = {
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
            gear : {
                label: "Gear",
                type : "equipment",
                items : sheetData.actor.getItemTypes("equipment").filter(i => i.category.value == "gear")
            }
        }
        return inventory
    }

    constructEffectLists(sheetData) 
    {
        let effects = {}

        effects.temporary = sheetData.actor.effects.filter(i => i.isTemporary && !i.data.disabled)
        effects.disabled = sheetData.actor.effects.filter(i => i.data.disabled)
        effects.passive = sheetData.actor.effects.filter(i => !i.isTemporary && !i.data.disabled)

        return effects;
    }

    _enrichKnownConnections(sheetData)
    {
        let connections = sheetData.actor.knownConnections.value
        sheetData.KnownConnections = connections.map(i => {
            let actor = game.actors.getName(i.name)
            return {
                name : i.name,
                img : actor ? actor.data.token.img : "",
                id : actor ? actor.id : ""
            }
        })
    }

    _createWoundsArrays(sheetData)
    {
        for (let woundType in sheetData.data.health.wounds)
        {
            if (woundType != "injury")
            {
                sheetData.data.health.wounds[woundType] = sheetData.data.health.wounds[woundType].map(i => {
                    switch(i)
                    {
                        case 0: return `<i class="far fa-square"></i>`
                        case 1: return `<i class="fas fa-skull"></i>`
                        case 2: return `<i class="fas fa-band-aid"></i>`
                    }
                })
            }
        }
    }
    _createDeathMarchArray(sheetData)
    {
        let marchVal = sheetData.data.life.march
        sheetData.data.life.march = []

        for(let i = 0; i < 7 ; i++)
        {
            if (i + 1 <= marchVal)
                sheetData.data.life.march.push(`<i class="far fa-check-square"></i>`)
            else 
                sheetData.data.life.march.push(`<i class="far fa-square"></i>`)
        }

        if (marchVal != 7)
            sheetData.data.life.march[6] = `<i style="opacity:0.2" class="fas fa-skull"></i>`
        else
            sheetData.data.life.march[6] = `<i class="fas fa-skull"></i>`

    }

    _setPowerSourcePercentage(sheetData)
    {
        let sources = sheetData.items.powerSources
        sources.forEach(s => {
            s.pool.pct = Math.clamped((s.pool.current / s.pool.max) * 100, 0, 100)
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
                dropdownHTML = `<div class="item-summary">${TextEditor.enrichHTML(dropdownData.text)}`;
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

    
    _getSubmitData(updateData = {}) {
        this.actor.overrides = {}
        let data = super._getSubmitData(updateData);
        data = diffObject(flattenObject(this.actor.toObject(false)), data)
        return data
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
        html.find(".effect-create").click(this._onEffectCreate.bind(this));  
        html.find(".effect-edit").click(this._onEffectEdit.bind(this));  
        html.find(".effect-delete").click(this._onEffectDelete.bind(this));  
        html.find(".effect-toggle").click(this._onEffectToggle.bind(this));  
        html.find(".sheet-checkbox").click(this._onCheckboxClick.bind(this))
        html.find(".open-info").click(this._onInfoClick.bind(this))
        //html.find(".wound-square").click(this._onWoundClick.bind(this))
        html.find(".add-wound").click(this._onWoundClick.bind(this))
        html.find(".subtract-wound").click(this._onWoundClick.bind(this))
        html.find(".item-dropdown h4").mousedown(this._onDropdown.bind(this))
        html.find(".item-dropdown-alt h4").mousedown(this._onDropdownAlt.bind(this))
        html.find(".item-special").mousedown(this._onSpecialClicked.bind(this))
        html.find(".item-property").change(this._onEditItemProperty.bind(this))
        html.find(".skill-roll").click(this._onSkillRoll.bind(this))
        html.find(".roll-untrained").click(this._onUntrainedSkillClick.bind(this))
        html.find(".weapon-roll").click(this._onWeaponRoll.bind(this))
        html.find(".power-roll").click(this._onPowerRoll.bind(this))
        html.find(".property-counter").mousedown(this._onCounterClick.bind(this))
        html.find(".create-connection").click(this._onCreateConnection.bind(this))
        html.find(".edit-connection").click(this._onEditConnection.bind(this))
        html.find(".delete-connection").click(this._onDeleteConnection.bind(this))
        html.find(".connection-name").click(this._onConnectionClick.bind(this))
        html.find(".power-target").click(this._onPowerTargetClick.bind(this))
        html.find(".restore-pool").click(this._onRestorePoolClick.bind(this))
        html.find(".sheet-roll").click(this._onSheetRollClick.bind(this))
        html.find(".damage-roll").click(this._onDamageRollClick.bind(this))
        html.find(".roll-item-skill").click(this._onItemSkillClick.bind(this))
        html.find(".age-roll").click(this._onAgeRoll.bind(this))
        html.find(".roll-initiative").click(this._onInitiativeClick.bind(this))
        html.find(".setting").click(this._onSettingClick.bind(this))
        html.find('.item:not(".tab-select")').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", this._onDragStart.bind(this), false);
        });
    }

    _onDrop(event) {
            try {
            let dragData = JSON.parse(event.dataTransfer.getData("text/plain"))
            if (dragData.type == "item")
                this.actor.createEmbeddedDocuments("Item", [dragData.payload])
            else 
                super._onDrop(event);
            }
            catch(e) 
            {
                super._onDrop(event);
            }
    }

    _onItemEdit(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        return this.actor.items.get(itemId).sheet.render(true)
    }
    _onItemDelete(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        new Dialog({
            title : "Delete Item",
            content : `<p>Are you sure you want to delete this item?`,
            buttons : {
                yes : {
                    label : "Yes",
                    callback : () => {this.actor.deleteEmbeddedDocuments("Item", [itemId]) }
                },
                no : {
                    label : "No",
                    callback : () => {}
                }
            },
            default: "yes"
        }).render(true)
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
    
    async _onEffectCreate(ev) {
        let type = ev.currentTarget.attributes["data-type"].value
        let effectData = { label: "New Effect" , icon: "icons/svg/aura.svg"}
        if (type == "temporary") {
            effectData["duration.rounds"] = 1;
          }

        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/quick-effect.html")
        let dialog = new Dialog({
            title : "Quick Effect",
            content : html,
            buttons : {
                "create" : {
                    label : "Create",
                    callback : html => {
                        let mode = 2
                        let label = html.find(".label").val()
                        let key = html.find(".key").val()
                        let value = parseInt(html.find(".modifier").val())
                        effectData.label = label
                        effectData.changes = [{key, mode, value}]
                        this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
                    }
                },
                "skip" : {
                    label : "Skip",
                    callback : () => this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
                }
            }
        })
        await dialog._render(true)
        dialog._element.find(".label").select()

 
      }

    _onEffectEdit(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        this.object.effects.get(id).sheet.render(true)
    }

    _onEffectDelete(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        this.object.deleteEmbeddedDocuments("ActiveEffect", [id])
    }

    _onEffectToggle(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        let effect = this.object.effects.get(id)

        effect.update({"disabled" : !effect.data.disabled})
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

    _onInfoClick(event) {
        let type = $(event.currentTarget).attr("data-type")
        let item = this.actor.getItemTypes(type)[0]
        if (!item)
            return ui.notifications.error(`No owned item of type ${type}`)
       item.sheet.render(true)
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

    _onCounterClick(event) {
        let multiplier = event.button == 0 ? 1 : -1;
        multiplier = event.ctrlKey ? multiplier * 10 : multiplier


        let target = $(event.currentTarget).attr("data-target")
        if (target == "item") {
            target = $(event.currentTarget).attr("data-item-target")
            let item = this.actor.items.get($(event.currentTarget).parents(".item").attr("data-item-id"))
            return item.update({ [`${target}`]: getProperty(item.data, target) + multiplier })
        }
        if (target)
            return this.actor.update({[`${target}`] : getProperty(this.actor.data, target) + multiplier});
    }

    _onSpecialClicked(event) {
        let text = event.target.text.split("(")[0].trim()
        for (let special in game.pillars.utility.weaponSpecials())
        {
            if (game.pillars.utility.weaponSpecials()[special].label == text)
                return this._dropdown(event, {text : game.pillars.utility.weaponSpecials()[special].description})
        }
        
    }

    _onCreateConnection(event) {
        let connections = duplicate(this.actor.knownConnections.value);
        connections.push({name : "New Connection"})
        this.actor.update({"data.knownConnections.value" : connections})
    }

    _onEditConnection(event) {
        let index = $(event.currentTarget).parents(".item").attr("data-index")
        let connections = duplicate(this.actor.knownConnections.value);
        new Dialog({
            title : "Change Connection",
            content : `
            <p>Enter the name of the connection</p>
            <div class="form-group">
            <input type="text" name="connection" value=${connections[index].name}>
            </div>
            `,
            buttons : {
                submit : {
                    label : "Submit",
                    callback : (dlg) => {
                        let newName = dlg.find("[name='connection']")[0].value
                        connections[index].name = newName;
                        this.actor.update({"data.knownConnections.value" : connections})
                    }
                },
            },
            default: "submit"
        }).render(true)

    }

    _onDeleteConnection(event) {
        let index = parseInt($(event.currentTarget).parents(".item").attr("data-index"))
        let connections = duplicate(this.actor.knownConnections.value);
        connections.splice(index, 1);
        this.actor.update({"data.knownConnections.value" : connections})
    }
    
    _onConnectionClick(event) {
        let id = $(event.currentTarget).parents(".item").attr("data-actor-id")
        if (id)
            game.actors.get(id).sheet.render(true)
    }

    _onPowerTargetClick(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId)
        PowerTemplate.fromItem(item).drawPreview()
    }

    _onRestorePoolClick(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId)
        return item.update({"data.pool.current" : item.pool.max})
    }



    _onWoundClick(event) {
        let multiplier = event.currentTarget.classList.contains("add-wound") ? 1 : -1
        let type = event.currentTarget.dataset["type"]
        return this.actor.update({[`data.health.wounds.${type}`] : this.actor.health.wounds[type] + 1 * multiplier })
    }

    /* -------------------------------------------- */


    _onSheetRollClick(event) {
        new Roll(event.target.text).roll().toMessage({speaker : this.actor.speakerData()})
    }

    _onDamageRollClick(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId)
        new game.pillars.apps.DamageDialog(item, undefined, Array.from(game.user.targets)).render(true)
    }


    _onInitiativeClick(event) {

        new Dialog({
            title : "Roll Initiative",
            content : "",
            buttons : {
                adv : {
                    label : "Advantaged",
                    callback : () => {this.actor.rollInitiative({createCombatants: true, rerollInitiative : true, initiativeOptions : {formula : "{2d10, 1d20}kh[Initiative] + (1d12[Tiebreaker] / 100) + @initiative.value"}})}
                },
                normal : {
                    label : "Normal",
                    callback : () => {this.actor.rollInitiative({createCombatants: true, rerollInitiative : true});}
                },
                dis : {
                    label : "Disadvantaged",
                    callback : () => {this.actor.rollInitiative({createCombatants: true, rerollInitiative : true, initiativeOptions : {formula : "{2d10, 1d20}kl[Initiative] + (1d12[Tiebreaker] / 100) + @initiative.value"}})}
                }
            },
            default : "normal"
        }).render(true)

      }

      _onSettingClick(ev) 
      {
        let itemId = $(event.currentTarget).attr("data-item-id")
        let item = this.actor.items.get(itemId)
        if (item)
            item.sheet.render(true)
      }
    

    async _onSkillRoll(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let checkData = await this.actor.setupSkillCheck(this.actor.items.get(itemId))
        let check = new SkillCheck(checkData)
        await check.rollCheck();
        check.sendToChat()
    }

    async _onUntrainedSkillClick(event) {
        let allSkills = game.items.contents.filter(i => i.type == "skill").sort((a, b) => a.name > b.name ? 1 : -1)
        let selectElement = `<select name="skill">`
        for(let s of allSkills)
            selectElement += `<option name=${s.name}>${s.name}</option>`
        selectElement += "</select>"

        let dialog = new Dialog({
            title : "Untrained Skill",
            //content : `<div style="display:flex; align-items: center"><label style="flex: 1">Name of Skill</label><input style="flex: 1" type='text' name='skill'/></div>`,
            content : `<div style="display:flex; align-items: center"><label style="flex: 1">Skill</label>${selectElement}</div>`,
            buttons : {
                roll : {
                    label : "Roll",
                    callback : async dlg => {
                        let skill = dlg.find("[name='skill']")[0].value
                        if (skill)
                        {
                            let checkData = await this.actor.setupSkillCheck(skill)
                            let check = new SkillCheck(checkData)
                            await check.rollCheck();
                            check.sendToChat()
                        }
                        else
                            ui.notifications.error("Please enter a skill name")
                    }
                }
            },
            default: "roll"
        })
        await dialog._render(true)
        dialog.element.find("input")[0].focus()


    }

    async _onWeaponRoll(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let checkData = await this.actor.setupWeaponCheck(itemId)
        let check = new WeaponCheck(checkData)
        await check.rollCheck();
        check.sendToChat()
    }

    async _onPowerRoll(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let checkData = await this.actor.setupPowerCheck(itemId)
        let check = new PowerCheck(checkData)
        await check.rollCheck();
        check.sendToChat()
    }

    async _onItemSkillClick(event) {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id")
        let item = this.actor.items.get(itemId);
        let skill = this.actor.items.getName(item.skill.value)
        if (!skill)
            return ui.notifications.warn(`Could not find skill ${item.skill.value}`)
        let checkData = await this.actor.setupSkillCheck(skill)
        let check = new SkillCheck(checkData)
        await check.rollCheck()
        check.sendToChat()
    }

    async _onAgeRoll(event) {
        let checkData = await this.actor.setupAgingRoll()
        let check = new AgingRoll(checkData)
        await check.rollCheck();
        check.sendToChat()
    }
}
