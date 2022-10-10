import { getGame } from "../system/utility"
import { Season, SeasonContextData, Time } from '../../types/common';
import { PILLARS } from '../system/config';

export default class TimeTracker extends Application<ApplicationOptions> {
  constructor() {
    super();
  }


  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'time-tracker',
      template: 'systems/pillars-of-eternity/templates/apps/time-tracker.html',
      title : "Time Tracker", // Needed to prevent _replaceHTML error
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

  async changeTime(season: number, year: number = 0) {
    let game = getGame();
    let current = game.settings.get('pillars-of-eternity', 'season');
    let next = duplicate(current)
    let latest = game.settings.get('pillars-of-eternity', 'latestSeason');

    let yearChange = 0;

    yearChange = year + Math.floor((next.season + season)/ 4);
    next.season = (next.season + season) % 4;
    if (next.season < 0) next.season += 4;

    next.year += yearChange;

    next.context = {}

    if (TimeTracker.isLaterDate(next, latest))
    {
      next.context.latest = true;
      await game.settings.set("pillars-of-eternity", "latestSeason", next)
      await this.promptSeasonContext(next)
    }
    else next.context.latest = false;

    game.settings.set('pillars-of-eternity', 'season', next).then(() => {
      this.render(true);
    });
  }

  promptSeasonContext(time : { season: Season; year: number; context? : SeasonContextData}) {
    
    let game = getGame()
    let current = game.settings.get('pillars-of-eternity', 'season');
    if (TimeTracker.isLaterDate(time, current))
    {
      return new Promise((resolve : (value : ClientSettings.Values["pillars-of-eternity.season"]) => void) => {
        new Dialog({
          title : game.i18n.localize("PILLARS.SeasonContext"),
          content : `
          <p>${game.i18n.localize("PILLARS.SeasonContextData")}</p>
          <div class="form-group">
            <label>${game.i18n.localize("PILLARS.SeasonContextAdventure")}</label>
            <div class="form-fields">
              <input class="adventure-name" type="text">
            </div>
          </div>
          <div class="form-group">
            <label>${game.i18n.localize("PILLARS.SeasonContextXP")}</label>
            <div class="form-fields">
              <input class="adventure-xp" type="number">
            </div>
          </div>
          `,
          buttons: {
            confirm : {
              label : game.i18n.localize("Confirm"),
              callback : (dlg) => {
                dlg = $(dlg);
                let adventureName = dlg.find<HTMLInputElement>(".adventure-name")[0]?.value || ""
                let xp = Number(dlg.find<HTMLInputElement>(".adventure-xp")[0]?.value) || 0;
                time.context!.adventure = {
                    name: adventureName,
                    experience : xp
                  }
                resolve(time);
              }
            },
            skip : {
              label : game.i18n.localize("PILLARS.Skip"),
              callback : (dlg) => resolve(time),
            }
          }
        }).render(true)
      })
    }
  }

  /**
   * 
   * Returns true if dateA is later than dateB
   * 
   * @param dateA year and season
   * @param dateB year and season
   */
  static isLaterDate(dateA : Time, dateB : Time)
  {
    if (dateA.year > dateB.year)
      return true;
    else if (dateA.year < dateB.year)
      return false
    else if (dateA.year == dateB.year)
      return dateA.season > dateB.season
  }

  static formatSeasonData(data: { season: Season; year: number }): { season: string; year: number } {
    return { season: PILLARS.seasons[data.season], year: data.year };
  }


  checkFirstTimeStartup() {
    let game = getGame()
    if (game.user?.isGM)
    {
      let currentTime = game.settings.get('pillars-of-eternity', 'season');
      if (currentTime.year == -1)
      {
        new Dialog({
          title : game.i18n.localize("PILLARS.SetStartingYear"),
          content : `<p>${game.i18n.localize("PILLARS.SetStartingYearPrompt")}: </p><input type='number'>`,
          buttons: {
            confirm : {
              label : game.i18n.localize("Confirm"),
              callback : (dlg) => {
                dlg = $(dlg);
                let year = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0;
                game.settings.set('pillars-of-eternity', 'season', {year, season: currentTime.season}).then(() => {
                  this.render(true); 
                })
              }
            }
          }
        }).render(true)
      }
    }
  }
}
