

export default class PillarsEffectConfig extends ActiveEffectConfig {

    get template() {
        return "systems/pillars-of-eternity/templates/apps/active-effect-config.html"
    }

    getData()
    {
        let data = super.getData();
        data.modes[6] = "Roll Dialog"
        return data
    }   
}