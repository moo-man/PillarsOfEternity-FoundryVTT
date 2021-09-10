export default class PillarsActiveEffect extends ActiveEffect {
    
    get label() {
        return this.data.label
    }

    get tooltip() {
        return getProperty(this.data, "flags.pillars-of-eternity.tooltip")
    }

    get hasRollEffect() {
        return this.data.changes.some(c => c.mode == 0)
    }
}