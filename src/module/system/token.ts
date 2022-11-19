import { ObjectAttributeBar } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/token';
import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { TokenDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tokenData';
import { PillarsCombatant } from './combatant';

export default class PillarsTokenDocument extends TokenDocument {
  async _preUpdate(data: TokenDataConstructorData, options: DocumentModificationOptions, user: User) {
    super._preUpdate(data, options, user)
    if ((data.x || data.y) && this.combatant) {
      let distance = canvas?.grid!.measureDistances([{ ray: new Ray({ x: this.data.x, y: this.data.y }, { x: data.x || this.data.x, y: data.y || this.data.y }) }], { gridSpaces: true })[0] || 0; 
      distance = options.isUndo ? distance * -1 : distance;
      this.combatant.handleMovement(distance);
    }
  }

  getBarAttribute(...args : Parameters<TokenDocument["getBarAttribute"]>) {
    let bar = super.getBarAttribute(...args);
    if (this.actor?.type == "headquarters")
      return bar
    
    let data = foundry.utils.getProperty(this.actor?.system!, bar!.attribute);
    if (data.threshold?.incap) (<ObjectAttributeBar>bar).max = data.threshold.incap + 1;
    return bar;
  }

  get combatant() : PillarsCombatant {
    return super.combatant as PillarsCombatant
  }
}
