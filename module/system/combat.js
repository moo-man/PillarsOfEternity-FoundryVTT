
export class PillarsCombat extends Combat {
    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user)
        this.data.update({"flags.pillars-of-eternity.phase": 0})
    }

    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user)

        if (data.turn == 0 && data.round > 1 && this.phase == 0)
        {
            data.round = data.round - 1
            data["flags.pillars-of-eternity.phase"] = 1
        }
        else if (data.turn == 0 && data.round > 1 && this.phase == 1)
            data["flags.pillars-of-eternity.phase"] = 0
    }

    setupTurns() {
        super.setupTurns()
        if (this.phase == 0)
            this.turns.reverse()
    }

    get template() {
        return "systems/pillars-of-eternity/templates/apps/combat-tracker.html"
    }

    get phase() {
        return this.getFlag("pillars-of-eternity", "phase")
    }

    get Phase() {
        return this.phase == 0 ? "Move" : "Action"
    }
}

Hooks.on("updateCombat", (combat, data) => {
    if (hasProperty(data, "flags.pillars-of-eternity.phase"))
        combat.setupTurns()
})