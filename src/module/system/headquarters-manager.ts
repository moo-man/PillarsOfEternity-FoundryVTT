import { PillarsActor } from "../actor/actor-pillars";
import { getGame } from "./utility";

export class HeadquartersManager {

    activeHeadquarters : PillarsActor[] = [];
    
    sync() {
        this.activeHeadquarters = getGame().settings.get("pillars-of-eternity", "activeHeadquarters").map(i => getGame().actors!.get(i)!).filter(i => i)
    }
    
    activate(id : string)
    {
        let active = getGame().settings.get("pillars-of-eternity", "activeHeadquarters")
        if (!active.includes(id))
        {
            let newActive = active.concat(id)
            getGame().settings.set("pillars-of-eternity", "activeHeadquarters", newActive)
        }
        this.sync()
    }

    deactivate(id : string)
    {
        let active = getGame().settings.get("pillars-of-eternity", "activeHeadquarters")
        let newActive = active.filter(i => i != id)
        getGame().settings.set("pillars-of-eternity", "activeHeadquarters", newActive)
        this.sync()
    }   

    isActive(id : string)
    {
        return getGame().settings.get("pillars-of-eternity", "activeHeadquarters").includes(id)
    }
}