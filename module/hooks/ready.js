
export default function () {

    Hooks.on("ready", () => {
        CONFIG.ChatMessage.documentClass.prototype.getCheck = function () {
            let rollData = this.getFlag("pillars-of-eternity", "rollData")
            if (rollData)
                return game.pillars.rollClass.SkillCheck.recreate(rollData)
        }



        //     const NEEDS_MIGRATION_VERSION = "0.4.3";
        //     let needMigration
        // if (!game.settings.get("pillars-of-eternity", "systemMigrationVersion"))
        // {
        //     game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version)
        //     needMigration = true
        // }

        // try {
        //     if (!needMigration)
        //         needMigration = game.settings.get("pillars-of-eternity", "systemMigrationVersion") && !isNewerVersion(game.settings.get("pillars-of-eternity", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
        // }
        // catch
        // {
        //     needMigration = false;
        // }
        // if (needMigration && game.user.isGM) {
        //     new game.pillars.migration().migrateWorld()
        // }
        // else if (game.user.isGM)
        // {
        //     game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
        // }
    })
}