import { PillarsActor } from "../document/actor-pillars";
import { getGame } from "./utility";

export class HeadquartersManager 
{

    get activeHeadquarters() : PillarsActor[] 
    {
        return getGame().settings.get("pillars-of-eternity", "activeHeadquarters").map(i => getGame().actors!.get(i)!).filter(i => i);
    }
    
    sync() 
    {
        
    }
    
    activate(id : string)
    {
        const active = getGame().settings.get("pillars-of-eternity", "activeHeadquarters");
        if (!active.includes(id))
        {
            const newActive = active.concat(id);
            getGame().settings.set("pillars-of-eternity", "activeHeadquarters", newActive);
        }
        this.sync();
    }

    deactivate(id : string)
    {
        const active = getGame().settings.get("pillars-of-eternity", "activeHeadquarters");
        const newActive = active.filter(i => i != id);
        getGame().settings.set("pillars-of-eternity", "activeHeadquarters", newActive);
        this.sync();
    }   

    isActive(id : string)
    {
        return getGame().settings.get("pillars-of-eternity", "activeHeadquarters").includes(id);
    }
}