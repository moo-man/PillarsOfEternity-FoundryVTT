import { EffectChangeData, EffectChangeDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import PillarsActiveEffect from "../module/document/effect-pillars";

export interface ConfigEffect {
    id?: string,
    label: string,
    icon: string,
    changes: EffectChangeData[]
    flags: EffectFlags
}

export interface PillarsEffectChangeDataProperties extends EffectChangeDataProperties {
    conditional : {description : string, script : string}
    document : PillarsActiveEffect
    target: boolean
    index : number[]
}

type PillarsChangeCondition = {description : string, script : string}


interface EffectFlags {
    "pillars-of-eternity": {
        changeCondition : {
            [key : number] : PillarsChangeCondition
        }
    }
}

