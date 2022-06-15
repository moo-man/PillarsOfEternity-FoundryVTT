import { getGame } from "../../pillars";

export default function () {
    Hooks.on("init", () => {

        let game = getGame()

        game.settings.register("pillars-of-eternity", "systemMigrationVersion", {
            name: "System Migration Version",
            scope: "world",
            config: false,
            type: String,
            default: "0"
        });
        
        game.settings.register("pillars-of-eternity", "playerApplyDamage", {
            name: "Players can apply damage",
            hint : "Allow players to apply damage to actors they don't have permission to update normally.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });

        game.settings.register("pillars-of-eternity", "season", {
            name: "Season",
            hint : "Current Year and Season",
            scope: "world",
            config: false,
            default: { season: 1, year: 2830}
        });

        game.settings.register("pillars-of-eternity", "seasonPosition", {
            name: "Season Position",
            hint : "",
            scope: "client",
            config: false,
            default: { left: 200, top: 1000}
        });
    })


}

