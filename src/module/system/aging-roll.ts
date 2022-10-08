import { getGame } from "../system/utility"
import { AgingCheckData, AgingCheckDataFlattened } from '../../types/checks';
import { PILLARS } from './config';
import { PILLARS_UTILITY } from './utility';

export default class AgingRoll {
  data?: AgingCheckData
  roll? : Roll

  constructor(data? : AgingCheckDataFlattened) {
    if (!data) return;
    this.data = {
      checkData: {
        title: data.title,
        modifier: data.modifier,
        lifestyle: data.lifestyle,
        year : data.year
      },
      context: {
        speaker: data.speaker,
        rollClass: this.constructor.name,
      },
      result: {},
    };
  }

  static recreate(data : AgingCheckData) {
    let check = new this();
    check.data = data;
    return data;
  }

  async rollCheck() {
    let lifestyleMod = PILLARS.lifestyleModifier[this.checkData?.lifestyle as keyof typeof PILLARS.lifestyleModifier];

    if (isNaN(Number(this.checkData?.modifier))) this.checkData!.modifier = "0";

    this.roll = new Roll('1d12 + @modifier + @lifestyleMod', { modifier: this.checkData?.modifier, lifestyleMod: lifestyleMod });
    await this.roll.evaluate({ async: true });

    let message = this.handleAgeRollResult()
    if (this.checkData?.year)
    {
      await this.actor?.updateSeasonYear(this.data?.checkData.year!, "aging", message)
    }
    ui.notifications!.notify(message)
    return this
  }

  handleAgeRollResult() {

    let game = getGame();
    try {
      if (this.roll && this.roll.total)
      {
        let message = this.roll.total.toString() + ": "
        if (this.roll.total <= 2)
        {
          message += game.i18n.format("PILLARS.AgingResult1", {}) // No Apparent Aging`
        }
        else if (this.roll.total <= 9)
        {
          message += game.i18n.format("PILLARS.AgingResult2", {age : 1}) // Increase Apparent Age by 1 year"
        }
        else if (this.roll.total <= 12)
        {
          message += game.i18n.format("PILLARS.AgingResult3", {age : 1, points : 1})//Increase Apparent Age by 1 year, gain 1 Aging Point" 
        }
        else if (this.roll.total <= 13)
        {
          let points = this._pointsToNextDeathMarch(2)
          message += game.i18n.format("PILLARS.AgingResult4", {points, march : 1, age : 3}) // Gain ${points} Aging Point (increases Death March by 1), suffer a Malady, increase Apparent Age by 3`
        }
        else if (this.roll.total <= 19)
        {
          message += game.i18n.format("PILLARS.AgingResult5", {age : 1, points: 2}) // Increase Apparent Age by 1 year, Gain 2 Aging Points`
        }
        else if (this.roll.total <= 20)
      {
        let points = this._pointsToNextDeathMarch(2)
        message += game.i18n.format("PILLARS.AgingResult6", {points, march : 2, age : 3}) // Gain ${points} Aging Point (increases Death March by 2), suffer a Malady, increase Apparent Age by 3`
      }
      else if (this.roll.total >= 21)
      {
        message += game.i18n.format("PILLARS.AgingResult7", {points: 6, age : 2}) // Gain 6 Aging Points, Increase Apparent Age by 2`
      }
      return message
    }
    else throw new Error(game.i18n.localize("PILLARS.ErrorAgingRollObjectNotFound"))
  }
  catch(e)
  {
    let error = game.i18n.localize("PILLARS.ErrorComputeAgingRoll") + ": " + e
    ui.notifications?.error(error)
    throw Error(error)
  }
}

  _pointsToNextDeathMarch(marches = 0) : number
  {
    if (this.actor?.data.type == "character")
    {
      let march = this.actor.system.life.march;
      let index = -1;
      if (march > 0)
        index = march - 1 

      let pointThresholds = Object.keys(PILLARS.agePointsDeathRank).map(i => Number(i))

      let targetThreshold = march + marches;

      let agingPoints = this.actor.system.life.agingPoints;
      return pointThresholds[targetThreshold]! - agingPoints
    }
    return 0
  }

  async sendToChat() {
    return this.roll?.toMessage({ flavor: this.checkData?.title, speaker: ChatMessage.getSpeaker({ actor: this.actor }), flags: { 'pillars-of-eternity.rollData': this.data } });
  }

  get checkData() {
    return this.data?.checkData;
  }
  get context() {
    return this.data?.context;
  }
  get result() {
    return this.data?.result;
  }

  get actor() {
    return PILLARS_UTILITY.getSpeaker(this.context?.speaker);
  }
}
