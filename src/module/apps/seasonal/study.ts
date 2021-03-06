import { getGame } from '../../../pillars';
import { hasXP, hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult, PracticeTemplateData } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../../system/config';
import { StudyActivity } from '../../system/seasonal/study';
import { StudyTeacherActivity } from '../../system/seasonal/study-teacher';
import { StudyTextActivity } from '../../system/seasonal/study-text';
import SeasonalActivityApplication from './seasonal-activity';

export default class StudySeasonalActivityApplication extends SeasonalActivityApplication {
  ui: {
    xp?: HTMLInputElement;
    itemDrag?: HTMLDivElement;

    teachingSkill? : HTMLSpanElement;
    teachingMinimum? : HTMLSpanElement

    actorDrag?  : HTMLDivElement,
  } & SeasonalActivityApplication['ui'] = {};

  alerts: {
    languagePass?: HTMLAnchorElement;
    languageWarn?: HTMLAnchorElement;
    languageAlert?: HTMLAnchorElement;

    reqPass?: HTMLAnchorElement;
    reqAlert?: HTMLAnchorElement;
  } = {};

  object? : StudyActivity

  mode : "text" | "teacher" = "text"

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

  
  async _render(...args : Parameters<Application["_render"]>)
  {
    await super._render(...args)
    this.checkData();
  }

  async getData(options?: Partial<ApplicationOptions> | undefined){
    return {
      object : this.object,
      skills : this.object instanceof StudyTeacherActivity 
      ? this.object.teacher.getItemTypes(ItemType.skill).filter(i => (i.rank || 0) > 0) 
      : []
    }
  }

  async submit(): Promise<SeasonalActivityResult> {
    let result = <SeasonalActivityResult>{};

    let xp = Number(this.ui.xp?.value)

    result = await this.object?.getSubmitData(xp) || result

    if (this.resolve)
      this.resolve(result);

    return result;
  }
  async _onDragDrop(ev: DragEvent) {
    this.ui.itemDrag?.classList.remove('hover');
    let dragData = JSON.parse(ev.dataTransfer?.getData('text/plain') || '');

    if (dragData.type == "Item")
    {
      let item : PillarsItem | undefined = await Item.fromDropData(dragData);
      this.setItem(item);
    }
    else if (dragData.type == "Actor")
    {
      let actor = await Actor.fromDropData(dragData)
      this.setActor(actor)
    }
  }

  setItem(item: PillarsItem | undefined) {
    let game = getGame();

    if (!item) return ui.notifications!.error(game.i18n.localize('PILLARS.ErrorCannotFindItem'));

    if (item.data.type != 'equipment' || (item.data.type == 'equipment' && item.data.data.category.value != 'book'))
      return ui.notifications!.error(game.i18n.localize('PILLARS.ErrorPracticeSkillsOnly'));

    if (this.mode == "text")
    {
      this.object = new StudyTextActivity(this.actor, item)
      this.render(true);
    }
  }

  setActor(actor : PillarsActor | undefined)
  {
    let game = getGame()
    if (!actor) return ui.notifications!.error(game.i18n.localize('PILLARS.ErrorCannotFindActor'));


    if (this.mode == "teacher")
    {
      this.object = new StudyTeacherActivity(this.actor, actor)
      this.render(true);
    }


    this.checkData();
  }


  _onChangeTab(event: MouseEvent | null, tabs: Tabs, active: string): void {
    super._onChangeTab(event, tabs, active);
    this.mode = active as "text" | "teacher"
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
    this.ui.actorDrag = html.find<HTMLDivElement>('.dragarea')[0];
    this.ui.itemDrag = html.find<HTMLDivElement>('.dragarea.item')[0];
    this.ui.xp = html.find<HTMLInputElement>('.xp input')[0];
    this.ui.teachingSkill = html.find<HTMLSpanElement>(".teaching-skill span")[0];
    this.ui.teachingMinimum = html.find<HTMLSpanElement>(".teaching-minimum span")[0];

    html.find(".skill-select").on("change", (ev : JQuery.ChangeEvent) => {
      let skill = ev.currentTarget.value
      if (this.object instanceof StudyTeacherActivity)
      {
        this.object.setSkill(skill);
        this.render(true);
      }
    })

    html.find<HTMLInputElement>("[name='skillMaximum'],[name='raiseMinimum'],[name='students']").on("change", (ev : JQuery.ChangeEvent) => {
      let property = ev.currentTarget.name as "students" | "raiseMinimum" | "skillMaximum";
      if (this.object instanceof StudyTeacherActivity)
      {
        this.object[property] = Number(ev.currentTarget.value);
        let input = ev.currentTarget as HTMLInputElement;

        if (input.parentElement)
          input.parentElement.querySelector<HTMLSpanElement>(".range-value")!.textContent = this.object[property].toString()

        this.object.evaluate();
        this.render(true);

      }
    })

    this.ui.itemDrag?.addEventListener('dragenter', (ev: DragEvent) => {
      (ev.target as HTMLElement).classList.add('hover');
    });
    this.ui.itemDrag?.addEventListener('dragleave', (ev: DragEvent) => {
      (ev.target as HTMLElement).classList.remove('hover');
    });
  }

  async checkData(): Promise<{ errors: string[]; message: string }> {
    let state: { errors: string[]; message: string } = { errors: [], message: '' };
    let game = getGame()



    if (this.mode == "text")
    {
      if (this.object?.status.range && this.object?.status.range != "ok")
      {
        state.errors.push(game.i18n.localize("PILLARS.NotWithinBookSkillRange"))
        this.showAlert(this.alerts.reqAlert)
        this.hideAlert(this.alerts.reqPass)
      }
      else if (this.object?.status.range == "ok")
      {
        this.hideAlert(this.alerts.reqAlert)
        this.showAlert(this.alerts.reqPass)
      }
      
      if (this.object?.status.language == "full")
      {
        this.showAlert(this.alerts.languagePass)
        this.hideAlert(this.alerts.languageWarn)
        this.hideAlert(this.alerts.languageAlert)
      }
      else if (this.object?.status.language == "half")
      {
        this.showAlert(this.alerts.languageWarn)
        this.hideAlert(this.alerts.languagePass)
        this.hideAlert(this.alerts.languageAlert)
      }
      else if (this.object?.status.language == "none")
      {
        state.errors.push(game.i18n.localize("PILLARS.NotProficientBookLanguage"))
        this.showAlert(this.alerts.languageAlert)
        this.hideAlert(this.alerts.languagePass)
        this.hideAlert(this.alerts.languageWarn)
      }
    }

    else (this.mode == "teacher")
    {

    }
    

    state.message = getGame().i18n.format('PILLARS.StudyErrors', { errors: `<ul>${'<li>' + state.errors.join('</li><li>') + '</li>'}</ul>` })

    return state;
  }
}
