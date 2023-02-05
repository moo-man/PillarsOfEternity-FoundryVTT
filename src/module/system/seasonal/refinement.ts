import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { getGame } from "../../system/utility";
import { ENCHANTMENT_STATE } from "../../../types/seasonal-activities";
import { PillarsItem } from "../../document/item-pillars";
import { PILLARS } from "../config";
import { Enchantment } from "./enchantment";
import { PillarsActor } from "../../document/actor-pillars";


export class Refinement extends Enchantment
{
    item : PillarsItem | PillarsActor;
    actor : PillarsActor;

    data : {
        // Saved data
        cost? : number,
        enchantmentLimit? : keyof typeof PILLARS.refinementData

        progress : {
            check? : number
        }
        
    } & Enchantment["data"];

    constructor(item : PillarsItem | PillarsActor, actor : PillarsActor)
    {

        super();
        // Make sure all objects are prepared
        item.prepareData();
        actor.prepareData();

        this.data = {
            actorId : actor.id!,
            type : "refinement",
            id : randomID(),
            itemData : item.toObject(),
            cost : 0,
            progress : {
                state : ENCHANTMENT_STATE.NOT_STARTED,
                current : 0,
            }
        };

        this.actor = actor;
        this.item = item;
        this.computeProgress();
    }

    static fromData(data : Refinement["data"]): Refinement
    {
        const game = getGame();
        const actor = game.actors!.get(data.actorId);
        const item =  new PillarsItem(data.itemData as ItemDataConstructorData);

        if (item && actor)
        {
            const imbuement = new this(item, actor);
            imbuement.data = data;
            imbuement.computeProgress();
            return imbuement;
        }
        else {throw new Error("Error creating enchantment from data");}
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

    getStateMessage() 
    {
        switch(this.progress.state)
        {
        case ENCHANTMENT_STATE.FINISHED:
            return `Refinement: ${this.item.name}`;
        default: 
            return "";
        }
    }

    getFinishedData(): Partial<ActorDataConstructorData> 
    {
        const finishedItem = <PillarsItem>this.item;
        
        const updateObject = {items : [], [`flags.pillars-of-eternity.enchantments.-=${this.id}`] : null};


        return {items : [finishedItem.toObject()], [`flags.pillars-of-eternity.enchantments.-=${this.id}`] : null};
    }

    start() 
    {
        this.computeProgress();
        this.data.progress.state = ENCHANTMENT_STATE.IN_PROGRESS;
        return this.advanceProgress();
    }

    computeProgress() 
    {
        this.progress = this.data.progress as typeof this.progress;

        const size = (this.item instanceof PillarsItem ? this.item.system.itemSize?.value : "average" )|| "average";

        if (this.progress.current)
        {this.progress.state = ENCHANTMENT_STATE.FINISHED;}
    }

    async advanceProgress() 
    {
        const check = await this.actor.setupSkillCheck("Metaphysics");
        await check.sendToChat();
        this.data.progress.check = check.result?.total;
        this.data.progress.current = 1;
        this.computeProgress();
    }

    validate(): string[] 
    {
        return [];
    }

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