import { BookYearData } from "../../types/common";
import { Season, Time, TimeSettingData } from "../../types/time";
//@ts-ignore 
import { PillarsCharacterSheet } from "../apps/sheets/actor/character-sheet";
import BookOfSeasons from "../apps/book-of-seasons";
import SeasonalActivityMenu from "../apps/seasonal/activity-menu";
import TimeTracker from "../apps/time-tracker";
import { PILLARS } from "./config";
import { getGame } from "./utility";
import { PillarsActor } from "../document/actor-pillars";

export class TimeManager 
{
    tracker: TimeTracker | undefined = undefined;

    static timeKeyMap = {
        0 : "spring",
        1 : "summer",
        2 : "autumn",
        3 : "winter",
    };

    setup() 
    {
        this.tracker = new TimeTracker();
        this.tracker.render(true);
        this.checkFirstTimeStartup();
    }

    get current() 
    {
        const time  = getGame().settings.get("pillars-of-eternity", "time") as TimeSettingData & {key : typeof TimeManager.timeKeyMap[keyof typeof TimeManager.timeKeyMap], display : string};
        time.key = TimeManager.timeKeyMap[time.season];
        time.display = PILLARS.seasons[time.season];
        return time;
    }

    async changeTime(season: number, year = 0) 
    {
        const game = getGame();
        const current = game.pillars.time.current;
        const next = duplicate(current);
        const latest = game.settings.get("pillars-of-eternity", "latestTime");
    
        let yearChange = 0;
    
        yearChange = year + Math.floor((next.season + season)/ 4);
        next.season = (next.season + season) % 4;
        if (next.season < 0) {next.season += 4;}
    
        next.year += yearChange;
    
        next.context = {};
    
        if (TimeManager.isLaterTime(next, latest))
        {
            next.context.latest = true;
            await game.settings.set("pillars-of-eternity", "latestTime", next);
            await this.promptSeasonContext(next);
        }
        else {next.context.latest = false;}
    
        game.settings.set("pillars-of-eternity", "time", next);
    }

    handleTimeChange(time : TimeSettingData)
    {
        const game = getGame();
        this.tracker!.render(true);
        this.refreshTimeSensitiveApps();
        
        if (!game.user!.isGM && game.user?.character && time.context?.latest)
        {
            this.handleCharacterSeasonChange(game.user.character);
        }
        else if (game.user!.isGM)
        {
            game.pillars.headquarters.activeHeadquarters.forEach(hq => 
            {
                this.handleHeadquartersSeasonChange(hq);
            });
        }
    }

    refreshTimeSensitiveApps() 
    {
        const windows = Object.values(ui.windows);   
        windows.forEach(w => 
        {

            // We don't rerender actor sheets (as this can disrupt player inputs), only edit the DOM directly
            if (w instanceof PillarsCharacterSheet)
            {
                if ((w as any).object.type == "character")
                {
                    (w as any).checkSeasonAlerts();
                }
            }
            // Ok to rerender BookOfSeasons
            else if (w instanceof BookOfSeasons)
            {
                w.render();
                // w.checkAlerts();
            }
        });
    }


    promptSeasonContext(time : TimeSettingData) 
    {
        const game = getGame();
        return new Promise((resolve : (value : ClientSettings.Values["pillars-of-eternity.time"]) => void) => 
        {
            new Dialog({
                title : game.i18n.localize("PILLARS.SeasonContext"),
                content : `
            <p>${game.i18n.localize("PILLARS.SeasonContextData")}</p>
            <form>
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
            </form>
            `,
                buttons: {
                    confirm : {
                        label : game.i18n.localize("Confirm"),
                        callback : (dlg) => 
                        {
                            dlg = $(dlg);
                            const adventureName = dlg.find<HTMLInputElement>(".adventure-name")[0]?.value || "";
                            const xp = Number(dlg.find<HTMLInputElement>(".adventure-xp")[0]?.value) || 0;
                  time.context!.adventure = {
                      name: adventureName,
                      experience : xp
                  };
                  resolve(time);
                        }
                    },
                    skip : {
                        label : game.i18n.localize("PILLARS.Skip"),
                        callback : (dlg) => resolve(time),
                    }
                },
                default: "confirm"
            }).render(true);
        });
    }

    checkFirstTimeStartup() 
    {
        const game = getGame();
        if (game.user?.isGM)
        {
            const currentTime = this.current;
            if (currentTime.year == -1)
            {
                new Dialog({
                    title : game.i18n.localize("PILLARS.SetStartingYear"),
                    content : `<p>${game.i18n.localize("PILLARS.SetStartingYearPrompt")}: </p><input type='number'>`,
                    buttons: {
                        confirm : {
                            label : game.i18n.localize("Confirm"),
                            callback : (dlg) => 
                            {
                                dlg = $(dlg);
                                const year = Number(dlg.find<HTMLInputElement>("input")[0]?.value) || 0;
                                game.settings.set("pillars-of-eternity", "time", {year, season: currentTime.season}).then(() => 
                                {
                                    this.tracker?.render(true); 
                                });
                            }
                        }
                    }
                }).render(true);
            }
        }
    }


