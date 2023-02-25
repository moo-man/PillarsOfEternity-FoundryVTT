import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { PillarsActor } from "../module/document/actor-pillars";
import { PillarsItem } from "../module/document/item-pillars";

export interface SeasonalActivityData {
    actor : PillarsActor
}

export type SeasonalActivityResolve = (value :  SeasonalActivityResult) => void

export interface SeasonalActivityResult {
    text : string, 
    data : Partial<ActorDataConstructorData>
}

export interface XPAllocationData extends SeasonalActivityData {
    experience : number | undefined
}

export interface XPAllocationTemplateData {
    lists : Record<string, {label : string, items : PillarsItem[]}>
    experience : number | undefined
    editableExperience : boolean
}

export interface PracticeTemplateData {
    skills : PillarsItem[]
}


export enum ENCHANTMENT_STATE {NOT_STARTED, IN_PROGRESS, FINISHED}


