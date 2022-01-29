import ItemSpecials from "../apps/item-specials.js";
import { PillarsItem } from "./item-pillars.js";

/**
 * Extend the basic ItemSheet with for Pillars
 * @extends {ItemSheet}
 */
export class PillarsItemSheet extends ItemSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["pillars-of-eternity", "sheet", "item"],
			width: 550,
			height: 534,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".content", initial: "details"}],
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
        scrollY: [".content"]
		});
  }

  get template() {
    return `systems/pillars-of-eternity/templates/item/item-${this.item.type}-sheet.html`
  }

 
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if (this.item.isOwner) {
        buttons.unshift(
            {
                label: "Post",
                class: "post",
                icon: "fas fa-comment",
                onclick: this.item.postToChat
            })
    }
    return buttons
}


  /** @override */
  getData() {
    const data = super.getData();
    data.data = data.item.data._source.data

    if (this.item.type == "power" && this.item.target.length)
    {
      this.item.target.forEach(target => target.subchoices = game.pillars.config[`power${target.value[0].toUpperCase() + target.value.slice(1)}s`])
      data.powerEffects = {conditions : foundry.utils.deepClone(CONFIG.statusEffects)}
      if (this.item.effects.size)
        data.powerEffects.item = Array.from(this.item.effects)
    }

    if (this.item.type == "weapon")
    {
      data.martialSkills = game.items.contents.filter(i => i.type == "skill" && i.category.value == "martial")
      if (this.item.isOwned)
        data.martialSkills = data.martialSkills.concat(this.item.actor.getItemTypes("skill").filter(i => i.category.value == "martial"));
    }

    if (game.pillars.config.allowEmbeddedPowers.includes(this.type))
      data.allowEmbeddedPowers = true;
    return data;
  }

  _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropItem = game.items.get(dragData.id)
    let powerData = dropItem.toObject()

    if (dropItem && dropItem.type === "power" && game.pillars.config.allowEmbeddedPowers.includes(this.item.type))
    {
      if (this.item.type == "equipment" && this.item.category.value == "grimoire" && dropItem.source.value != "arcana")
        return ui.notifications.error("Only Arcana Powers can be placed inside Grimoires")
      if (this.item.type == "equipment" && this.item.category.value == "grimoire")
        powerData.data.embedded.spendType = "source"
      
      let powers = duplicate(this.item.powers);
      powers.push(powerData);
      this.item.update({"data.powers" : powers})

      if (this.item.isOwned)
      {

      }
    }
  }

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;

    $("input[type=text]").focusin(function () {
      $(this).select();
  });

    $("input[type=number]").focusin(function () {
        $(this).select()
    });



    html.find(".item-specials").click(ev => {
      new ItemSpecials(this.item).render(true)
    })


    html.find(".csv-input").change(ev => {
      let target = $(ev.currentTarget).attr("data-target")
      let text = ev.target.value;
      let array = text.split(",").map(i => i.trim())

      return this.item.update({[target] : array})

    })

    html.find(".add-power-effect").change(ev => {
      
      let text = ev.target.value;
      let array = text.split(",").map(i => i.trim())

      return this.item.update({[target] : array})

    })

    html.find(".effect-create").click(async ev => {
        if (this.item.isOwned)
          return ui.notifications.error("Creating effects on Owned Items is not currently supported by Foundry. You must create the effect on a World Item and then add that Item to the actor.")

        let effectData = { label: this.item.name , icon: this.item.data.img || "icons/svg/aura.svg"}
        let html = await renderTemplate("systems/pillars-of-eternity/templates/apps/quick-effect.html", effectData)
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
                        this.item.createEmbeddedDocuments("ActiveEffect", [effectData])
                    }
                },
                "skip" : {
                    label : "Skip",
                    callback : () => this.item.createEmbeddedDocuments("ActiveEffect", [effectData])
                }
            }
        })
        await dialog._render(true)
        dialog._element.find(".label").select()
    })
    
    html.find(".effect-delete").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
      return this.item.deleteEmbeddedDocuments("ActiveEffect", [id])
    })

    html.find(".effect-edit").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
      this.item.effects.get(id).sheet.render(true)
    })

    html.find(".add-damage").click(ev => {
      let damage = foundry.utils.deepClone(this.item.damage.value)
      damage.push({
        label : "",
        base : "",
        crit : "",
        defense : "Deflection",
        type : "Physical"
      })
      return this.item.update({"data.damage.value" : damage})
    })

    html.find(".add-property").click(ev => {
      let property = $(ev.currentTarget).parents(".form-group").attr("data-property")
      let data = foundry.utils.deepClone(getProperty(this.item, property))
      data.push(PillarsItem.baseData[property])
      return this.item.update({[`data.${property}`] : data})
    })

    html.find(".remove-property").click(ev => {
      let property = $(ev.currentTarget).parents(".form-group").attr("data-property")
      let index = $(ev.currentTarget).parents(".property-inputs").attr("data-index")
      let data = foundry.utils.deepClone(getProperty(this.item, property))
      data.splice(index, 1)
      return this.item.update({[`data.${property}`] : data})
    })
    
    // html.find(".add-damage").click(ev => {
    //   let damage = foundry.utils.deepClone(this.item.damage.value)
    //   damage.push({
    //     label : "",
    //     base : "",
    //     crit : "",
    //     defense : "Deflection",
    //     type : "Physical"
    //   })
    //   return this.item.update({"data.damage.value" : damage})
    // })

    // html.find(".remove-damage").click(ev => {
    //   let index = $(ev.currentTarget).parents(".property-inputs").attr("data-index")
    //   let damage = foundry.utils.deepClone(this.item.damage.value)
    //   damage.splice(index, 1)
    //   return this.item.update({"data.damage.value" : damage})
    // })
    
    html.find(".power-property").change(ev => {
      let el = ev.currentTarget
      let property = $(el).parents(".form-group").attr("data-property")
      let index = $(el).parents(".property-inputs").attr("data-index")
      let data = foundry.utils.deepClone(getProperty(this.item, property))
      let target = $(ev.currentTarget).attr("data-path")

      let value = ev.currentTarget.value
      if (Number.isNumeric(value))
        value = parseInt(value)

      data[index][target] = value || ""

      return this.item.update({[`data.${property}`] : data})

    })

    html.find(".power-edit").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let power = this.item.powers[index]
      if (power.ownedId)
        this.actor.items.get(power.ownedId).sheet.render(true)
      else 
        new PillarsItemSheet(new PillarsItem(power, {embedded: { object : this.item,  index} })).render(true, {editable : false})
    })

    html.find(".power-delete").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let powers = duplicate(this.item.powers)
      powers.splice(index, 1)
      return this.item.update({"data.powers" : powers})
    })

    html.find(".embedded-power-edit").change(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let path = ev.currentTarget.dataset.path;
      let powers = duplicate(this.item.powers);

      
      setProperty(powers[index].data, path, ev.currentTarget.value);
      if (path == "embedded.uses.max")
        setProperty(powers[index].data, "embedded.uses.value", ev.currentTarget.value )

      // Update owned power if it exists
      if (powers[index].ownedId)
      {
        let ownedItem = this.actor.items.get(powers[index].ownedId)
        if (ownedItem) 
          ownedItem.update(powers[index])
      }

      return this.item.update({"data.powers" : powers})
    })
  }
}
