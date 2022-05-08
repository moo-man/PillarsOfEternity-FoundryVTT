export default function () {
    Hooks.on("updateActor", async (actor, data, options, userId) => {
        if (game.user.id == userId)
        {
            if (hasProperty(data, "data.health") || hasProperty(data, "data.endurance"))
            {
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && actor.health.bloodied)
                {
                    let existing = actor.effects.find(e => e.getFlag("core", "statusId") == "bloodied")
                    if (!existing)
                    {
                        let existing = actor.hasCondition("bloodied")
                        if (!existing)
                            await actor.addCondition("bloodied")
                    }
                }
                else {
                    await actor.removeCondition("bloodied")
                }
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && actor.endurance.winded)
                {
                    let existing = actor.hasCondition("winded")
                    if (!existing)
                        await actor.addCondition("winded")
                }
                else {
                    await actor.removeCondition("winded")
                }
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && (actor.health.incap || actor.endurance.incap))
                {
                    if (!actor.hasCondition("incapacitated"))
                        await actor.addCondition("incapacitated")
                    if (!actor.hasCondition("prone"))
                        await actor.addCondition("prone")
                }
                else if (actor.hasCondition("incapacitated"))
                    await actor.removeCondition("incapacitated")
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && (actor.health.dead))
                {
                    await actor.addCondition("dead")
                }
                else if (actor.hasCondition("dead"))
                    await actor.removeCondition("dead")
    
    
    
    
                if (hasProperty(data, "data.health.wounds") && actor.health.value > actor.health.max)
                {
                    actor.update({"data.health.value" : actor.health.max})
                }
            }
        }
    })
}