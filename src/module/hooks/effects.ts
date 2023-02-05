import PillarsActiveEffect from "../document/effect-pillars"

export default function() {
    Hooks.on("preCreateActiveEffect", (effect : PillarsActiveEffect, data : Record<string, unknown>) => {
        if (effect.parent?.type == "power")
            effect.data.update({"transfer" : false})
        if (effect.parent?.documentName == "Item" && effect.parent.canEquip)
            effect.data.update({"flags.pillars-of-eternity.itemEquip" : true})
    })
}