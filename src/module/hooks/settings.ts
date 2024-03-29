import { getGame } from "../system/utility";
import { TimeSettingData } from "../../types/time";

export default function () 
{


    Hooks.on("updateSetting", (setting : Setting) => 
    {
        const game = getGame();
        // When the season setting is updated, make sure alerts for season notes are updated real time
        if (setting.key == "pillars-of-eternity.time")
        {
            game.pillars.time.handleTimeChange(setting.value as TimeSettingData);
        }
    });

}
