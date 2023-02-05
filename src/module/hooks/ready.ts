import { getGame } from "../system/utility";
import { DamageRollData, SkillCheckData } from "../../types/checks";
import { PILLARS_UTILITY } from "../system/utility";

export default function () 
{
    Hooks.on("ready", () => 
    {
        const game = getGame();
    
        game.pillars.time.setup();
        game.pillars.headquarters.sync();

        CONFIG.ChatMessage.documentClass.prototype.getCheck = function () 
        {
            const rollData = this.getFlag("pillars-of-eternity", "rollData") as SkillCheckData;
            const game = getGame();
            if (rollData) {return game.pillars.rollClass.SkillCheck.recreate(rollData);}
        };

        CONFIG.ChatMessage.documentClass.prototype.getDamage = function () 
        {
            const game = getGame();
            const damageData = this.getFlag("pillars-of-eternity", "damageData") as DamageRollData;
            if (damageData) {return game.pillars.DamageRoll.recreate(damageData);}
        };

        const MIGRATION_TARGET = "0.6.0";
        let needMigration;
        if (!game.settings.get("pillars-of-eternity", "systemMigrationVersion")) 
        {
            game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
            needMigration = true;
        }

        try 
        {
            if (!needMigration)
            {needMigration = game.settings.get("pillars-of-eternity", "systemMigrationVersion") && isNewerVersion(MIGRATION_TARGET, game.settings.get("pillars-of-eternity", "systemMigrationVersion"));}
        }
        catch 
        {
            needMigration = false;
        }
        if (needMigration && game.user!.isGM) 
        {
            new game.pillars.migration().migrateWorld();
        }
        else if (game.user!.isGM) 
        {
            game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
        }

    game.socket!.on("system.pillars-of-eternity", async (data) => 
    {
        if (data.type == "updateActor") 
        {
            if (game.user!.isGM) 
            {
                const actor = PILLARS_UTILITY.getSpeaker(data.payload.speaker);
                await actor?.update(data.payload.updateData);
                if (data.payload.updateItems)
                {actor?.updateEmbeddedDocuments("Item", data.payload.updateItems);}
          ui.notifications!.notify(getGame().i18n.format("PILLARs.AppliedDamageTo", {name : actor?.name}));
            }
        }
        else if (data.type == "applyEffect") 
        {
            if (game.user!.isGM) 
            {
                const actor = PILLARS_UTILITY.getSpeaker(data.payload.speaker);
                actor?.createEmbeddedDocuments("ActiveEffect", data.payload.effects);
            }
        }
        else if (data.type == "updateMessage") 
        {
            if (game.user!.isGM) 
            {
                const message = game.messages!.get(data.payload.id);
                message?.update(data.payload.update);
            }
        }
        else if (data.type == "addItems") 
        {
            if (game.user!.isGM) 
            {
                const actor = PILLARS_UTILITY.getSpeaker(data.payload.speaker);
                actor?.createEmbeddedDocuments("Item", data.payload.items);
            }
        }
    });

    // Don't really like this but "ready" is needed for active effect to know if their item has been equipped or not
    game.actors!.contents.forEach((a) => 
    {
        //@ts-ignore
        a._initialize();
        // a.prepareData();
    });
    });
}
