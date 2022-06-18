import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData"
import { getGame } from "../../pillars"
import { Time } from "../../types/common"
import { PillarsActor } from "../actor/actor-pillars"
import { PILLARS } from "./config"

export default class PILLARS_UTILITY {
  
    static getSkillRank(xp : number)
    {
        return Math.floor(Math.sqrt(2 * xp + 0.25) - 0.5)
    }

    static getPowerSourceLevel(xp : number)
    {
        return xp < 10 ? 0 : Math.floor(Math.sqrt(0.5 * xp + (1/16)) - (5/4))
    }

    static getPowerSourceAttackBonus(level : number)
    {
        return level * 2 + 2
    }

    static getPowerSourcePool(level : number)
    {
        if (level < 3)
        {
            if (level == 2) return level * 2
            else if (level == 1) return level * 2 + 1
            else return 0
        }
        else
            return level * 2 - 1
    }

    static getSpeaker(speaker : ChatSpeakerDataProperties | undefined) : PillarsActor | undefined{
        if (speaker)
        {
            try {
                if (speaker.actor)
                return getGame().actors!.get(speaker.actor)
                else if (speaker.token && speaker.scene)
                return getGame().scenes!.get(speaker.scene)?.tokens.get(speaker.token)?.actor!
                else
                throw getGame().i18n.localize("PILLARS.ErrorCannotFindSpeaker")
            }
            catch (e : unknown) {
                throw new Error(e as string)
            }
        }
    }

    static stepsToDice(steps : number)
    {
        steps = Math.abs(steps)
        if (steps >= 5)
            return {number : 1, faces : 12}
        else if (steps >= 3)
            return {number : 1, faces : 8}
        else if (steps >= 2)
            return {number : 1, faces : 6}
        else if (steps >= 1)
            return {number : 1, faces : 4}
        else return {}
    }

    static weaponSpecials() {
        return mergeObject(foundry.utils.deepClone(PILLARS.meleeSpecials), PILLARS.rangedSpecials)
    }

    /**
     * Returns true if timeA is later than timeB
     * @param timeA 
     * @param timeB 
     */
    static isLaterDate(timeA : Time, timeB : Time)
    {
        if (timeA.year > timeB.year)
        {
            return true
        }
        else if (timeA.year < timeB.year)
        {
            return false
        }
        else if (timeA.year == timeB.year)
        {
            return timeA.season > timeB.season
        }
    }
}