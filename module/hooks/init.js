export default function () {
    Hooks.on("init", () => {
        game.settings.register("pillars-of-eternity", "systemMigrationVersion", {
            name: "System Migration Version",
            scope: "world",
            config: false,
            type: String,
            default: 0
        });

    })
}

