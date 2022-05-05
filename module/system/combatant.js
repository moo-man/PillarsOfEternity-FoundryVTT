
export class PillarsCombatant extends Combatant {
    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user)
        this.data.update({"flags.pillars-of-eternity.moveCounter": 0})
    }

    handleMovement(distance)
    {
        // Action phase, don't track movement
        if (this.combat.phase == 1)
            return 

        let current = this.getFlag("pillars-of-eternity", "moveCounter");
        current = Math.max(0, current + distance);
        return this.setFlag("pillars-of-eternity", "moveCounter", current);
    }

    resetMoveCounter() 
    {
        let data = this.toObject()
        data.flags["pillars-of-eternity"]["moveCounter"] = 0
        return data
    }

    get isRunning() {
        return this.getFlag("pillars-of-eternity", "moveCounter") > this.actor.stride.value;
    }

    getMoveData() 
    {
        return {
            running : this.isRunning,
            counter : this.getFlag("pillars-of-eternity", "moveCounter"),
            stride : this.actor.stride.value,
        }
    }
}