import { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData"

export interface ConfigEffect {
    id?: string,
    label: string,
    icon: string,
    changes: EffectChangeData[]
    flags: EffectFlags
}


interface EffectFlags {
    "pillars-of-eternity": {
        changeCondition : {
            [key : number] : {description : string, script : string}
        }
    }
}

