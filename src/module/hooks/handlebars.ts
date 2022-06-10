import { getGame } from "../../pillars"
import { PILLARS } from "../system/config"

export default function () {

    Hooks.on("init", () => {
        // Dunno how to do this, not really needed
        // Handlebars.registerHelper("ifIsGM", function (options : any) {
        //     return getGame().user!.isGM ? options(this) : options.inverse(this)
        // })


        Handlebars.registerHelper("isGM", function (options) {
            return getGame().user!.isGM
        })


        Handlebars.registerHelper("config", function (key : string) {
            return PILLARS[key as keyof typeof PILLARS]
        })

        Handlebars.registerHelper("configLookup", function (obj, key) {
            return getProperty(PILLARS[obj as keyof typeof PILLARS], key)
        })

        Handlebars.registerHelper("array", function (array: string[], cls: string) {
            if (typeof cls == "string")
                return array.map(i => `<a class="${cls}">${i}</a>`).join(`<span class="array-comma">,</span>`)
            else
                return array.join(", ")
        })

        loadTemplates([
            "systems/pillars-of-eternity/templates/actor/actor-main.html",
            "systems/pillars-of-eternity/templates/actor/actor-npc-main.html",
            "systems/pillars-of-eternity/templates/actor/actor-combat.html",
            "systems/pillars-of-eternity/templates/actor/actor-effects.html",
            "systems/pillars-of-eternity/templates/actor/actor-powers.html",
            "systems/pillars-of-eternity/templates/actor/actor-inventory.html",
            "systems/pillars-of-eternity/templates/actor/actor-details.html",
            "systems/pillars-of-eternity/templates/actor/actor-npc-details.html",
            "systems/pillars-of-eternity/templates/actor/actor-npc-powers.html",
            "systems/pillars-of-eternity/templates/item/item-effects.html",
            "systems/pillars-of-eternity/templates/item/item-powers.html",
            "systems/pillars-of-eternity/templates/item/item-description.html",
            "systems/pillars-of-eternity/templates/item/item-header.html",
            "systems/pillars-of-eternity/templates/partials/power-group.html",
            "systems/pillars-of-eternity/templates/chat/check-buttons.html"
        ])
    })
}
