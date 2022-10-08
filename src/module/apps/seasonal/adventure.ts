import { getGame } from "../../system/utility";
import { ItemType } from '../../../types/common';
import { XPAllocationTemplateData, SeasonalActivityResult } from '../../../types/seasonal-activities';
import XPAllocationActivityApplication from './xp-allocation';

export default class AdventureSeasonalActivityApplication extends XPAllocationActivityApplication {

  get title() {
    return "Allocate Experience"
  }
  
  static get label(): string {
    return getGame().i18n.localize('PILLARS.Adventure');
  }


  async getData() : Promise<XPAllocationTemplateData> {
    let data = await super.getData() as XPAllocationTemplateData;
    let game = getGame();

    
    let season = game.settings.get("pillars-of-eternity", "season")

    data.experience = season.context?.adventure?.experience
    data.editableExperience = !data.experience;

    data.lists.skills = {label : game.i18n.localize("PILLARS.Skills"), items :  this.actor.getItemTypes(ItemType.skill).filter(i => i.system.used?.value)}
    data.lists.connections = {label : game.i18n.localize("PILLARS.Connections"), items :  this.actor.getItemTypes(ItemType.connection).filter(i => i.system.used?.value)}
    data.lists.powerSources = {label : game.i18n.localize("PILLARS.PowerSources"), items :  this.actor.getItemTypes(ItemType.powerSource).filter(i => i.system.used?.value)}
    return data
}

    async submit(): Promise<SeasonalActivityResult> {
    let result = await super.submit();
    result.text = "Adventure: " + result.text

    if (this.resolve)
      this.resolve(result);
    return result
  };
}


