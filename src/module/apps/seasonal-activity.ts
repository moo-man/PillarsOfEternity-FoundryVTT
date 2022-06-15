import { getGame } from '../../pillars';
import { SeasonData } from '../../types/common';
import { PillarsActor } from '../actor/actor-pillars';
import { PILLARS } from '../system/config';
import BookOfSeasons from './book-of-seasons';

export default class SeasonalActivity extends FormApplication<FormApplicationOptions, {}, {book : BookOfSeasons, index : number, season: string}> {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'seasonal-activity',
      template: 'systems/pillars-of-eternity/templates/apps/seasonal-activity.html',
      width: 500,
      title: 'Seasonal Activity',
    });
  }

  async _updateObject(event: Event, formData?: Record<string, string>): Promise<unknown> {
      let promise = await this.object.book.actor?.updateSeasonIndex(this.object.index, this.object.season, formData!["activity"] || "")
      this.object.book.render();
      return promise
  }
}
