import { getGame } from "../system/utility"
import { PILLARS } from "../system/config"

export default function () {

    Hooks.on("init", () => {
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

        Handlebars.registerHelper("pct", function(part :number , whole: number) {
            return (part / whole) * 100
        })

        Handlebars.registerHelper("enrich", function (string : string) {
            return TextEditor.enrichHTML(string)
        })

        Handlebars.registerHelper("tokenImg", function(actor) {
            try {
                return actor.token ? actor.token.texture.src : actor.prototypeToken.texture.src
            }
            catch(e) {}
        })

        Handlebars.registerHelper("tokenName", function(actor) {
            try {
                return actor.token ? actor.token.name : actor.prototypeToken.name;
            }
            catch(e) {}
        })
        

        loadTemplates([
            "systems/pillars-of-eternity/templates/actor/character/character-main.hbs",
            "systems/pillars-of-eternity/templates/actor/npc/actor-npc-main.hbs",
            "systems/pillars-of-eternity/templates/actor/character/actor-combat.hbs",
            "systems/pillars-of-eternity/templates/actor/shared/actor-effects.hbs",
            "systems/pillars-of-eternity/templates/actor/character/actor-powers.hbs",
            "systems/pillars-of-eternity/templates/actor/shared/actor-inventory.hbs",
            "systems/pillars-of-eternity/templates/actor/character/actor-details.hbs",
            "systems/pillars-of-eternity/templates/actor/npc/actor-npc-details.hbs",
            "systems/pillars-of-eternity/templates/actor/npc/actor-npc-powers.hbs",
            "systems/pillars-of-eternity/templates/actor/headquarters/actor-residents.hbs",
            "systems/pillars-of-eternity/templates/actor/headquarters/actor-library.hbs",
            "systems/pillars-of-eternity/templates/actor/headquarters/actor-accommodations.hbs",
            "systems/pillars-of-eternity/templates/actor/headquarters/actor-defenses.hbs",
            "systems/pillars-of-eternity/templates/item/item-effects.hbs",
            "systems/pillars-of-eternity/templates/item/item-powers.hbs",
            "systems/pillars-of-eternity/templates/item/item-description.hbs",
            "systems/pillars-of-eternity/templates/item/item-header.hbs",
            "systems/pillars-of-eternity/templates/partials/power-group.hbs",
            "systems/pillars-of-eternity/templates/chat/check-buttons.hbs"
        ])
    })
}
