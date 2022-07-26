import { getGame } from '../../../pillars';
import { ItemType } from '../../../types/common';
import { XPAllocationTemplateData, SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsItem } from '../../item/item-pillars';
import PILLARS_UTILITY from '../../system/utility';
import XPAllocationActivity from './xp-allocation';

export default class LivingOffLandSeasonalActivity extends XPAllocationActivity {


  get skills() {return ["Athletics", "Stealth", "Awareness", "Swimming", "Survival", "Navigation", "Cooking", "Herbalism", "Fishing", "Hunting", "Trapping"]}

  get title() {
    return "Allocate Experience"
  }
  
  static get label(): string {
    return getGame().i18n.localize('PILLARS.LivingOffTheLand');
  }
  
  async setItems() {
    let items = (await Promise.all(this.skills.map(s => PILLARS_UTILITY.findSkillName(s, this.actor) as Promise<PillarsItem>))).filter(i => i)
    let collection = new Collection(items.map(i => [i.id!, i]))
    return collection
  }

  async getData() : Promise<XPAllocationTemplateData> {
    let data = await super.getData() as XPAllocationTemplateData;
    let game = getGame();

    let items = await this.items

    data.editableExperience = false;
    data.experience = 14;
    data.lists.skills = {label : game.i18n.localize("PILLARS.Skills"), items : items.contents}
    return data
}

  async submit(): Promise<SeasonalActivityResult> {
    let result = await super.submit();
    result.text = getGame().i18n.localize('PILLARS.LivingOffTheLand') + ": " + result.text

    if (this.resolve)
      this.resolve(result);
    return result
  };


  async checkData() : Promise<{errors : string[], message : string}>{

    let state = await super.checkData();
    
    if (await this.checkRequisiteSkills())
    {
      this.hideAlert(this.alerts.general);
    }
    else 
    {
        this.showAlert(this.alerts.general);
        if (this.alerts.general) this.alerts.general!.title = 'Requisite Skills for this activity not met';
        state.errors.push('Requisite Skills for this activity not met');
    }

    
    state.message = getGame().i18n.format('PILLARS.XPAllocationErrors', { errors: `<ul>${'<li>' + state.errors.join('</li><li>') + '</li>'}</ul>` })

    return state;
  }


  async checkRequisiteSkills() : Promise<boolean> {
    let items = await this.items
    let survival = items.find(i => i.name == "Survival")?.rank || 0
    let navigation = items.find(i => i.name == "Navigation")?.rank || 0
    let forecasting = items.find(i => i.name == "Forecasting")?.rank || 0
    let cooking = items.find(i => i.name == "Cooking")?.rank || 0
    let herbalism = items.find(i => i.name == "Herbalism")?.rank || 0
    let fishing = items.find(i => i.name == "Fishing")?.rank || 0
    let hunting = items.find(i => i.name == "Hunting")?.rank || 0
    let trapping = items.find(i => i.name == "Trapping")?.rank || 0

    if (survival < 5)
      return false

    if (navigation < 3 || forecasting < 3 || cooking < 3)
      return false

    if (herbalism < 3 && fishing < 3 && hunting < 3 && trapping < 3)
      return false

    return true
  }




}