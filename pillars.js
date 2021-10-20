/**
 * A Foundry implementation of the Pillars of Eternity TTRPG
 * Author: Moo Man
 */

// Import Modules
import { PillarsItemSheet } from "./module/item/item-sheet.js";
import { PillarsItem } from "./module/item/item-pillars.js";
import { PillarsActorSheet } from "./module/actor/actor-sheet.js";
import { PillarsActor } from "./module/actor/actor-pillars.js";
import { PillarsCombat } from "./module/system/combat.js";
import { POE } from "./module/system/config.js";
import PILLARS_UTILITY from "./module/system/utility.js";
import { PillarsChat } from "./module/system/chat.js";
import hooks from "./module/hooks/hooks.js"
import PowerTemplate from "./module/system/power-template.js";
import BookOfSeasons from "./module/apps/book-of-seasons.js"
import RollDialog from "./module/apps/roll-dialog.js";
import PillarsExplode from "./module/system/explode.js";
import SkillCheck from "./module/system/skill-check.js";
import PillarsCombatTracker from "./module/apps/combat-tracker.js";
import PillarsActiveEffect from "./module/system/pillars-effect.js";
import PillarsEffectConfig from "./module/apps/effect-config.js";
import Migration from "./module/system/migrations.js";
import ActorConfigure from "./module/apps/actor-configure.js"
import DamageDialog from "./module/apps/damage-dialog.js";
import WeaponCheck from "./module/system/weapon-check.js";
import PowerCheck from "./module/system/power-check.js";
import loadHandlebarsPartials from "./module/system/handlebars.js";
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.on("init", () => {
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pillars-of-eternity", PillarsActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("pillars-of-eternity", PillarsItemSheet, { makeDefault: true });

  // Assign the actor class to the CONFIG
  CONFIG.Actor.documentClass = PillarsActor;
  CONFIG.Item.documentClass = PillarsItem;
  CONFIG.Combat.documentClass = PillarsCombat;
  CONFIG.ActiveEffect.documentClass = PillarsActiveEffect;
  CONFIG.ActiveEffect.sheetClass = PillarsEffectConfig;
  PillarsExplode()

  game.pillars = {
    apps : {
      PillarsActorSheet,
      PillarsItemSheet,
      BookOfSeasons,
      RollDialog,
      ActorConfigure,
      DamageDialog : DamageDialog
    },
    rollClass : {
      SkillCheck,
      WeaponCheck,
      PowerCheck,
    },
    migration : Migration,
    utility: PILLARS_UTILITY,
    config : POE,
    chat : PillarsChat,
    templates : PowerTemplate,
  }
})

  CONFIG.ui.combat = PillarsCombatTracker
  CONST.ACTIVE_EFFECT_MODES.ROLL = 6
  Hooks.on("setup", () => {
    for (let group in POE) {
      for (let key in POE[group])
        if (typeof POE[group][key] == "string")
          POE[group][key] = game.i18n.localize(POE[group][key])
    }
  loadHandlebarsPartials();
})

  // Register all other hooks
  hooks();
