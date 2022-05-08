import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData"
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { PillarsActor } from "../module/actor/actor-pillars";
import { PillarsItem } from "../module/item/item-pillars";

enum State {
    ADVANTAGED = "adv",
    NORMAL = "normal",
    DISADVANTAGED = "dis",
}

export interface CheckData {
        title : string
        modifier : string
        steps : number
        proxy : string
        assister : string
        state : State
        skillId : string
        skillName : string
        speaker : ChatSpeakerDataProperties
        targetSpeakers : ChatSpeakerDataProperties[],
        rollClass : string//this.constructor.name,
        rollMode : keyof CONFIG.Dice.RollModes
        messageId : string,
}

export interface WeaponCheckData extends CheckData{
    add : {}
    itemId : string
}

export interface PowerCheckData extends CheckData {
    sourceId : string
    itemId : string
}

export interface AgingCheckData {
    title : string,
    speaker : ChatSpeakerDataProperties
    modifier : string,
    lifestyle : string
}
export interface CheckOptions {
    name? : string,
    add? : {}
}

export interface DialogData {
    title : string
    modifier : string;
    steps : 0;
    changeList : PropertiesToSource<EffectChangeData>[];
    changes : PropertiesToSource<EffectChangeData>[];
    actor : PillarsActor,
    targets : Token[]
    rollModes : CONFIG.Dice.RollModes;
    rollMode : keyof CONFIG.Dice.RollModes;
    item : PillarsItem;
    options : CheckOptions;
    state : { normal?: boolean, adv? : boolean, dis? : boolean };
}

export interface SkillDialogData extends DialogData {
    assisters : AssisterData[],
    hasRank : boolean,
    skill : PillarsItem | undefined
}

export interface AgingDialogData {
    modifier: number;
    changeList: PropertiesToSource<EffectChangeData>[];
    changes: PropertiesToSource<EffectChangeData>[];
}

export interface WeaponDialogData extends SkillDialogData {

}

export interface PowerDialogData extends DialogData {
    hasRank : boolean,
}

export interface AssisterData {
    name : string,
    id : string,
    rank : number,
    die : string
}

export interface DamageOptions  {
    shield : boolean
}

