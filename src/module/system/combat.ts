import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs"
import EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs"
import { CombatData, CombatDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/combatData"
import { PillarsCombatant } from "./combatant"

export class PillarsCombat extends Combat {

    async _preCreate(data: CombatDataConstructorData, options: DocumentModificationOptions, user: User) 
    {
        await super._preCreate(data, options, user)
        this.data.update({"flags.pillars-of-eternity.phase": 0})
    }

    async _preUpdate(data: CombatDataConstructorData, options: DocumentModificationOptions, user: User)
    {
        await super._preUpdate(data, options, user)

        if (data.turn == 0 && data.round! > 1 && this.phase == 0)
        {
            data.round = data.round! - 1
            setProperty(data, "flags.pillars-of-eternity.phase",  1)
        }
        else if (data.turn == 0 && data.round! > 1 && this.phase == 1)
        {
            setProperty(data, "flags.pillars-of-eternity.phase", 0)
            data.combatants = this.combatants.map(c => c.resetMoveCounter())
        }
    }

    get combatants() : EmbeddedCollection<typeof PillarsCombatant, CombatData> {
        return super.combatants as EmbeddedCollection<typeof PillarsCombatant, CombatData>
    }

    setupTurns() {
        super.setupTurns()
        if (this.phase == 0)
            this.turns.reverse()
        return this.turns
    }

    _sortCombatants(...args : Parameters<Combat["_sortCombatants"]>) {
        if (args[0].combat?.round == 0) // this function isn't bound so can't access `this`
            return 0
        else return super._sortCombatants(...args)
    }

    async startCombat() {
        await super.startCombat();
        this.setupTurns(); // Now that combat has started, sort combatants
        ui.sidebar!.tabs.combat!.render(true) // Rerender to show sort
        return this

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

Hooks.on("updateCombat", (combat : Combat, data : Record<string, unknown>) => {
    if (hasProperty(data, "flags.pillars-of-eternity.phase"))
        combat.setupTurns()
})