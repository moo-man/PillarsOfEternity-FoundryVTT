import { getGame } from "../../system/utility";
import { ItemType } from "../../../types/common";
import { XPAllocationTemplateData, SeasonalActivityResult } from "../../../types/seasonal-activities";
import XPAllocationActivityApplication from "./xp-allocation";

export default class AdventureSeasonalActivityApplication extends XPAllocationActivityApplication 
{

    get title() 
    {
        return "Allocate Experience";
    }
  
    static get label(): string 
    {
        return getGame().i18n.localize("PILLARS.Adventure");
    }


    async getData() : Promise<XPAllocationTemplateData> 
    {
        const data = await super.getData() as XPAllocationTemplateData;
        const game = getGame();

    
        const time = game.pillars.time.current;

        data.experience = time.context?.adventure?.experience;
        data.editableExperience = !data.experience;

        data.lists.skills = {label : game.i18n.localize("PILLARS.Skills"), items :  this.actor.getItemTypes(ItemType.skill).filter(i => i.system.used?.value)};
        data.lists.connections = {label : game.i18n.localize("PILLARS.Connections"), items :  this.actor.getItemTypes(ItemType.connection).filter(i => i.system.used?.value)};
        data.lists.powerSources = {label : game.i18n.localize("PILLARS.PowerSources"), items :  this.actor.getItemTypes(ItemType.powerSource).filter(i => i.system.used?.value)};
        return data;
    }

    async submit(): Promise<SeasonalActivityResult> 
    {
        const result = await super.submit();
        result.text = "Adventure: " + result.text;

        if (this.resolve)
        {this.resolve(result);}
        return result;
    }
}


