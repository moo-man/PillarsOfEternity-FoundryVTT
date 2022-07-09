import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData"
import { PillarsActor } from "../module/actor/actor-pillars"
import { PillarsItem } from "../module/item/item-pillars"

export interface SeasonalActivityData {
    actor : PillarsActor
}

export interface SeasonalActivityResult {
    text : string, 
    data : ActorDataConstructorData
}

export interface AdventureActivityData extends SeasonalActivityData {
    experience : number | undefined
}

export interface AdventureTemplateData {
    skills : PillarsItem[],
    connections : PillarsItem[],
    powerSources : PillarsItem[],
    experience : number | undefined
    editableExperience : boolean
}