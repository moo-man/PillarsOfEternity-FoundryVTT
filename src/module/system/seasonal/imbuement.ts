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


export class Imbuement extends Enchantment{
    item : PillarsItem | PillarsActor
    power : PillarsItem
    actor : PillarsActor
    maedrs : PillarsItem[];

    data : {
        // Saved data
        powerData : ItemDataConstructorData,
        maedrs : ItemDataConstructorData[]
        sealed : boolean
        resonance : boolean,
        frequency : 1 | 2 | 3
        form: "body" | "item",
        exclusion : boolean,
        trigger : boolean,
    } & Enchantment["data"]

    // Computed Progress
    progress = {
        cost : 0,
        current : 0,
        total : 0,
        state : ENCHANTMENT_STATE.NOT_STARTED,
    } 

    constructor(item : PillarsItem | PillarsActor, power : PillarsItem, actor : PillarsActor, maedrs : PillarsItem[] = [])
    {

        super()
        // Make sure all objects are prepared
        item.prepareData();
        power.prepareData();
        actor.prepareData();
        maedrs.forEach(m => m.prepareData())

        this.data = {
            actorId : actor.id!,
            type : "imbuement",
            id : randomID(),
            itemData : item.toObject(),
            powerData : power.toObject(),
            maedrs : maedrs.map(i => i.toObject()),
            sealed : false,
            resonance : false,
            frequency : 1,
            form :  item instanceof PillarsActor ? "body" : "item",
            trigger : false,
            exclusion : false,
            progress : {
                state : ENCHANTMENT_STATE.NOT_STARTED,
                current : 0
            }
        }

        this.actor = actor;
        this.item = item;
        this.power = power;
        this.maedrs = this.data.maedrs.map(i => new PillarsItem(i)) // Create a clone 
        this.computeProgress();
    }

    static fromData(data : Imbuement["data"]): Imbuement
    {
        let game = getGame();
        let actor = game.actors!.get(data.actorId);
        let item =  data.form == "item" ? new PillarsItem(data.itemData as ItemDataConstructorData) : new PillarsActor(data.itemData as ActorDataConstructorData);
        let power = new PillarsItem(data.powerData);
        let maedrs = data.maedrs.map(i => new PillarsItem(i))

        if (item && power && actor)
        {
            let imbuement = new this(item, power, actor, maedrs)
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
                return `Imbuing: ${this.item.name} - ${this.power.name} (${this.progress.current}/${this.progress.total})`
            case ENCHANTMENT_STATE.FINISHED:
                return `Imbuing: ${this.item.name} - ${this.power.name} (finished)`
            default: 
                return ""
        }
    }

    getFinishedData(): Partial<ActorDataConstructorData> {
        let finishedItem = <PillarsItem>this.item;
        if (hasEmbeddedPowers(finishedItem))
        {
            let powers = duplicate(finishedItem.system.powers) as EmbeddedPower[];
            let powerData = this.power.toObject();
            if (powerData.type == "power")
            {
                powers.push(this.power.toObject() as EmbeddedPower)
                finishedItem.data.update({"data.powers" : powers})
                finishedItem.data.update(this.getSaveData())
            }
        }
        return {items : [finishedItem.toObject()], [`flags.pillars-of-eternity.enchantments.-=${this.id}`] : null}
    }
    


    async start() 
    {
        this.computeProgress();
  
        this.data.progress.state = ENCHANTMENT_STATE.IN_PROGRESS;
        if (this.actor.items.has(this.item.id!))
            this.actor.deleteEmbeddedDocuments("Item", [this.item.id!])
        return await this.advanceProgress();
    }
    computeProgress() {
        this.progress = this.data.progress as typeof this.progress;

        this.progress.total = this.power.system.level?.value || 0
        if (this.data.frequency == 2)
            this.progress.total += 1

        if (this.data.frequency == 3)
            this.progress.total += 3

        if (this.data.exclusion)
            this.progress.total += 1

        if (this.data.trigger)
            this.progress.total += 2

        this.progress.total = Math.ceil(this.progress.total)

        this.progress.cost  = Math.ceil(this.progress.total / 2);

        if (this.progress.current >= this.progress.total)
            this.progress.state = ENCHANTMENT_STATE.FINISHED
    }

    async advanceProgress() {
        let powerSource = this.actor?.items.find((i) => (i.type == 'powerSource' && i.system.source && i.system.source.value == this.power.system.source?.value) || false);
        if (powerSource && this.data.progress.state)
        {
            this.data.progress.current += ((powerSource.system.pool?.max || 0) - (this.power.system.level?.value || 0)) * 2
            this.data.progress.current = Math.min(this.data.progress.current, this.progress.total)
        }
        this.computeProgress();
        this.getSaveData();
    }

    addMaedr(maedr : PillarsItem) {
        if (maedr.system.category?.value != "maedr")
            return
        
        this.data.maedrs.push(maedr.toObject());
        this.maedrs = this.data.maedrs.map(i => new PillarsItem(i))
        this.computeProgress();
    }

    removeMaedr(index : number) {
        this.data.maedrs.splice(index, 1);
        this.maedrs = this.data.maedrs.map(i => new PillarsItem(i))
        this.computeProgress();
    }

    validate(): string[] {
        let errors = [];
        if (this.progress.cost < this.data.maedrs.length)
        {
            errors.push("Insufficient Maedrs")
        }
        return errors;
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