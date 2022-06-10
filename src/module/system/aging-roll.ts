import { ChatSpeakerDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData';
import { getGame } from '../../pillars';
import { AgingCheckData, AgingCheckDataFlattened } from '../../types/checks';
import { PILLARS } from './config';
import PILLARS_UTILITY from './utility';

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

    this.roll = new Roll('1d12 + @modifier + @lifeStyleMod', { modifier: this.checkData?.modifier, lifestyleMod: lifestyleMod });
    await this.roll.evaluate({ async: true });
  }

  async sendToChat() {
    this.roll?.toMessage({ flavor: this.checkData?.title, speaker: ChatMessage.getSpeaker({ actor: this.actor }), flags: { 'pillars-of-eternity.rollData': this.data } });
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
