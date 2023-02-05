import { getGame } from "../system/utility";
import { BookYearData } from "../../types/common";
import { PillarsActor } from "../document/actor-pillars";
import { PILLARS } from "../system/config";
import SeasonalActivityMenu from "./seasonal/activity-menu";
import SeasonalActivityApplication from "./seasonal/seasonal-activity";

export default class BookOfSeasons extends Application 
{
    actor?: PillarsActor;
    constructor(actor: PillarsActor) 
    {
        super();
        this.actor = actor;
    }

    static get defaultOptions() 
    {
        return mergeObject(super.defaultOptions, {
            id: "seasons",
            template: "systems/pillars-of-eternity/templates/apps/book-of-seasons.hbs",
            height: 900,
            width: 400,
            title: getGame().i18n.localize("PILLARS.BookOfSeasons"),
            resizable: true,
            scrollY: [".season-list"],
        });
    }

    getData() 
    {
        const data: {
      seasons?: (BookYearData & { index?: number; current?: string })[];
      actor?: PillarsActor;
      seasonsNeedUpdating?: Record<string, boolean> | boolean;
    } = {};

        const currentTime = getGame().pillars.time.current;
        data.seasons = duplicate(this.actor!.system.seasons) as BookYearData[];
    data.seasons!.forEach((s, i) => 
    {
        s.index = i;
        if (s.year == currentTime.year) 
        {
            s.current = PILLARS.seasons[currentTime.season].toLowerCase(); // TODO make this better
        }
        // s.needsUpdating = {
        //     "autumn" : seasonsNeedUpdating[`${s.year}-autumn`] || false,
        //     "spring" : seasonsNeedUpdating[`${s.year}-spring`] || false,
        //     "summer" : seasonsNeedUpdating[`${s.year}-summer`] || false,
        //     "winter" : seasonsNeedUpdating[`${s.year}-winter`] || false,
        // }
    });
    data.seasons!.reverse();
    data.actor = this.actor!;

    return data;
    }

    checkAlerts() 
    {
        const seasonsNeedUpdating = getGame().pillars.time.seasonsNeedUpdating(this.actor!) as Record<string, boolean>;

        const elements = this.element.find<HTMLDivElement>(".alert");

        elements.each((i, element) => 
        {
            const time = element.dataset["target"]!;

            if (seasonsNeedUpdating[time]) {element.style.display = "";}
            else {element.style.display = "none";}
        });
    }

    static indexToYear(index: number, actor : PillarsActor): number 
    {
        return actor?.system.seasons![index]?.year || -1;
    }

    activateListeners(html: JQuery<HTMLElement>) 
    {
        super.activateListeners(html);

        html.find(".add-season").on("click", async (ev: JQuery.ClickEvent) => 
        {
            ev.preventDefault();
            const seasons = duplicate(this.actor!.system.seasons);

            seasons.push({
                year: (seasons[seasons.length - 1]?.year || 0) + 1,
                spring: "",
                summer: "",
                autumn: "",
                winter: "",
                aging: "",
            });

            await this.actor!.update({ "system.seasons": seasons });
            this.render(true);
        });

        html.find(".alert").on("click", async (ev: JQuery.ClickEvent) => 
        {
            const target = ev.currentTarget.dataset["target"];
            const index = parseInt(target.split("-")[0]);
            if (target.includes("aging")) 
            {
                const year = BookOfSeasons.indexToYear(index, this.actor!);
                const roll = await this.actor?.setupAgingRoll(year);
                await roll?.rollCheck();
                await roll?.sendToChat();
                this.render(true);
            }
            else 
            {
                new SeasonalActivityMenu({ actor: this.actor!, index, season: target.split("-")[1] }).render(true);
            }
        });

        html.find("input").on("change", (ev: JQuery.ChangeEvent) => 
        {
            const name = ev.target.name.split("-");
            const index = parseInt(name[0] || "");
            const key = name[1] as keyof BookYearData;
            const seasons = foundry.utils.deepClone(this.actor?.system.seasons);
            let val: string | number = ev.target.value;
            if (Number.isNumeric(val)) {val = parseInt(val.toString());}
            if (seasons![index] && key) 
            {
                setProperty(seasons![index]!, key, val);
                //seasons[index][type] = val // TODO figure this out1`
            }
            return this.actor?.update({ "system.seasons": seasons }).then((actor) => 
            {
                this.checkAlerts();
            });
        });

        this.checkAlerts();
    }
}
