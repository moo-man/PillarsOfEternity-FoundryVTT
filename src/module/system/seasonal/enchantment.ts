import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { ItemData, ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { ENCHANTMENT_STATE } from "../../../types/seasonal-activities";
import { PillarsActor } from "../../document/actor-pillars";
import { PillarsItem } from "../../document/item-pillars";


export abstract class Enchantment 
{
    abstract item : PillarsItem | PillarsActor
    abstract actor : PillarsActor
    abstract data : {
        // Saved data
        type : "imbuement" | "embellishment" | "refinement",
        id : string
        actorId : string,
        itemData : ItemDataConstructorData | ActorDataConstructorData,
        progress : {
            state : ENCHANTMENT_STATE,
            current : number,
            total? : number
        }
    }

    // Computed Progress
    progress = {
        current : 0,
        total : 0,
        state : ENCHANTMENT_STATE.NOT_STARTED,
    }; 

    static fromData<T extends Enchantment>(this : {new() : T}, data : Enchantment["data"]): Enchantment
    {
        return new this();
    }

    async save() 
    {
        this.computeProgress();
        return this.actor.setFlag("pillars-of-eternity", `enchantments.${this.id}`, this.data);
    }


    get id() 
    {
        return this.data.id;
    }

    getSaveData() 
    {
        return {[`flags.pillars-of-eternity.enchantments.${this.id}`] : this.data};
    }

    abstract getStateMessage() : string 

    abstract getFinishedData(): Partial<ActorDataConstructorData>

    abstract start() : Promise<void>

    abstract computeProgress() : void 

    abstract advanceProgress() : Promise<void>

    abstract validate() : string[]
}


// export class Embellishment {
//     item : PillarsItem
//     actor : PillarsActor

//     data : {
//         quality : typeof PILLARS.embellishmentQualities[number],
//         size : keyof typeof PILLARS.itemSizes
//     }
// }

// export class Refinement {
//     item : PillarsItem
//     actor : PillarsActor


//     data : {
//         multiplier : keyof typeof PILLARS.refinementData,
//         size : keyof typeof PILLARS.itemSizes
//     }
// }