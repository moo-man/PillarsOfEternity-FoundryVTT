import { Season } from "../../types/common";
import { PillarsActor } from "../actor/actor-pillars";

export default class BookOfSeasons extends Application
{
    actor? : PillarsActor
    constructor(actor : PillarsActor) {
       super()
       this.actor = actor 
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "seasons",
            template : "systems/pillars-of-eternity/templates/apps/book-of-seasons.html",
            height : 900,
            width : 400,
            title : "Book of Seasons",
            resizable: true
        })
    }

    getData() {
        let data : {seasons? : (Season & {index? : number})[], actor? : PillarsActor} = {}
        data.seasons = duplicate(this.actor!.seasons)
        data.seasons.map((s, i) => {s.index = i})
        data.seasons.reverse()
        data.actor = this.actor!
        return data;
    }


    activateListeners(html : JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find(".add-season").on("click", async (ev : JQuery.ClickEvent) => {
            ev.preventDefault()
            let seasons = duplicate(this.actor!.seasons)
            
            seasons.push({
                "year" : (seasons[seasons.length-1]?.year || 0) + 1,
                "spring" : "",
                "summer" : "",
                "autumn" : "",
                "winter" : "",
                "aging" : ""
              })

            await this.actor!.update({"data.seasons" : seasons})
            this.render(true)
        })

        html.find("input").on("change", (ev : JQuery.ChangeEvent) => {
            let name = ev.target.name.split("-")
            let index = parseInt(name[0] || "")
            let key = name[1] as keyof Season
            let seasons = foundry.utils.deepClone(this.actor?.seasons)
            let val : string | number= ev.target.value;
            if (Number.isNumeric(val))
                val = parseInt(val.toString())
            if (seasons![index] && key && val)
            {
                setProperty(seasons![index]!, key,  val)
                //seasons[index][type] = val // TODO figure this out1`
            }
            return this.actor?.update({"data.seasons" : seasons  })
        })
    }

}