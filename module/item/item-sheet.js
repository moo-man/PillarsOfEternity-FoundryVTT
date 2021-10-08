import ItemSpecials from "../apps/item-specials.js";

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

    if (this.item.type == "power" && this.item.target.value)
    {
      data.targetSubTypes = `power${this.item.target.value[0].toUpperCase() + this.item.target.value.slice(1)}s`
    }

    if (this.item.type == "weapon" && this.item.isOwned)
    {
      data.martialSkills = this.item.actor.getItemTypes("skill").filter(i => i.category.value == "martial").concat(game.items.contents.filter(i => i.type == "skill" && i.category.value == "martial"))
    }

    return data;
  }
  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;


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

        let effectData = { label: this.item.name , icon: "icons/svg/aura.svg"}
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

    html.find(".remove-damage").click(ev => {
      let index = $(ev.currentTarget).parents(".damage-inputs").attr("data-index")
      let damage = foundry.utils.deepClone(this.item.damage.value)
      damage.splice(index, 1)
      return this.item.update({"data.damage.value" : damage})
    })
    
    html.find(".damage").change(ev => {
      let el = ev.currentTarget
      let index = $(el).parents(".damage-inputs").attr("data-index")
      let target = el.classList[1]
      let damage = foundry.utils.deepClone(this.item.damage.value)

      damage[index][target] = ev.currentTarget.value

      return this.item.update({"data.damage.value" : damage})

    })

  }
}
