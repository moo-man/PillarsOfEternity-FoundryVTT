import { getGame } from "../../../pillars";
import { SeasonalActivityResult } from "../../../types/seasonal-activities";
import { PillarsActor } from "../../actor/actor-pillars";
import BookOfSeasons from "../book-of-seasons";
import SeasonalActivity from "./seasonal-activity";

export default class SeasonalActivityMenu extends FormApplication<FormApplicationOptions, {activities : string[]}, {actor : PillarsActor, index : number, season: string}> {

  activities : typeof SeasonalActivity[] = []

  resultData? : SeasonalActivityResult

  constructor(object : {actor : PillarsActor, index : number, season: string})
  {
    super(object);
    this.activities = getGame().pillars.seasonalActivities
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'activity-menu',
      template: 'systems/pillars-of-eternity/templates/apps/seasonal/activity-menu.html',
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
      let promise = await this.object.actor?.updateSeasonIndex(this.object.index, this.object.season, formData!["activity"] || "")
      this.object.actor.book.render();
      if (this.resultData)
      {
        await this.object.actor.update(this.resultData.data);
        await this.object.actor.clearUsed();
      }
      return promise
  }

  activateListeners(html: JQuery<HTMLElement>): void {
      super.activateListeners(html)

      html.find(".activity-select").on("change", async (ev : JQuery.ChangeEvent)=> {
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
