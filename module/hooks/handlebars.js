import {POE} from "../system/config.js"
export default function () {

    Hooks.on("init", () => {
        Handlebars.registerHelper("ifIsGM", function (options) {
            return game.user.isGM ? options.fn(this) : options.inverse(this)
        })


        Handlebars.registerHelper("isGM", function (options) {
            return game.user.isGM
        })


        Handlebars.registerHelper("config", function (key) {
            return POE[key]
        })
        
        Handlebars.registerHelper("configLookup", function (obj, key) {
            return POE[obj][key]
        })
        
        Handlebars.registerHelper("array", function (array, cls) {
            if (typeof cls == "string")
                return array.map(i => `<a class="${cls}">${i}</a>`).join(`<span class="array-comma">,</span>`)
            else
                return array.join(", ")
        })

        loadTemplates([
           "systems/pillars-of-eternity/templates/actor/actor-main.html",
           "systems/pillars-of-eternity/templates/actor/actor-combat.html",
           "systems/pillars-of-eternity/templates/actor/actor-effects.html",
           "systems/pillars-of-eternity/templates/actor/actor-powers.html",
           "systems/pillars-of-eternity/templates/actor/actor-inventory.html",
           "systems/pillars-of-eternity/templates/actor/actor-details.html",
           "systems/pillars-of-eternity/templates/item/item-effects.html",
           "systems/pillars-of-eternity/templates/item/item-description.html",
           "systems/pillars-of-eternity/templates/item/item-header.html",
           "systems/pillars-of-eternity/templates/actor/actor-npc-details.html",
            "systems/pillars-of-eternity/templates/partials/power-group.html"
        ])
    })
}
