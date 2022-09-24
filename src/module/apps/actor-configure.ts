import { getGame } from "../system/utility"
import { PillarsActor } from "../actor/actor-pillars"

export default class ActorConfigure extends FormApplication<any, any, PillarsActor>
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "actor-configure",
            title : getGame().i18n.localize("PILLARS.ActorConfiguration"),
            template : "systems/pillars-of-eternity/templates/apps/actor-configure.html",
            width:420
        })
    }

    
    async _updateObject(event : Event, formData? : object) : Promise<void> {
        this.object.update(formData)
    }
}