import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { PillarsItem } from "../document/item-pillars";
import { getGame } from "../system/utility";

export default function () 
{
    Hooks.on("preCreateItem", (item : PillarsItem, options : DocumentModificationOptions, user : string) => 
    {
        if (item.actor)
        {
            return item.actor.system.preCreateItem(item, options, user);
        }
    });

    Hooks.on("createItem", (item : PillarsItem, options : DocumentModificationOptions, user : string) => 
    {
        if (item.actor && getGame().user!.id == user)
        {
            item.actor.system.onCreateItem(item, options, user);
        }
    });
}