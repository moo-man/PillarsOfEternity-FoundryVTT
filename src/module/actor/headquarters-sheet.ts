
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsHeadquartersSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pillars-of-eternity", "sheet", "actor"],
            width: 810,
            height: 830,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }],
        });
    }

    get template() {
            return "systems/pillars-of-eternity/templates/actor/actor-headquarters-sheet.html"
    }


    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html)
        if (!this.isEditable) return

        

    }
}
