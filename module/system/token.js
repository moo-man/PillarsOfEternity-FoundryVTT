export default class PillarsTokenDocument extends TokenDocument{

  async _preUpdate(data, options, user)
  {
    super._preUpdate(data, options, user);
    if ((data.x || data.y) && this.combatant)
    {
      let distance = canvas.grid.measureDistances([{ ray: new Ray({ x: this.data.x, y: this.data.y }, { x: (data.x || this.data.x), y : (data.y || this.data.y) }) }], { gridSpaces: true })[0]
      distance = options.isUndo ? distance * -1 : distance
      this.combatant.handleMovement(distance);
    }
  }

  getBarAttribute(...args) {

    let bar = super.getBarAttribute(...args)
    let data = foundry.utils.getProperty(this.actor.data.data, bar.attribute)
    if (data.threshold?.incap)
      bar.max = data.threshold.incap + 1

    return bar
  }
}