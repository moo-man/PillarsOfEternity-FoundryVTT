import { PillarsActor } from "../actor/actor-pillars"

export default class ActorConfigure extends FormApplication<any, any, PillarsActor>
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "actor-configure",
            title : "Actor Configuration",
            template : "systems/pillars-of-eternity/templates/apps/actor-configure.html",
            width:420
        })
    }

    
    async _updateObject(event : Event, formData? : object) : Promise<void> {
        this.object.update(formData)
    }
}