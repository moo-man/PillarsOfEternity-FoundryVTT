export default class PILLARS_UTILITY {
  
    static getSkillRank(xp)
    {
        return Math.floor(Math.sqrt(2 * xp + 0.25) - 0.5)
    }

    static getPowerSourceLevel(xp)
    {
        return xp < 10 ? 0 : Math.floor(Math.sqrt(0.5 * xp + (1/16)) - (5/4))
    }

    static getSpeaker(speaker) {
        try {
            if (speaker.actor)
                return game.actors.get(speaker.actor)
            else if (speaker.token && speaker.scene)
                return game.scenes.get(speaker.scenes).tokens.get(speaker.token)
            else
                throw "Could not find speaker"
        }
        catch (e) {
            throw new Error(e)
        }

    }

    static stepsToDice(steps)
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
        else return ""
    }

}