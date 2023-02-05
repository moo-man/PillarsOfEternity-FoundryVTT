import { getGame } from "../system/utility";

export default class TimeTracker extends Application<ApplicationOptions> 
{
    constructor() 
    {
        super();
    }


    static get defaultOptions() 
    {
        return mergeObject(super.defaultOptions, {
            id: "time-tracker",
            template: "systems/pillars-of-eternity/templates/apps/time-tracker.hbs",
            title : "Time Tracker", // Needed to prevent _replaceHTML error
            resizable: false,
        });
    }

    render(...args : Parameters<Application["render"]>)
    {
        const userPosition = getGame().settings.get("pillars-of-eternity", "trackerPosition");
        if (!args[1])
        {
            args[1] = {};
        }
      args[1]!.top = userPosition.top || 1000;
      args[1]!.left = userPosition.left || 200;
      return super.render(...args);
    }

    async _render(...args : Parameters<Application["_render"]>)
    {
        await super._render(...args);
        delete ui.windows[this.appId];
    }

    getData() 
    {
        return getGame().pillars.time.current;
    }

    setPosition(...args : Parameters<Application["setPosition"]>) 
    {
        super.setPosition(...args);
        getGame().settings.set("pillars-of-eternity", "trackerPosition", {left : args[0]?.left || 200, top : args[0]?.top || 1000});
    }

    activateListeners(html: JQuery<HTMLElement>) 
    {
        super.activateListeners(html);

        new Draggable(this, html, html[0]!, false);

        html.on("click", ".forward", this._onForwardClick.bind(this));
        html.on("click", ".backward", this._onBackwardClick.bind(this));
    }

    _onForwardClick(ev: JQuery.ClickEvent) 
    {
        getGame().pillars.time.changeTime(1);
    }

    _onBackwardClick(ev: JQuery.ClickEvent) 
    {
        getGame().pillars.time.changeTime(-1);
    }
}
