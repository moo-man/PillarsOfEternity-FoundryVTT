import { getGame } from '../../../pillars';
import { ItemType } from '../../../types/common';
import { XPAllocationTemplateData, SeasonalActivityResult } from '../../../types/seasonal-activities';
import XPAllocationActivity from './xp-allocation';

export default class AdventureSeasonalActivity extends XPAllocationActivity {

  get title() {
    return "Allocate Experience"
  }
  
  static get label(): string {
    return getGame().i18n.localize('PILLARS.Adventure');
  }

  async getData() : Promise<XPAllocationTemplateData> {
    let data = await super.getData() as XPAllocationTemplateData;
    let game = getGame();
    data.lists.skills = {label : game.i18n.localize("PILLARS.Skills"), items :  this.actor.getItemTypes(ItemType.skill).filter(i => i.used?.value)}
    data.lists.connections = {label : game.i18n.localize("PILLARS.Connections"), items :  this.actor.getItemTypes(ItemType.connection).filter(i => i.used?.value)}
    data.lists.powerSources = {label : game.i18n.localize("PILLARS.PowerSources"), items :  this.actor.getItemTypes(ItemType.powerSource).filter(i => i.used?.value)}
    return data
}

  submit(): SeasonalActivityResult {
    let result = super.submit();
    result.text = "Adventure: " + result.text

    if (this.resolve)
      this.resolve(result);
    return result
  };
}


