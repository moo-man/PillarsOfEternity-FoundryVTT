import { getGame } from '../../../pillars';
import { hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../config';
import { StudyActivity } from './study';

export class StudyTextActivity extends StudyActivity {
  actor: PillarsActor;
  item: PillarsItem;

  status: {
    language: 'none' | 'half' | 'full' | '';
    range: 'ok' | 'low' | 'high' | '';
  } = {
    language: '',
    range: '',
  };

  text: {
    language: string;
    range: string;
  } = {
    language: '',
    range: '',
  };

  constructor(actor: PillarsActor, item: PillarsItem) {
    super()
    this.actor = actor;
    this.item = item;
    this.evaluate();
  }

  async getSubmitData(xp?: number) {
    let result = <SeasonalActivityResult>{};
    let game = getGame();

    if (this.item && this.item.data.type == 'equipment') {
      xp = xp || this.xp;

      let subject = this.item.data.data.subject.value;

      let studyItem = this.actor.items.filter((i) => i.data.type == 'skill' || i.data.type == 'powerSource').find((i) => i.name == subject);

      if (!studyItem) {
        studyItem = game.items!.filter((i) => i.data.type == 'skill' || i.data.type == 'powerSource').find((i) => i.name == subject);
      }

      let itemData = studyItem?.toObject();
      if (hasXPData(itemData)) {
        itemData.data.xp.value += xp;
        result.data = { items: [itemData], name: this.actor.name!, type: this.actor.type };
        result.text = `Study (${this.item.name}): +${xp} ${studyItem?.name}`;
      }
    }
    return result
  }

  evaluate() {
    this.text.range = this.getRangeText();
    this.text.language = this.getLanguageText();

    if (this.item.data.type == 'equipment')
    {
      let xp = this.item.data.data.training.value;
      
      if (this.status.range != "ok")
      xp = 0;
      
      if (this.status.language == "half")
      xp = xp / 2
      
      else if (this.status.language == "none")
      xp = 0

      this.xp = xp;
      return xp
    }
    else return 0
  }

  // Determine if skill being read on is within the skill requirements of the book
  getRangeText() {
    let rangeText = '';
    if (this.item.data.type == 'equipment') {
      let game = getGame();
      let subject = this.item.data.data.subject.value;
      let range = this.item.data.data.range;
      let ownedSkill = this.actor.getItemTypes(ItemType.skill).find((i) => i.name == subject);
      let rank = 0;
      if (ownedSkill) rank = ownedSkill.xp?.rank || 0;

      if (rank >= range[0]! && rank <= range[1]!) {
        this.status.range = 'ok';
      } else if (rank < range[0]!) {
        this.status.range = 'low';
        rangeText = game.i18n.localize('PILLARS.SkillTooLow');
      } else if (rank > range[1]!) {
        this.status.range = 'high';
        rangeText = game.i18n.localize('PILLARS.SkillTooHigh');
      }
    }
    return rangeText;
  }

  /**
   * Determines how much XP is received based on language proficiency
   *
   * @param item Book being read
   * @returns
   */
  getLanguageText() {
    let languageText = '';
    if (this.item.data.type == 'equipment') {
      let game = getGame();
      let range = this.item.data.data.range;
      let language = this.item.data.data.language.value;

      let languageSkill = this.actor
        .getItemTypes(ItemType.skill)
        .filter((i) => {
          if (i.data.type == 'skill') {
            return i.data.data.category.value == 'language';
          }
        })
        .find((skill) => skill.name == language);

      let languageProficiency = languageSkill?.languageProficiency || 'none';

      let rank = languageSkill?.xp?.rank || 0;
      let xpText: string = '';
      if (rank >= 7) {
        // Fluent - Full XP
        {
          xpText = 'PILLARS.FullXP';
          this.status.language = 'full';
        }
      } else if (rank >= 5) {
        // Conversational
        if ((range[0] || 0) == 0) {
          // Full XP
          xpText = 'PILLARS.FullXP';
          this.status.language = 'full';
        } else if (range[0]! <= 5) {
          // Half XP
          xpText = 'PILLARS.HalfXP';
          this.status.language = 'half';
        } else if (range[0]! >= 6) {
          // No XP
          xpText = 'PILLARS.NoXP';
          this.status.language = 'none';
        }
      } else if (rank >= 3) {
        // Basic
        if ((range[0] || 0) == 0) {
          // Half XP
          xpText = 'PILLARS.HalfXP';
          this.status.language = 'half';
        } else {
          xpText = 'PILLARS.NoXP'; // No XP
          this.status.language = 'none';
        }
      } else {
        // Catchall
        xpText = 'PILLARS.NoXP'; // No XP
        this.status.language = 'none';
      }

      languageText = `${PILLARS.languageProficiencies[languageProficiency]}, ${game.i18n.localize(xpText)}`
    }
    return languageText;
  }
}
