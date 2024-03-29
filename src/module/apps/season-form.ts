import { getGame } from "../system/utility";
import { PillarsActor } from "../document/actor-pillars";

export default class SeasonForm extends FormApplication<any, any, any>
{
    static get defaultOptions() 
    {
        return mergeObject(super.defaultOptions, {
            template : "systems/pillars-of-eternity/templates/apps/season-form.hbs",
            width:420
        });
    }

    async getData() 
    {
        const data = super.getData();

        data.current = getGame().pillars.time.current.year;
        data.latest = getGame().settings.get("pillars-of-eternity", "latestTime").year;
        return data;
    }

    
    async _updateObject(event : Event, formData? : {current : number, latest : number}) : Promise<void> 
    {
        const game = getGame();
        const current = game.settings.get("pillars-of-eternity", "time");
        const latest = game.settings.get("pillars-of-eternity", "latestTime");

        current.year = formData?.current || current.year;
        latest.year = formData?.latest || latest.year;

        await game.settings.set("pillars-of-eternity", "time", current);
        game.settings.set("pillars-of-eternity", "latestTime", latest);
    }
}