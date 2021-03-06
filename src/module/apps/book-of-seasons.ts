import { getGame } from '../../pillars';
import { SeasonData } from '../../types/common';
import { PillarsActor } from '../actor/actor-pillars';
import { PILLARS } from '../system/config';
import SeasonalActivityMenu from './seasonal/activity-menu';
import SeasonalActivityApplication from './seasonal/seasonal-activity';

export default class BookOfSeasons extends Application {
  actor?: PillarsActor;
  constructor(actor: PillarsActor) {
    super();
    this.actor = actor;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'seasons',
      template: 'systems/pillars-of-eternity/templates/apps/book-of-seasons.html',
      height: 900,
      width: 400,
      title: getGame().i18n.localize("PILLARS.BookOfSeasons"),
      resizable: true,
      scrollY: ['.season-list'],
    });
  }

  getData() {
    let data: {
      seasons?: (SeasonData & { index?: number; current?: string })[];
      actor?: PillarsActor;
      seasonsNeedUpdating?: Record<string, boolean> | boolean;
    } = {};

    let currentTime = getGame().settings.get('pillars-of-eternity', 'season');
    data.seasons = duplicate(this.actor!.seasons);
    data.seasons.forEach((s, i) => {
      s.index = i;
      if (s.year == currentTime.year) {
        s.current = PILLARS.seasons[currentTime.season].toLowerCase(); // TODO make this better
      }
      // s.needsUpdating = {
      //     "autumn" : seasonsNeedUpdating[`${s.year}-autumn`] || false,
      //     "spring" : seasonsNeedUpdating[`${s.year}-spring`] || false,
      //     "summer" : seasonsNeedUpdating[`${s.year}-summer`] || false,
      //     "winter" : seasonsNeedUpdating[`${s.year}-winter`] || false,
      // }
    });
    data.seasons.reverse();
    data.actor = this.actor!;

    return data;
  }

  checkAlerts() {
    let seasonsNeedUpdating = this.actor?.seasonsNeedUpdating as Record<string, boolean>;

    let elements = this.element.find<HTMLDivElement>('.alert');

    elements.each((i, element) => {
      let time = element.dataset['target']!;

      if (seasonsNeedUpdating[time]) element.style.display = '';
      else element.style.display = 'none';
    });
  }

  static indexToYear(index: number, actor : PillarsActor): number {
    return actor?.seasons![index]?.year || -1;
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    html.find('.add-season').on('click', async (ev: JQuery.ClickEvent) => {
      ev.preventDefault();
      let seasons = duplicate(this.actor!.seasons);

      seasons.push({
        year: (seasons[seasons.length - 1]?.year || 0) + 1,
        spring: '',
        summer: '',
        autumn: '',
        winter: '',
        aging: '',
      });

      await this.actor!.update({ 'data.seasons': seasons });
      this.render(true);
    });

    html.find('.alert').on('click', async (ev: JQuery.ClickEvent) => {
      let target = ev.currentTarget.dataset['target'];
      let index = parseInt(target.split('-')[0]);
      if (target.includes('aging')) {
        let year = BookOfSeasons.indexToYear(index, this.actor!);
        let roll = await this.actor?.setupAgingRoll(year);
        await roll?.rollCheck();
        await roll?.sendToChat();
        this.render(true);
      } else {
        new SeasonalActivityMenu({ actor: this.actor!, index, season: target.split('-')[1] }).render(true);
      }
    });

    html.find('input').on('change', (ev: JQuery.ChangeEvent) => {
      let name = ev.target.name.split('-');
      let index = parseInt(name[0] || '');
      let key = name[1] as keyof SeasonData;
      let seasons = foundry.utils.deepClone(this.actor?.seasons);
      let val: string | number = ev.target.value;
      if (Number.isNumeric(val)) val = parseInt(val.toString());
      if (seasons![index] && key) {
        setProperty(seasons![index]!, key, val);
        //seasons[index][type] = val // TODO figure this out1`
      }
      return this.actor?.update({ 'data.seasons': seasons }).then((actor) => {
        this.checkAlerts();
      });
    });

    this.checkAlerts();
  }
}
