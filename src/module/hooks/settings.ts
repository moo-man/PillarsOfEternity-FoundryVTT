import { getGame } from "../system/utility"
import { PillarsActorSheet } from "../actor/actor-sheet"
import BookOfSeasons from "../apps/book-of-seasons"
import { TimeSettingData } from "../../types/time"

export default function () {


    Hooks.on("updateSetting", (setting : Setting) => {
        let game = getGame()
        // When the season setting is updated, make sure alerts for season notes are updated real time
        if (setting.key == "pillars-of-eternity.time")
        {
            game.pillars.time.handleTimeChange(setting.value as TimeSettingData)
        }
    })

}
