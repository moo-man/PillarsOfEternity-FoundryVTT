/**
 * A Foundry implementation of the Pillars of Eternity TTRPG
 * Author: Moo Man
 */
// Import Modules

import { PillarsItemSheet } from "./module/item/item-sheet";
import { PillarsItem } from "./module/item/item-pillars";
import { PillarsActorSheet } from "./module/actor/actor-sheet";
import { PillarsActor } from "./module/actor/actor-pillars";
import { PillarsCombat } from "./module/system/combat";
import { PILLARS } from "./module/system/config";
import { PILLARS_UTILITY, getGame }from "./module/system/utility";
import { PillarsChat } from "./module/system/chat";
import hooks from "./module/hooks/hooks"
import PowerTemplate from "./module/system/power-template";
import BookOfSeasons from "./module/apps/book-of-seasons"
import RollDialog from "./module/apps/roll-dialog";
import SkillCheck from "./module/system/skill-check";
import PillarsCombatTracker from "./module/apps/combat-tracker";
import PillarsActiveEffect from "./module/system/pillars-effect";
import PillarsEffectConfig from "./module/apps/effect-config";
import Migration from "./module/system/migrations";
import ActorConfigure from "./module/apps/actor-configure"
import DamageDialog from "./module/apps/damage-dialog";
import WeaponCheck from "./module/system/weapon-check";
import PowerCheck from "./module/system/power-check";
import PillarsTokenDocument from "./module/system/token";
import DamageRoll from "./module/system/damage-roll";
import { PillarsNPCSheet } from "./module/actor/npc-sheet";
import { PillarsFollowerSheet } from "./module/actor/follower-sheet";
import HealingDialog from "./module/apps/healing-dialog";
import { PillarsCombatant } from "./module/system/combatant";


//@ts-ignore
import FoundryOverrides from "./module/system/overrides.js"
//@ts-ignore
import PillarsExplode from "./module/system/explode.js"
import TimeTracker from "./module/apps/time-tracker";
import AdventureSeasonalActivityApplication from "./module/apps/seasonal/adventure";
import SocializingSeasonalActivityApplication from "./module/apps/seasonal/socializing";
import PracticeSeasonalActivityApplication from "./module/apps/seasonal/practice";
import StudySeasonalActivityApplication from "./module/apps/seasonal/study";
import EnchantmentSeasonalActivityApplication from "./module/apps/seasonal/enchantment";
import LivingOffLandSeasonalActivityApplication from "./module/apps/seasonal/living-off-land";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */



Hooks.on("init", () => {
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pillars-of-eternity", PillarsActorSheet, { makeDefault: true });
  Actors.registerSheet("pillars-of-eternity", PillarsNPCSheet, {types: ["npc"], makeDefault: true });
  Actors.registerSheet("pillars-of-eternity", PillarsFollowerSheet, {types: ["follower"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("pillars-of-eternity", PillarsItemSheet, { makeDefault: true });
  DocumentSheetConfig.registerSheet(ActiveEffect, "pillars-of-eternity", PillarsEffectConfig)
  
//   // Assign the actor class to the CONFIG
  CONFIG.Actor.documentClass = PillarsActor;
  CONFIG.Item.documentClass = PillarsItem;
  CONFIG.Combat.documentClass = PillarsCombat;
  CONFIG.Combatant.documentClass = PillarsCombatant;
  CONFIG.ActiveEffect.documentClass = PillarsActiveEffect;
  CONFIG.Token.documentClass = PillarsTokenDocument
  CONFIG.Combat.defeatedStatusId = "incapacitated"
  CONFIG.ui.combat = PillarsCombatTracker

  PillarsExplode()


  let game = getGame()
  game.pillars = {
    apps : {
      PillarsActorSheet,
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
    DamageRoll : DamageRoll,
    migration : Migration,
    utility: PILLARS_UTILITY,
    config : PILLARS,
    chat : PillarsChat,
    templates : PowerTemplate,
    TimeTracker : new TimeTracker(),
    postReadyPrepare : []
  }
})

  Hooks.on("setup", () => {
    localizeConfigObject(PILLARS);
    localizeConfigObject(CONFIG.statusEffects);
    FoundryOverrides()
})

  //Register all other hooks
  hooks();

function localizeConfigObject(object : any)
{
  let game = getGame();
  for (let key in object) 
  {
    if (typeof object[key] == "string")
    {
      object[key] = game.i18n.localize(object[key] as string);
    }
    else if (typeof object[key] == "object")
    {
      localizeConfigObject(object[key])
    }
  }
}

