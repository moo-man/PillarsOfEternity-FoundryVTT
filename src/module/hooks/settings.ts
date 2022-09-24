import { getGame } from "../system/utility"
import { Time } from "../../types/common"
import { PillarsActorSheet } from "../actor/actor-sheet"
import BookOfSeasons from "../apps/book-of-seasons"

export default function () {


    Hooks.on("updateSetting", (setting : Setting) => {
        let game = getGame()
        // When the season setting is updated, make sure alerts for season notes are updated real time
        if (setting.key == "pillars-of-eternity.season")
        {
            game.pillars.TimeTracker.render(true)
            let windows = Object.values(ui.windows)   
            windows.forEach(w => {

                // We don't rerender actor sheets (as this can disrupt player inputs), only edit the DOM directly
                if (w instanceof PillarsActorSheet)
                {
                    if (w.object.type == "character")
                        w.checkSeasonAlerts();
                }
                // Ok to rerender BookOfSeasons
                else if (w instanceof BookOfSeasons)
                {
                    w.render();
                    // w.checkAlerts();
                }
            })


            if (!game.user!.isGM && game.user!.character && (setting.value as ClientSettings.Values["pillars-of-eternity.season"]).context?.latest)
            {
                game.user?.character.handleSeasonChange();
            }

        }
    })

}
