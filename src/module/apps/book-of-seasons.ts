export default class BookOfSeasons extends Application 
{
    constructor(actor) {
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
        let data = super.getData();
        data.seasons = duplicate(this.actor.seasons)
        data.seasons.map((s, i) => {s.index = i})
        data.seasons.reverse()
        data.actor = this.actor
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);

        html.find(".add-season").click(async ev => {
            ev.preventDefault()
            let seasons = duplicate(this.actor.seasons)
            
            seasons.push({
                "year" : (seasons[seasons.length-1]?.year || 0) + 1,
                "spring" : "",
                "summer" : "",
                "autumn" : "",
                "winter" : "",
                "aging" : ""
              })

            await this.actor.update({"data.seasons" : seasons})
            this.render(true)
        })

        html.find("input").change(ev => {
            let name = ev.target.name.split("-")
            let index = parseInt(name[0])
            let type = name[1]
            let seasons = duplicate(this.actor.seasons)
            let val = event.target.value;
            if (Number.isNumeric(val))
                val = parseInt(val)
            seasons[index][type] = val
            return this.actor.update({"data.seasons" : seasons  })
        })
    }

}