export default function () {
    Hooks.on("deleteCombat", (combat) => {
        combat.turns.filter(combatant => combatant.actor.type == "character").forEach(combatant => combatant.actor.encounterEnd())
        let actors = combat.turns.filter(combatant => combatant.actor.type == "character").map(combatant => combatant.actor.name)
        ui.notifications.notify("Encounter powers refreshed for: " + actors.join(", "))
    })


}

