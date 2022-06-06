import { getGame } from "../../pillars";

export default function () {
    Hooks.on("init", () => {
        getGame().settings.register("pillars-of-eternity", "systemMigrationVersion", {
            name: "System Migration Version",
            scope: "world",
            config: false,
            type: String,
            default: "0"
        });
        
        getGame().settings.register("pillars-of-eternity", "playerApplyDamage", {
            name: "Players can apply damage",
            hint : "Allow players to apply damage to actors they don't have permission to update normally.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
    })


}

