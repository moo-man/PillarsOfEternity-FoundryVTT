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
            name: "PILLARS.SettingAllowPlayersApplyDamage",
            hint: "PILLARS.SettingHintAllowPlayersApplyDamage",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });

        game.settings.register("pillars-of-eternity", "season", {
            name: "PILLARS.SettingSeason",
            hint: "PILLARS.SettingHintSeason",
            scope: "world",
            config: false,
            default: { season: 1, year: -1}
        });

        game.settings.register("pillars-of-eternity", "latestSeason", {
            name: "PILLARS.SettingSeason",
            hint: "PILLARS.SettingHintSeason",
            scope: "world",
            config: false,
            default: { season: 0, year: 0}
        });

        game.settings.register("pillars-of-eternity", "seasonPosition", {
            name: "PILLARS.SettingSeasonPosition",
            scope: "client",
            config: false,
            default: { left: 200, top: 1000}
        });
    })


}

