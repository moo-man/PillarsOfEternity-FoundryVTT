import { getGame } from "../../system/utility";
import { ItemType } from '../../../types/common';
import { XPAllocationTemplateData, SeasonalActivityResult } from '../../../types/seasonal-activities';
import XPAllocationActivityApplication from './xp-allocation';

export default class SocializingSeasonalActivityApplication extends XPAllocationActivityApplication {

  get title() {
    return "Allocate Experience"
  }
  
  static get label(): string {
    return getGame().i18n.localize('PILLARS.Socializing');
  }

  
  async getData() : Promise<XPAllocationTemplateData> {
    let data = await super.getData() as XPAllocationTemplateData;
    let game = getGame();

    data.editableExperience = false;
    data.experience = 14;
    data.lists.skills = {label : game.i18n.localize("PILLARS.Skills"), items :  this.actor.getItemTypes(ItemType.skill).filter(i => i.category!.value == "social")}
    data.lists.connections = {label : game.i18n.localize("PILLARS.Connections"), items :  this.actor.getItemTypes(ItemType.connection)}
    data.lists.reputation = {label : game.i18n.localize("PILLARS.Reputation"), items :  this.actor.getItemTypes(ItemType.reputation)}
    return data
}

  async submit(): Promise<SeasonalActivityResult> {
    let result = await super.submit();
    result.text = "Socializing: " + result.text

    if (this.resolve)
      this.resolve(result);
    return result
  };
}