    /**
   * Compares the current time in the world settings and returns the index-season values that need updating
   */
    seasonsNeedUpdating(actor : PillarsActor): Record<string, boolean> | boolean 
    {
        const needsUpdating: Record<string, boolean> = {};
        const game = getGame();
        if (actor.type == "character") 
        {
      actor.system.seasons!.forEach((s: BookYearData, i : number) => 
      {
          if (Number.isNumeric(s.year)) 
          {
              if (!s.spring && game.pillars.time.isLater({ season: Season.SPRING, year: s.year! })) 
              {
                  needsUpdating[`${i}-spring`] = true;
              }
              if (!s.summer && game.pillars.time.isLater({ season: Season.SUMMER, year: s.year! })) 
              {
                  needsUpdating[`${i}-summer`] = true;
              }
              if (!s.autumn && game.pillars.time.isLater({ season: Season.AUTUMN, year: s.year! })) 
              {
                  needsUpdating[`${i}-autumn`] = true;
              }
              if (!s.winter && game.pillars.time.isLater({ season: Season.WINTER, year: s.year! })) 
              {
                  needsUpdating[`${i}-winter`] = true;
              }
              if (!s.aging && game.pillars.time.isLater({ season: Season.WINTER, year: s.year! })) 
              {
                  needsUpdating[`${i}-aging`] = true;
              }
          }
      });
      return foundry.utils.isObjectEmpty(needsUpdating) ? false : needsUpdating;
        }
        else {return false;} // If not character, return false
    }


    /**
   * Helper method to easily update seasonal data
   *
   * @param year Number - year being updated
   * @param type Property being updated, such as `aging` or `winter`
   * @param message Value being added to the property
   * @returns
   */
    updateSeasonAtYear(actor : PillarsActor, year: number, seasonKey: "spring" | "summer" | "autumn" | "winter" | "aging", message: string) 
    {
        if (actor.data.type == "character") 
        {
            const seasons = duplicate(actor.system.seasons);
            const index = seasons.findIndex((s : BookYearData) => s.year == year);

            // Add year if it doesn't exist
            if (index == -1)
            {
                const seasons = duplicate(actor.system.seasons);
                const seasonData = {
                    year,
                    spring : "",
                    summer : "",
                    autumn : "",
                    winter : "",
                    aging : "",
                };
                seasonData[seasonKey] = message;
                seasons.push(seasonData);
                actor.update({"system.seasons" : seasons});
            }
            // OTherwise update at index
            else {return this.updateSeasonAtIndex(actor, index, seasonKey, message);}
        } 
    }
    
    /**
       * Helper method to easily update seasonal data
       *
       * @param index index of the season being updated
       * @param type Property being updated, such as `aging` or `winter`
       * @param message Value being added to the property
       * @returns
       */
    updateSeasonAtIndex(actor : PillarsActor, index: number, seasonKey: string, message: string) 
    {
        if (actor.data.type == "character") 
        {
            const seasons = duplicate(actor.system.seasons);
            const season = seasons[index];
    
            if (season) 
            {
                setProperty(season, seasonKey, message);
                return actor.update({ "system.seasons": seasons }).then(() => 
                {
                    actor.book.render(true);
                });
            }
            else {throw new Error(getGame().i18n.format("PILLARS.ErrorSeasonIndex", { index }));}
        }
    }
    
    async handleCharacterSeasonChange(actor: PillarsActor) 
    {
        const game = getGame();
        const needsUpdating = Object.keys(this.seasonsNeedUpdating(actor) || {}).reverse();
        // ex. 3-winter, 2-summer
        const mostRecentSeason = needsUpdating[0]?.split("-");
        const aging = mostRecentSeason?.[1] == "winter" || mostRecentSeason?.[1] == "aging";
    
        // Prevent trying to update Aging section with normal seasonal activities
        if (aging && mostRecentSeason) 
        {
            mostRecentSeason[1] = "winter";
        }
    
        if (aging) 
        {
            const roll = await actor.setupAgingRoll(BookOfSeasons.indexToYear(Number(mostRecentSeason?.[0]), actor));
            await roll?.rollCheck();
            await roll?.sendToChat();
        }
    
        if (mostRecentSeason) 
        {
            Dialog.confirm({
                title: game.i18n.localize("PILLARS.NewSeason"),
                content: `<p>${game.i18n.localize("PILLARS.NewSeasonPrompt")}</p>`,
                yes: () => new SeasonalActivityMenu({ actor, index: Number(mostRecentSeason?.[0]), season: mostRecentSeason?.[1]! }).render(true),
                no: () => {},
            });
        }
    }

    async handleHeadquartersSeasonChange(actor: PillarsActor) 
    {
        const game = getGame();

        if (game.pillars.time.current.season == Season.WINTER && game.pillars.time.current.context?.latest)
        {
            actor.update(actor.system.performUpkeep());
        }
    }

    currentSeasonDataFor(actor : PillarsActor) 
    {
        if (actor.data.type != "character")
        {return;}

        const time = getGame().pillars.time.current;
        const year = actor.system.seasons.find((i : BookYearData) => i.year == time.year);
        return year?.[time.key];        
    }
    
    isLater(time : Time)
    {
        return TimeManager.isLaterTime(this.current, time);
    }

    /**
       * 
       * Returns true if dateA is later than dateB
       * 
       * @param dateA year and season
       * @param dateB year and season
       */
    static isLaterTime(dateA : Time, dateB : Time)
    {
        if (dateA.year > dateB.year)
        {return true;}
        else if (dateA.year < dateB.year)
        {return false;}
        else if (dateA.year == dateB.year)
        {return dateA.season > dateB.season;}
    }

}