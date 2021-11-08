export default class Migration {

  async migrateWorld() {
    ui.notifications.info(`Applying pillars-of-eternity System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });

    // Migrate World Items
    for (let i of game.items.contents) {
      try {
        const updateData = this.migrateItemData(i.toObject());
        if (!foundry.utils.isObjectEmpty(updateData)) {
          console.log(`Migrating Item entity ${i.name}`);
          await i.update(updateData, { enforceTypes: false });
        }
      } catch (err) {
        err.message = `Failed pillars-of-eternity system migration for Item ${i.name}: ${err.message}`;
        console.error(err);
      }
    }

      // Migrate World Actors
    for (let a of game.actors.contents) {
      try {
        const updateData = this.migrateActorData(a.toObject());
        if (!foundry.utils.isObjectEmpty(updateData)) {
          console.log(`Migrating Actor entity ${a.name}`);
          await a.update(updateData, { enforceTypes: false });
        }
      } catch (err) {
        err.message = `Failed pillars-of-eternity system migration for Actor ${a.name}: ${err.message}`;
        console.error(err);
      }
    }

  // Migrate World Actors
    for (let s of game.scenes.contents) {
      try {
        const updateData = this.migrateSceneData(s.data);
        if (!foundry.utils.isObjectEmpty(updateData)) {
          console.log(`Migrating Scene entity ${s.name}`);
          await s.update(updateData);
        }
      } catch (err) {
        err.message = `Failed pillars-of-eternity system migration for Scene ${s.name}: ${err.message}`;
        console.error(err);
      }
    }

    

    // // Set the migration as complete
    game.settings.set("pillars-of-eternity", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`pillars-of-eternity System Migration to version ${game.system.data.version} completed!`, { permanent: true });
  };

  /* -------------------------------------------- */

  /**
   * Apply migration rules to all Entities within a single Compendium pack
   * @param pack
   * @return {Promise}
   */
  async migrateCompendium(pack) {
    const entity = pack.metadata.entity;
    if (!["Actor", "Item", "Scene"].includes(entity)) return;

    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({ locked: false });

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const documents = await pack.getDocuments();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for (let doc of documents) {
      let updateData = {};
      try {
        switch (entity) {
          case "Actor":
            updateData = this.migrateActorData(doc.data);
            break;
          case "Item":
            updateData = this.migrateItemData(doc.toObject());
            break;
          case "Scene":
            updateData = this.migrateSceneData(doc.data);
            break;
        }

        // Save the entry, if data was changed
        if (foundry.utils.isObjectEmpty(updateData)) continue;
        await doc.update(updateData);
        console.log(`Migrated ${entity} entity ${doc.name} in Compendium ${pack.collection}`);
      }

      // Handle migration failures
      catch (err) {
        err.message = `Failed pillars-of-eternity system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
        console.error(err);
      }
    }

    // Apply the original locked status for the pack
    await pack.configure({ locked: wasLocked });
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
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
  migrateActorData(actor) {
    const updateData = {};
    let items = actor.items.map(i => this.migrateItemData(i, actor)).filter(i => !foundry.utils.isObjectEmpty(i))
    let effects = actor.effects.map(i => this.migrateEffectData(i, actor)).filter(i => !foundry.utils.isObjectEmpty(i))

    updateData["data.defenses.reflex"] = actor.data.defenses.reflexes
    updateData["data.defenses.-=reflexes"] = null

    if (items.length)
      updateData.items = items
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
  migrateItemData(item) {
    const updateData = {};
    let effects = item.effects.map(i => this.migrateEffectData(i)).filter(i => !foundry.utils.isObjectEmpty(i))
    if (effects.length)
      updateData.effects = effects
    return updateData;
  };


  migrateEffectData(effect) {
    const updateData = {};

    let changes = duplicate(effect.changes)
    let changed = false;
    changes.forEach(c => {
      if(c.key.includes("reflexes"))
        changed = true;
      c.key = c.key.replace("reflexes", "reflex")
    })
    if (changed)
    {
      updateData.changes = changes
      updateData._id = effect._id
    }

    return updateData;
  };

  /* -------------------------------------------- */

  /**
   * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
   * Return an Object of updateData to be applied
   * @param {Object} scene  The Scene data to Update
   * @return {Object}       The updateData to apply
   */
  migrateSceneData(scene) {
    const tokens = scene.tokens.map(token => {
      const t = token.toJSON();
      if (!t.actorId || t.actorLink) {
        t.actorData = {};
      }
      else if (!game.actors.has(t.actorId)) {
        t.actorId = null;
        t.actorData = {};
      }
      else if (!t.actorLink) {
        const actorData = duplicate(t.actorData);
        actorData.type = token.actor?.type;
        const update = this.migrateActorData(actorData);
        ['items', 'effects'].forEach(embeddedName => {
          if (!update[embeddedName]?.length) return;
          const updates = new Map(update[embeddedName].map(u => [u._id, u]));
          t.actorData[embeddedName].forEach(original => {
            const update = updates.get(original._id);
            if (update) mergeObject(original, update);
          });
          delete update[embeddedName];
        });

        mergeObject(t.actorData, update);
      }
      return t;
    });
    return { tokens };
  };


}