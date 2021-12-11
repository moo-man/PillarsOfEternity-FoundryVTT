export default class PillarsTokenDocument extends TokenDocument{

  getBarAttribute(...args) {

    let bar = super.getBarAttribute(...args)
    let data = foundry.utils.getProperty(this.actor.data.data, bar.attribute)
    if (data.threshold?.incap)
      bar.max = data.threshold.incap + 1

    return bar
  }
}