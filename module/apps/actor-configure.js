export default class ActorConfigure extends FormApplication
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "actor-configure",
            template : "systems/pillars-of-eternity/templates/apps/actor-configure.html",
            width:420
        })
    }

    
    async _updateObject(event, formData) {
        this.object.update(formData)
    }
}