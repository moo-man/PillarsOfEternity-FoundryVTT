import { getGame } from '../../../pillars';
import { hasXP, hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult, PracticeTemplateData } from '../../../types/seasonal-activities';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../../system/config';
import SeasonalActivity from './seasonal-activity';

export default class StudySeasonalActivity extends SeasonalActivity {
  ui: {
    xp?: HTMLInputElement;
    itemDrag?: HTMLDivElement;
    itemImg?: HTMLImageElement;
    itemName?: HTMLHeadingElement;
    itemDetails?: HTMLDivElement;
  } & SeasonalActivity['ui'] = {};

  alerts: {
    languagePass?: HTMLAnchorElement;
    languageWarn?: HTMLAnchorElement;
    languageAlert?: HTMLAnchorElement;

    reqPass?: HTMLAnchorElement;
    reqAlert?: HTMLAnchorElement;
  } = {};

  item?: PillarsItem;

  status : {
    language : "none" | "half" | "full" | ""
    range : "ok" | "low" | "high" | ""
  } = {
    language : "",
    range : ""
  }

  static get defaultOptions() {
    let options = super.defaultOptions;
    options.width = 600;
    options.height = "auto";
    options.tabs = [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'text' }];
    return options;
  }

  get template() {
    return 'systems/pillars-of-eternity/templates/apps/seasonal/study.html';
  }

  get title() {
    return getGame().i18n.localize('PILLARS.Study');
  }

  static get label(): string {
    return getGame().i18n.localize('PILLARS.Study');
  }

  submit(): SeasonalActivityResult {
    let result = <SeasonalActivityResult>{};

    let game = getGame();
    let xp = Number(this.ui.xp?.value)

    if (xp > 0 && this.item && this.item.data.type == "equipment")
    {
      let subject = this.item.data.data.subject.value;

      let studyItem = this.actor.items
      .filter((i) => (i.data.type == 'skill' || i.data.type == "powerSource"))
      .find((i) => i.name == subject);

      if (!studyItem)
      {
        studyItem = game.items!
        .filter((i) => (i.data.type == 'skill' || i.data.type == "powerSource"))
        .find((i) => i.name == subject);
      }

      let itemData = studyItem?.toObject();
      if(hasXPData(itemData))
      {
        itemData.data.xp.value += xp
        result.data = {items : [itemData], name : this.actor.name!, type : this.actor.type}
        result.text = `Study (${this.item.name}): +${xp} ${itemData.name}`
      }
    }

    if (this.resolve)
      this.resolve(result);

    return result;
  }
  async _onDragDrop(ev: DragEvent) {
    this.ui.itemDrag?.classList.remove('hover');
    let dragData = JSON.parse(ev.dataTransfer?.getData('text/plain') || '');
    let item : PillarsItem | undefined = await Item.fromDropData(dragData);

    this.setItem(item);
  }

  setItem(item: PillarsItem | undefined) {
    let game = getGame();

    if (!item) return ui.notifications!.error(game.i18n.localize('PILLARS.ErrorCannotFindItem'));

    if (item.data.type != 'equipment' || (item.data.type == 'equipment' && item.data.data.category.value != 'book'))
      return ui.notifications!.error(game.i18n.localize('PILLARS.ErrorPracticeSkillsOnly'));

    this.item = item;
    this.ui.itemImg!.src = item.data.img!;
    this.ui.itemName!.textContent = item.name;

    let languageText = this.getLanguageText(item);
    let rangeText = this.getRangeText(item);

    this.ui.itemDetails!.querySelector('.language .status')!.textContent = languageText;
    this.ui.itemDetails!.querySelector('.req .status')!.textContent = rangeText;
    this.ui.itemDetails!.querySelector('.subject .status')!.textContent = item.data.data.subject.value;

    let xp = item.data.data.training.value;

    if (this.status.range != "ok")
      xp = 0;

    if (this.status.language == "half")
      xp = xp / 2

    else if (this.status.language == "none")
      xp = 0
    

    this.ui.xp!.value = xp.toString()

    this.checkData();
  }


  // Determine if skill being read on is within the skill requirements of the book
  getRangeText(item: PillarsItem) {
    let rangeText = ""
    if (item.data.type == 'equipment') 
    {
      let game = getGame();
      let subject = item.data.data.subject.value
      let range = item.data.data.range;
      let ownedSkill = this.actor.getItemTypes(ItemType.skill).find(i => i.name == subject)
      let rank = 0;
      if (ownedSkill)
        rank = ownedSkill.xp?.rank || 0;

      rangeText = `${range[0]} - ${range[1]}`
      if (rank >= range[0]! && rank <= range[1]!)
      {
        this.status.range = "ok"
      }
      else if (rank < range[0]!)
      {
        this.status.range = "low"
        rangeText += ` (${game.i18n.localize("PILLARS.SkillTooLow")})`
      }
      else if (rank > range[1]!)
      {
        this.status.range = "high"
        rangeText += ` (${game.i18n.localize("PILLARS.SkillTooHigh")})`
      }
    }
    return rangeText
  }

  /**
   * Determines how much XP is received based on language proficiency
   * 
   * @param item Book being read
   * @returns 
   */
  getLanguageText(item: PillarsItem) {
    let languageText = ""
    if (item.data.type == 'equipment') {
      let game = getGame();
      let range = item.data.data.range;
      let language = item.data.data.language.value;

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
      if (rank >= 7) { // Fluent - Full XP
        {
          xpText = 'PILLARS.FullXP';
          this.status.language = "full"

        }
      } else if (rank >= 5) {
        // Conversational
        if ((range[0] || 0) == 0) // Full XP
        {
          xpText = 'PILLARS.FullXP';
          this.status.language = "full"
        }
        else if (range[0]! <= 5) // Half XP
        {
          xpText = 'PILLARS.HalfXP';
          this.status.language = "half"
        }
        else if (range[0]! >= 6) // No XP
        {
          xpText = 'PILLARS.NoXP';
          this.status.language = "none"
        }
      } 
      else if (rank >= 3) // Basic
      {
        if ((range[0] || 0) == 0) // Half XP
        {
          xpText = 'PILLARS.HalfXP';
          this.status.language = "half"
        }
        else 
        {
          xpText = 'PILLARS.NoXP'; // No XP
          this.status.language = "none"
        }
      }
      else { // Catchall
          xpText = 'PILLARS.NoXP'; // No XP
          this.status.language = "none"
      }

      languageText = game.i18n.format('PILLARS.BookLanguageXP', {
        language,
        proficiency: PILLARS.languageProficiencies[languageProficiency],
        xp: game.i18n.localize(xpText),
      });
    }
    return languageText
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    const dragDrop = new DragDrop({
      dragSelector: '.item',
      dropSelector: '.dragarea',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this._onDragDrop.bind(this) },
    });

    dragDrop.bind(html[0]!);

    super.activateListeners(html);
    this.alerts.languagePass = html.find<HTMLAnchorElement>('.language .pass')[0];
    this.alerts.languageWarn = html.find<HTMLAnchorElement>('.language .warn')[0];
    this.alerts.languageAlert = html.find<HTMLAnchorElement>('.language .alert')[0];
    this.alerts.reqPass = html.find<HTMLAnchorElement>('.req .pass')[0];
    this.alerts.reqAlert = html.find<HTMLAnchorElement>('.req .alert')[0];

    this.ui.itemDrag = html.find<HTMLDivElement>('.dragarea')[0];
    this.ui.itemImg = html.find<HTMLImageElement>('.dragarea img')[0];
    this.ui.itemName = html.find<HTMLImageElement>('header h3')[0];
    this.ui.itemDetails = html.find<HTMLDivElement>('.book-details')[0];
    this.ui.xp = html.find<HTMLInputElement>('.xp input')[0];

    this.ui.itemDrag?.addEventListener('dragenter', (ev: DragEvent) => {
      (ev.target as HTMLElement).classList.add('hover');
    });
    this.ui.itemDrag?.addEventListener('dragleave', (ev: DragEvent) => {
      (ev.target as HTMLElement).classList.remove('hover');
    });
  }

  checkData(): { errors: string[]; message: string } {
    let state: { errors: string[]; message: string } = { errors: [], message: '' };
    let game = getGame()
    if (this.status.range != "ok")
    {
      state.errors.push(game.i18n.localize("PILLARS.NotWithinBookSkillRange"))
      this.showAlert(this.alerts.reqAlert)
      this.hideAlert(this.alerts.reqPass)
    }
    else if (this.status.range == "ok")
    {
      this.hideAlert(this.alerts.reqAlert)
      this.showAlert(this.alerts.reqPass)
    }

    if (this.status.language == "full")
    {
      this.showAlert(this.alerts.languagePass)
      this.hideAlert(this.alerts.languageWarn)
      this.hideAlert(this.alerts.languageAlert)
    }
    else if (this.status.language == "half")
    {
      this.showAlert(this.alerts.languageWarn)
      this.hideAlert(this.alerts.languagePass)
      this.hideAlert(this.alerts.languageAlert)
    }
    else if (this.status.language == "none")
    {
      state.errors.push(game.i18n.localize("PILLARS.NotProficientBookLanguage"))
      this.showAlert(this.alerts.languageAlert)
      this.hideAlert(this.alerts.languagePass)
      this.hideAlert(this.alerts.languageWarn)
    }


    state.message = getGame().i18n.format('PILLARS.StudyErrors', { errors: `<ul>${'<li>' + state.errors.join('</li><li>') + '</li>'}</ul>` })

    return state;
  }
}
