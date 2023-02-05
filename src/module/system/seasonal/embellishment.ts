import { IndexTypeForMetadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/collections/compendium";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { ItemData, ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { EquipmentSource, PowerSource } from "../../../global";
import { getGame } from "../../system/utility";
import { hasEmbeddedPowers } from "../../../types/common";
import { EmbeddedPower } from "../../../types/powers";
import { ENCHANTMENT_STATE } from "../../../types/seasonal-activities";
import { PillarsItem } from "../../document/item-pillars";
import { PILLARS } from "../config";
import { Enchantment } from "./enchantment";
import { PillarsActor } from "../../document/actor-pillars";


export class Embellishment extends Enchantment{
    item : PillarsItem | PillarsActor
    actor : PillarsActor

    data : {
        // Saved data
        cost : number,
        form: "body" | "item",
        skill : string,
        quality : "fine" | "exceptional" | "superb" | "legendary",
        progress : {failures : number} & Enchantment["data"]["progress"]
    } & Enchantment["data"]

    // Computed Progress
    progress = {
        cost : 0,
        current : 0,
        total : 0,
        failures : 0,
        state : ENCHANTMENT_STATE.NOT_STARTED,
    } 

    constructor(item : PillarsItem | PillarsActor, actor : PillarsActor)
    {

        super()
        // Make sure all objects are prepared
        item.prepareData();
        actor.prepareData();

        this.data = {
            actorId : actor.id!,
            type : "embellishment",
            id : randomID(),
            itemData : item.toObject(),
            form :  item instanceof PillarsActor ? "body" : "item",
            quality : "fine",
            skill : "",
            cost : 0,
            progress : {
                failures : 0,
                state : ENCHANTMENT_STATE.NOT_STARTED,
                current : 0
            }
        }

        this.actor = actor;
        this.item = item;
        this.computeProgress();
    }

    static fromData(data : Embellishment["data"]): Embellishment
    {
        let game = getGame();
        let actor = game.actors!.get(data.actorId);
        let item =  data.form == "item" ? new PillarsItem(data.itemData as ItemDataConstructorData) : new PillarsActor(data.itemData as ActorDataConstructorData);

        if (item && actor)
        {
            let imbuement = new this(item, actor)
            imbuement.data = data;
            imbuement.computeProgress();
            return imbuement
        }
        else throw new Error("Error creating enchantment from data")
    }

    async save() {
        this.computeProgress();
        return this.actor.setFlag("pillars-of-eternity", `enchantments.${this.id}`, this.data)
    }


    get id() {
        return this.data.id
    }

    getSaveData() {
        return {[`flags.pillars-of-eternity.enchantments.${this.id}`] : this.data}
    }

    getStateMessage() {
        switch(this.progress.state)
        {
            case ENCHANTMENT_STATE.IN_PROGRESS:
                return `Embellishing: ${this.item.name} - ${PILLARS.qualities[this.data.quality]} (${this.progress.current}/${this.progress.total})`
            case ENCHANTMENT_STATE.FINISHED:
                return `Embellishing: ${this.item.name} - ${PILLARS.qualities[this.data.quality]} (finished)`
            default: 
                return ""
        }
    }

    getFinishedData(): Partial<ActorDataConstructorData> {
        let finishedItem = <PillarsItem>this.item;
        
        return {items : [finishedItem.toObject()], [`flags.pillars-of-eternity.enchantments.-=${this.id}`] : null}
    }

    start() 
    {
        this.computeProgress();
        this.data.progress.state = ENCHANTMENT_STATE.IN_PROGRESS;
        return this.advanceProgress();
    }

    computeProgress() {
        this.progress = this.data.progress as typeof this.progress;

        let qualityData = PILLARS.qualityData[this.data.quality];

        let size = (this.item instanceof PillarsItem ? this.item.system.itemSize?.value : "average" )|| "average"
        this.progress.total = Math.ceil(qualityData.seasons * PILLARS.itemSizeMultiplier[size as keyof typeof PILLARS.itemSizeMultiplier])

        this.progress.total = Math.ceil(this.progress.total)

        if (this.progress.current >= this.progress.total)
            this.progress.state = ENCHANTMENT_STATE.FINISHED
    }

    async advanceProgress() {
        let check = await this.actor.setupSkillCheck(this.data.skill);
        await check.sendToChat();
        let qualityData = PILLARS.qualityData[this.data.quality];

        if ((check?.result?.total || 0) < qualityData.difficulty)
        {
            this.data.progress.failures++;
            if (this.data.quality == "legendary")
                this.data.quality = "superb"
            else if (this.data.quality == "superb")
                this.data.quality = "exceptional"
            else if (this.data.quality == "exceptional")
                this.data.quality = "fine"
        }
        this.data.progress.current++;
        this.computeProgress();
    }

    validate(): string[] {
        return []
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