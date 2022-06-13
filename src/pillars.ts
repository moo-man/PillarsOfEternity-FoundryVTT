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
import PILLARS_UTILITY from "./module/system/utility";
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
import HealingDialog from "./module/apps/healing-dialog";
import { PillarsCombatant } from "./module/system/combatant";


//@ts-ignore
import FoundryOverrides from "./module/system/overrides.js"
//@ts-ignore
import PillarsExplode from "./module/system/explode.js"

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */



Hooks.on("init", () => {
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pillars-of-eternity", PillarsActorSheet, { makeDefault: true });
  Actors.registerSheet("pillars-of-eternity", PillarsNPCSheet, {types: ["npc"], makeDefault: true });
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
  PillarsExplode()


  let game = getGame()
  game.pillars = {
    apps : {
      PillarsActorSheet: PillarsActorSheet,
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
    DamageRoll : DamageRoll,
    migration : Migration,
    utility: PILLARS_UTILITY,
    config : PILLARS,
    chat : PillarsChat,
    templates : PowerTemplate,
  }
})

  CONFIG.ui.combat = PillarsCombatTracker
  Hooks.on("setup", () => {
    for (let groupKey in PILLARS) {
      {
        for (let key in PILLARS[groupKey as keyof typeof PILLARS])
        {
          let group = PILLARS[groupKey as keyof typeof PILLARS]
          if (typeof group[key as keyof typeof group] == "string")
            setProperty(group, key, getGame().i18n!.localize(group[key as keyof typeof group]))
        }
      }
    }
    FoundryOverrides()
})

  //Register all other hooks
  hooks();

export function getGame(): Game {
  if(!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}

