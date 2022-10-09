import { getGame } from "../system/utility"
import { PillarsActor } from "../actor/actor-pillars"

export default function () {
    Hooks.on("updateActor", async (actor : PillarsActor, data : Record<string, unknown>, options : unknown, userId: string) => {
        if (actor.data.type == "headquarters")
            return
        if (getGame().user?.id == userId)
        {
            if (hasProperty(data, "system.health") || hasProperty(data, "system.endurance"))
            {
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && actor.system.health.bloodied)
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
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && actor.system.endurance.winded)
                {
                    let existing = actor.hasCondition("winded")
                    if (!existing)
                        await actor.addCondition("winded")
                }
                else {
                    await actor.removeCondition("winded")
                }
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && (actor.system.health.incap || actor.system.endurance.incap))
                {
                    if (!actor.hasCondition("incapacitated"))
                        await actor.addCondition("incapacitated")
                    if (!actor.hasCondition("prone"))
                        await actor.addCondition("prone")
                }
                else if (actor.hasCondition("incapacitated"))
                    await actor.removeCondition("incapacitated")
    
                if (actor.getFlag("pillars-of-eternity", "autoEffects") && (actor.system.health.dead))
                {
                    await actor.addCondition("dead")
                }
                else if (actor.hasCondition("dead"))
                    await actor.removeCondition("dead")
    
    
    
    
                if (hasProperty(data, "system.health.wounds") && actor.system.health.value > actor.system.health.max)
                {
                    actor.update({"system.health.value" : actor.system.health.max})
                }
            }
        }
    })
}