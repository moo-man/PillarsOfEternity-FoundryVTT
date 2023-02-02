import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { getGame } from "../../system/utility";
import { SeasonalActivityResult } from "../../../types/seasonal-activities";
import { PillarsActor } from "../../actor/actor-pillars";
import BookOfSeasons from "../book-of-seasons";
import SeasonalActivityApplication from "./seasonal-activity";

export default class SeasonalActivityMenu extends FormApplication<FormApplicationOptions, {activities : string[]}, {actor : PillarsActor, index : number, season: string}> {

  activities : typeof SeasonalActivityApplication[] = []

  resultData? : SeasonalActivityResult

  constructor(object : {actor : PillarsActor, index : number, season: string})
  {
    super(object);
    this.activities = getGame().pillars.seasonalActivities
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'activity-menu',
      template: 'systems/pillars-of-eternity/templates/apps/seasonal/activity-menu.hbs',
      width: 500,
      title: getGame().i18n.localize("PILLARS.SeasonalActivity"),
    });
  }

  async getData(options?: Partial<FormApplicationOptions> | undefined) {
      let data = await super.getData();
      data.activities = this.activities.map(i => i.label);
      return data
  }

  async _updateObject(event: Event, formData?: Record<string, string>): Promise<unknown> {
      let promise = await getGame().pillars.time.updateSeasonAtIndex(this.object.actor, this.object.index, this.object.season, formData!["activity"] || "")
      if (this.resultData)
      {

        // Need to separate out items because https://github.com/foundryvtt/foundryvtt/issues/5241
        // Enchantment adds embedded powers, which needs to go through _onCreate to add to the actor, 
        // which meants createEmbeddedDocuments needs to be called as actor.update({items : [...]}) won't call _onCreate
        let createdItems = (this.resultData.data.items || []).filter(i => !this.object.actor.items.has(i?._id!)) as ItemDataConstructorData[]
        let updatedItems = (this.resultData.data.items || []).filter(i => this.object.actor.items.has(i?._id!)) as ItemDataConstructorData[]
        if (createdItems.length)
          await this.object.actor.createEmbeddedDocuments("Item", createdItems as any)
        if(updatedItems.length)
          await this.object.actor.updateEmbeddedDocuments("Item", updatedItems as any);
        delete this.resultData.data.items
        await this.object.actor.update(this.resultData.data);
        await this.object.actor.clearUsed();
      }
      this.object.actor.book.render(true);
      return promise
  }

  activateListeners(html: JQuery<HTMLElement>): void {
      super.activateListeners(html)

      html.find(".activity-buttons button").on("click", async (ev : JQuery.ClickEvent)=> {
        if (!ev.currentTarget.value)
          return
        let index = Number(ev.currentTarget.value);
        if (this.activities[index])
        {
            this.resultData = await this.activities[index]?.create({actor : this.object.actor})
            let activityInput = html.find<HTMLInputElement>("input[name='activity']")[0]
            if (activityInput)
              activityInput.value = this.resultData?.text || ""
        }
      })
  }
}
