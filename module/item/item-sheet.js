
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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
      scrollY: [".sheet-body"]
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
                label: "DGNS.Post",
                class: "post",
                icon: "fas fa-comment",
                onclick: ev => this.item.postToChat()
            })
    }
    return buttons
}


  /** @override */
  getData() {
    const data = super.getData();
    data.data = data.item.data._source.data
    return data;
  }
  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;


    html.find(".item-quality-config").click(ev => {
      new ItemQualities(this.item).render(true)
    })

  }
}
