import { ObjectAttributeBar } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/token";
import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { TokenDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tokenData";
import { PillarsCombatant } from "../document/combatant-pillars";

export default class PillarsTokenDocument extends TokenDocument 
{
    // V10 shim
    x : any;
    y : any;

    async _preUpdate(data: TokenDataConstructorData, options: DocumentModificationOptions, user: User) 
    {
        super._preUpdate(data, options, user);
        if ((data.x || data.y) && this.combatant) 
        {
            let distance = canvas?.grid!.measureDistances([{ ray: new Ray({ x: this.x, y: this.y }, { x: data.x || this.x, y: data.y || this.y }) }], { gridSpaces: true })[0] || 0; 
            distance = options.isUndo ? distance * -1 : distance;
            this.combatant.handleMovement(distance);
        }
    }

    getBarAttribute(...args : Parameters<TokenDocument["getBarAttribute"]>) 
    {
        const bar = super.getBarAttribute(...args);
        if (this.actor?.type == "headquarters")
        {return bar;}
    
        const data = foundry.utils.getProperty(this.actor?.system!, bar!.attribute);
        if (data.threshold?.incap) {(<ObjectAttributeBar>bar).max = data.threshold.incap + 1;}
        return bar;
    }

    get combatant() : PillarsCombatant 
    {
        return super.combatant as PillarsCombatant;
    }
}
