export default function () {
    Hooks.on("updateActor", (actor, data) => {
        console.log(actor, data)
        if (hasProperty(data, "data.health.wounds") && actor.health.value > actor.health.max)
        {
            actor.update({"data.health.value" : actor.health.max})
        }
    })
}