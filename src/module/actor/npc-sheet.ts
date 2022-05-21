import PowerTemplate from "../system/power-template.js";
import { PillarsActorSheet } from "./actor-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PillarsNPCSheet extends PillarsActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pillars-of-eternity", "sheet", "actor"],
            template: "systems/pillars-of-eternity/templates/actor/actor-sheet.html",
            width: 810,
            height: 830,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }],
            scrollY: [".details", ".inventory-lists", ".items", ".powers" , ".general"]
        });
    }

    get template() {
            return "systems/pillars-of-eternity/templates/actor/actor-npc-sheet.html"
    }


    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html)


        if (!this.isEditable) return

        html.find(".defense-input").change((ev : JQuery.ChangeEvent) => {
            let defense = ev.currentTarget.dataset.defense
            let value = Number(ev.currentTarget.value)

            return this.actor.update({[`data.defenses.${defense}.base`] : value})
        })
    }
}
