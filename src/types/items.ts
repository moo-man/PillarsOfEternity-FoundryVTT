import { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { PillarsItem } from "../module/document/item-pillars";
import { PowerGroups } from "./powers";

export interface ItemChatData {
    item : PillarsItem,
    chatData : ChatMessageDataConstructorData
    text : string,
    groups? : PowerGroups
}

export interface WeaponSpecial {
    name : string,
    value : string
}

export interface WeaponSpecialData 
{
    label: string,
    description: string,
    hasValue: boolean,
    skilled: boolean,
    value? : string
}

export interface BondTrait {
    name : string,
    description: string
    active?: boolean
    key : string
}