import SeasonForm from "../apps/season-form";
import { getGame } from "../system/utility";

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

        game.settings.register("pillars-of-eternity", "time", {
            name: "PILLARS.SettingTime",
            hint: "PILLARS.SettingHintTime",
            scope: "world",
            config: false,
            default: { season: 1, year: -1}
        });

        game.settings.register("pillars-of-eternity", "latestTime", {
            name: "PILLARS.SettingSeason",
            hint: "PILLARS.SettingHintSeason",
            scope: "world",
            config: false,
            default: { season: 0, year: 0}
        });

        game.settings.register("pillars-of-eternity", "trackerPosition", {
            name: "PILLARS.SettingTrackerPosition",
            scope: "client",
            config: false,
            default: { left: 200, top: 1000}
        });

        game.settings.register("pillars-of-eternity", "activeHeadquarters", {
            name: "PILLARS.ActiveHeadquarters",
            scope: "world",
            config: false,
            default: []
        });

        game.settings.registerMenu("pillars-of-eternity", "seasonForm", {
            name: "Time Settings",
            label: "Time Settings",
            hint: "Configure Current and Latest Year",
            type: SeasonForm,
            restricted: true
        })
    })


}

