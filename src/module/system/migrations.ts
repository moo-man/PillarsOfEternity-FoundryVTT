import { ActiveEffectDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { PreparedPillarsActorData, PreparedPillarsCharacterData } from "../../global";
import { getGame } from "../../pillars";
import { PillarsActor } from "../actor/actor-pillars";
import { PillarsItem } from "../item/item-pillars";
import PillarsActiveEffect from "./pillars-effect";

export default class Migration {

  async migrateWorld() {
    let game = getGame()
    ui.notifications!.info(`Applying pillars-of-eternity System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });
    // Migrate World Items
    for (let i of game.items!.contents) {
      try {
        const updateData = this.migrateItemData(i);
        if (!foundry.utils.isObjectEmpty(updateData)) {
          console.log(`Migrating Item entity ${i.name}`);
          await i.update(updateData, { enforceTypes: false });
        }
      } catch (err: any) {
        err.message = `Failed pillars-of-eternity system migration for Item ${i.name}: ${err.message}`;
        console.error(err);
      }
    }

    // Migrate World Actors
    for (let a of game.actors!.contents) {
      try {
        const updateData = this.migrateActorData(a);
        if (!foundry.utils.isObjectEmpty(updateData)) {
          console.log(`Migrating Actor entity ${a.name}`);
          await a.update(updateData, { enforceTypes: false });
        }
      } catch (err: any) {
        err.message = `Failed pillars-of-eternity system migration for Actor ${a.name}: ${err.message}`;
        console.error(err);
      }
    }

    // // Set the migration as complete
    game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
    ui.notifications!.info(`pillars-of-eternity System Migration to version ${game.system.data.version} completed!`, { permanent: true });
  };

  /* -------------------------------------------- */
  /*  Entity Type Migration Helpers               */
  /* -------------------------------------------- */

  /**
   * Migrate a single Actor entity to incorporate latest data model changes
   * Return an Object of updateData to be applied
   * @param {object} actor    The actor data object to update
   * @return {Object}         The updateData to apply
   */
  migrateActorData(actor: PillarsActor) {
    const updateData : Record<string, unknown> = {};
    let effects = actor.toObject().effects.map(i => this.migrateEffectData(i)).filter(i => !foundry.utils.isObjectEmpty(i))
    if (effects.length)
      updateData.effects = effects
    return updateData;
  };


  /* -------------------------------------------- */

  /**
   * Migrate a single Item entity to incorporate latest data model changes
   *
   * @param {object} item  Item data to migrate
   * @return {object}      The updateData to apply
   */
  migrateItemData(item: PillarsItem) {
    const updateData : Record<string, unknown> = {};
    let effects = item.toObject().effects.map(i => this.migrateEffectData(i)).filter(i => !foundry.utils.isObjectEmpty(i))
    if (effects.length)
      updateData.effects = effects
    return updateData;
  };


  migrateEffectData(effect: PropertiesToSource<ActiveEffectDataProperties>) {
    let description = getProperty(effect, "flags.pillars-of-eternity.description")

    effect.changes.forEach((change, i) => {
      if (change.mode == 0) {
        change.mode = 6
        setProperty(effect, `flags.pillars-of-eternity.changeCondition.${i}`, { description, script: "" })
      };
    })
    return effect;
  }
}