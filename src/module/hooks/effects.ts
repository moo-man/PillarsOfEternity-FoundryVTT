import PillarsActiveEffect from "../document/effect-pillars";

export default function() 
{
    Hooks.on("preCreateActiveEffect", (effect : PillarsActiveEffect, data : Record<string, unknown>) => 
    {
        if (effect.parent?.type == "power")
        {effect.updateSource({"transfer" : false});}
        if (effect.parent?.documentName == "Item" && effect.parent.canEquip)
        {effect.updateSource({"flags.pillars-of-eternity.itemEquip" : true});}
    });
}