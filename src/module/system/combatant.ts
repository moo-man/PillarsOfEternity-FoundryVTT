import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { CombatantDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/combatantData";
import { PillarsCombat } from "./combat";

export class PillarsCombatant extends Combatant {
    async _preCreate(data: CombatantDataConstructorData, options: DocumentModificationOptions, user: foundry.documents.BaseUser) 
    {
        await super._preCreate(data, options, user)
        this.data.update({"flags.pillars-of-eternity.moveCounter": 0})
    }

    handleMovement(distance : number)
    {
        // Action phase, don't track movement
        if (this.combat?.phase == 1)
            return 

        let current : number = this.getFlag("pillars-of-eternity", "moveCounter") as number
        current = Math.max(0, current + distance);
        return this.setFlag("pillars-of-eternity", "moveCounter", current);
    }

    resetMoveCounter() 
    {
        let data = this.toObject()
        setProperty(data, "flags.pillars-of-eternity.moveCounter", 0)
        return data
    }

    get isRunning(): boolean {
        return <number>this.getFlag("pillars-of-eternity", "moveCounter") > (this.actor?.stride?.value || 0);
    }

    getMoveData() 
    {
        return {
            running : this.isRunning,
            counter : this.getFlag("pillars-of-eternity", "moveCounter") as number,
            stride : this.actor?.stride.value,
        }
    }

    get combat() : PillarsCombat {
        return super.combat as PillarsCombat
    }
}