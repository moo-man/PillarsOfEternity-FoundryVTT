import { getGame } from '../../pillars';
import { Season } from '../../types/common';
import { PILLARS } from '../system/config';

export default class TimeTracker extends Application<ApplicationOptions> {
  constructor() {
    super();
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'time-tracker',
      template: 'systems/pillars-of-eternity/templates/apps/time-tracker.html',
      resizable: false,
    });
  }

  render(...args : Parameters<Application["render"]>)
  {
      let userPosition = getGame().settings.get("pillars-of-eternity", "seasonPosition")
      if (!args[1])
      {
        args[1] = {}
      }
      args[1]!.top = userPosition.top || 1000
      args[1]!.left = userPosition.left || 200
      return super.render(...args);
  }

  async _render(...args : Parameters<Application["_render"]>)
  {
    await super._render(...args)
    delete ui.windows[this.appId]
  }

  getData() {
    return TimeTracker.formatSeasonData(getGame().settings.get('pillars-of-eternity', 'season'));
  }

  setPosition(...args : Parameters<Application["setPosition"]>) {
      super.setPosition(...args)
      getGame().settings.set("pillars-of-eternity", "seasonPosition", {left : args[0]?.left || 200, top : args[0]?.top || 1000})
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    new Draggable(this, html, html[0]!, false)

    html.on('click', '.forward', this._onForwardClick.bind(this));
    html.on('click', '.backward', this._onBackwardClick.bind(this));
  }

  _onForwardClick(ev: JQuery.ClickEvent) {
    this.changeTime(1);
  }

  _onBackwardClick(ev: JQuery.ClickEvent) {
    this.changeTime(-1);
  }

  changeTime(season: number, year: number = 0) {
    let game = getGame();
    let currentTime = game.settings.get('pillars-of-eternity', 'season');

    let yearChange = 0;

    yearChange = year + Math.floor((currentTime.season + season)/ 4);
    currentTime.season = (currentTime.season + season) % 4;
    if (currentTime.season < 0) currentTime.season += 4;

    currentTime.year += yearChange;
    game.settings.set('pillars-of-eternity', 'season', currentTime).then(() => {
      this.render(true);
    });
  }

  static formatSeasonData(data: { season: Season; year: number }): { season: string; year: number } {
    return { season: PILLARS.seasons[data.season], year: data.year };
  }
}
