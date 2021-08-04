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
import { PillarsDice } from "./module/system/dice.js";
import PILLARS_UTILITY from "./module/system/utility.js";
import { PillarsChat } from "./module/system/chat.js";
import hooks from "./module/hooks/hooks.js"
import PowerTemplate from "./module/system/power-template.js";

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


  game.pillars = {
    apps : {
      PillarsActorSheet,
      PillarsItemSheet
    },
    utility: PILLARS_UTILITY,
    config : POE,
    dice : PillarsDice,
    chat : PillarsChat,
    templates : PowerTemplate
  }
})

  Hooks.on("setup", () => {
    for (let group in POE) {
      for (let key in POE[group])
        if (typeof POE[group][key] == "string")
          POE[group][key] = game.i18n.localize(POE[group][key])
    }
  })

  // Register all other hooks
  hooks();
