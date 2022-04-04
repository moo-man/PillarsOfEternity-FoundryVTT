
export default function () {

    Hooks.on("ready", () => {
        CONFIG.ChatMessage.documentClass.prototype.getCheck = function () {
            let rollData = this.getFlag("pillars-of-eternity", "rollData")
            if (rollData)
                return game.pillars.rollClass.SkillCheck.recreate(rollData)

            let damageData = this.getFlag("pillars-of-eternity", "damageData")
            if (damageData)
                return game.pillars.rollClass.DamageRoll.recreate(damageData)

        }



            const MIGRATION_TARGET = "0.6.0";
            let needMigration
        if (!game.settings.get("pillars-of-eternity", "systemMigrationVersion"))
        {
            game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version)
            needMigration = true
        }

        try {
            if (!needMigration)
                needMigration = game.settings.get("pillars-of-eternity", "systemMigrationVersion") && isNewerVersion(MIGRATION_TARGET, game.settings.get("pillars-of-eternity", "systemMigrationVersion"))
        }
        catch
        {
            needMigration = false;
        }
        if (needMigration && game.user.isGM) {
            new game.pillars.migration().migrateWorld()
        }
        else if (game.user.isGM)
        {
            game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
        }


        game.socket.on("system.pillars-of-eternity", data => {
            if (data.type == "updateActor")
            {
                let actor = game.pillars.utility.getSpeaker(data.payload.speaker);
                actor.update(data.payload.updateData);
                ui.notifications.notify(`Applied Damage to ${actor.name}`)
            }
            else if (data.type == "applyEffect")
            {
                let actor = game.pillars.utility.getSpeaker(data.payload.speaker);
                actor.createEmbeddedDocuments("ActiveEffect", data.payload.effects)
            }
            else if (data.type == "updateMessage")
            {
                let message = game.messages.get(data.payload.id);
                message.update(data.payload.update)
            }
        })

        // Don't really like this but "ready" is needed for active effect to know if their item has been equipped or not
        game.actors.contents.forEach(a => {
            a.prepareData()
        })
    })
}