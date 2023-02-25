/**
 * A Foundry implementation of the Pillars of Eternity TTRPG
 * Author: Moo Man
 */
// Import Modules

//@ts-ignore
import { PillarsCharacterSheet } from "./module/apps/sheets/actor/character-sheet.js";
//@ts-ignore
import { PillarsNPCSheet } from "./module/apps/sheets/actor/npc-sheet";
//@ts-ignore
import { PillarsFollowerSheet } from "./module/apps/sheets/actor/follower-sheet";
//@ts-ignore
import { PillarsHeadquartersSheet } from "./module/apps/sheets/actor/headquarters-sheet";
//@ts-ignore
import FoundryOverrides from "./module/system/overrides.js";
//@ts-ignore
import PillarsExplode from "./module/system/explode.js";
//@ts-ignore
import {CharacterActorDataModel} from "./module/model/actor/character.js";
//@ts-ignore
import {FollowerActorDataModel} from "./module/model/actor/follower.js";
//@ts-ignore 
import {StandardActorDataModel} from "./module/model/actor/components/base.js";
//@ts-ignore
import {HeadquartersDataModel} from "./module/model/actor/headquarters.js";

import { PillarsItemSheet } from "./module/apps/sheets/item/item-sheet";
import { PillarsItem } from "./module/document/item-pillars";
import { PillarsCombat } from "./module/document/combat-pillars";
import { PILLARS } from "./module/system/config";
import { PILLARS_UTILITY, getGame }from "./module/system/utility";
import { PillarsChat } from "./module/system/chat";
import hooks from "./module/hooks/hooks";
import PowerTemplate from "./module/system/power-template";
import BookOfSeasons from "./module/apps/book-of-seasons";
import RollDialog from "./module/apps/roll-dialog";
import PillarsCombatTracker from "./module/apps/combat-tracker";
import PillarsActiveEffect from "./module/document/effect-pillars";
import PillarsEffectConfig from "./module/apps/effect-config";
import Migration from "./module/system/migrations";
import ActorConfigure from "./module/apps/actor-configure";
import DamageDialog from "./module/apps/damage-dialog";
import PillarsTokenDocument from "./module/system/token";
import HealingDialog from "./module/apps/healing-dialog";
import { PillarsCombatant } from "./module/document/combatant-pillars";

import AdventureSeasonalActivityApplication from "./module/apps/seasonal/adventure";
import SocializingSeasonalActivityApplication from "./module/apps/seasonal/socializing";
import PracticeSeasonalActivityApplication from "./module/apps/seasonal/practice";
import StudySeasonalActivityApplication from "./module/apps/seasonal/study";
import EnchantmentSeasonalActivityApplication from "./module/apps/seasonal/enchantment";
import LivingOffLandSeasonalActivityApplication from "./module/apps/seasonal/living-off-land";
import { HeadquartersManager } from "./module/system/headquarters-manager";
import { TimeManager } from "./module/system/time-manager";
import SkillCheck from "./module/system/rolls/skill-check";
import WeaponCheck from "./module/system/rolls/weapon-check";
import PowerCheck from "./module/system/rolls/power-check";
import DamageRoll from "./module/system/rolls/damage-roll";
import { PillarsActor } from "./module/document/actor-pillars";
import { PillarsPowerSheet } from "./module/apps/sheets/item/power-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */



Hooks.on("init", () => 
{

    // #if _ENV == "development"
    CONFIG.debug.pillars = true;
    //@ts-ignore
    // CONFIG.compatibility.mode = 0;
    // #endif


    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pillars-of-eternity", PillarsCharacterSheet, { makeDefault: true });
    Actors.registerSheet("pillars-of-eternity", PillarsNPCSheet, {types: ["npc"], makeDefault: true });
    Actors.registerSheet("pillars-of-eternity", PillarsFollowerSheet, {types: ["follower"], makeDefault: true });
    Actors.registerSheet("pillars-of-eternity", PillarsHeadquartersSheet, {types: ["headquarters"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pillars-of-eternity", PillarsItemSheet, { makeDefault: true });
    Items.registerSheet("pillars-of-eternity", PillarsPowerSheet, {types: ["power"], makeDefault: true });

    DocumentSheetConfig.registerSheet(ActiveEffect, "pillars-of-eternity", PillarsEffectConfig, {makeDefault: true});
  
    //   // Assign the actor class to the CONFIG
    CONFIG.Actor.documentClass = PillarsActor;
    CONFIG.Item.documentClass = PillarsItem;
    CONFIG.Combat.documentClass = PillarsCombat;
    CONFIG.Combatant.documentClass = PillarsCombatant;
    CONFIG.ActiveEffect.documentClass = PillarsActiveEffect;
    CONFIG.Token.documentClass = PillarsTokenDocument;
    CONFIG.Combat.defeatedStatusId = "incapacitated";
    CONFIG.ui.combat = PillarsCombatTracker;
  
    //@ts-ignore
    CONFIG.Actor.systemDataModels["character"] = CharacterActorDataModel;
    //@ts-ignore
    CONFIG.Actor.systemDataModels["follower"] = FollowerActorDataModel;
    //@ts-ignore
    CONFIG.Actor.systemDataModels["npc"] = StandardActorDataModel;
    //@ts-ignore
    CONFIG.Actor.systemDataModels["headquarters"] = HeadquartersDataModel;

    PillarsExplode();


    const game = getGame();
    game.pillars = {
        apps : {
            PillarsCharacterSheet,
            PillarsItemSheet,
            BookOfSeasons,
            RollDialog,
            ActorConfigure,
            DamageDialog,
            HealingDialog
        },
        rollClass : {
            SkillCheck,
            WeaponCheck,
            PowerCheck,
        },
        seasonalActivities : [
            AdventureSeasonalActivityApplication,
            SocializingSeasonalActivityApplication,
            PracticeSeasonalActivityApplication,
            StudySeasonalActivityApplication,
            EnchantmentSeasonalActivityApplication,
            LivingOffLandSeasonalActivityApplication
        ],
        headquarters : new HeadquartersManager(),
        time : new TimeManager(),
        DamageRoll : DamageRoll,
        migration : Migration,
        utility: PILLARS_UTILITY,
        config : PILLARS,
        chat : PillarsChat,
        templates : PowerTemplate,
        postReadyPrepare : [],
    };
});

Hooks.on("setup", () => 
{
    localizeConfigObject(PILLARS);
    localizeConfigObject(CONFIG.statusEffects);
    FoundryOverrides();
});

//Register all other hooks
hooks();

function localizeConfigObject(object : any)
{
    const game = getGame();
    for (const key in object) 
    {
        if (typeof object[key] == "string")
        {
            object[key] = game.i18n.localize(object[key] as string);
        }
        else if (typeof object[key] == "object")
        {
            localizeConfigObject(object[key]);
        }
    }
}

