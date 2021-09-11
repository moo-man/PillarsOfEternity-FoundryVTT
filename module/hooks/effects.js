export default function() {
    Hooks.on("preCreateActiveEffect", (effect, data, options, user) => {
        if (effect.parent?.type == "spell")
            effect.data.update({"transfer" : false})
    })
}