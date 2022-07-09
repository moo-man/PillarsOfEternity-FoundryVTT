import { getGame } from '../../../pillars';
import { hasXP, hasXPData } from '../../../types/common';
import {SeasonalActivityResult, PracticeTemplateData } from '../../../types/seasonal-activities';
import { PillarsItem } from '../../item/item-pillars';
import SeasonalActivity from './seasonal-activity';

export default class PracticeSeasonalActivity extends SeasonalActivity {
  ui: {
    xp?: HTMLInputElement;
    submitButton?: HTMLButtonElement;
    skillSelect?: HTMLSelectElement;
    skillDrag?: HTMLDivElement;
    skillImg?: HTMLImageElement;
    skillName?: HTMLHeadingElement;
  } = {};

  alerts: {
    skillAlert?: HTMLAnchorElement;
  } = {};


  item? : PillarsItem 

  static get defaultOptions() {
    let options = super.defaultOptions;
    options.width = 400;
    options.height = 400;
    return options
  }

  get template() {
    return 'systems/pillars-of-eternity/templates/apps/seasonal/practice.html';
  }

  get title() {
    return getGame().i18n.localize('PILLARS.Practice');
  }
    
  static get label(): string {
    return getGame().i18n.localize('PILLARS.Practice');
  }


  async getData(): Promise<PracticeTemplateData> {
    let data = (await super.getData()) as PracticeTemplateData;
    data.skills = getGame().items?.contents.filter(i => i.type == "skill") || []
    return data;
  }

  submit(): SeasonalActivityResult {
    let result = <SeasonalActivityResult>{};

    let xp = Number(this.ui.xp?.value)

    if (xp > 0 && this.item)
    {
      let itemData = this.item.toObject();
      if(hasXPData(itemData))
      {
        itemData.data.xp.value += xp
        result.data = {items : [itemData], name : this.actor.name!, type : this.actor.type}
        result.text = `Practice: +${xp} ${itemData.name}`
      }
    }

    if (this.resolve)
      this.resolve(result);

    return result;
  }

  _onDragDrop(ev : DragEvent)
  {

    this.ui.skillDrag?.classList.remove("hover")
    let game = getGame()
    let dragData = JSON.parse(ev.dataTransfer?.getData('text/plain') || '');
    let item : PillarsItem | undefined;
    if (dragData)
    {
      if (dragData.type == "Item")
      {
        if (dragData.id) // World Item
        {
          item = game.items?.get(dragData.id)
        }
        else if (dragData.data) // Owned Item
        {
          item = this.actor.items.get(dragData.data._id)
        }
      }
    }
    this.setSkill(item);
  }


  setSkill(item: PillarsItem | undefined) {

    let game = getGame()

    if (!item)
      return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCannotFindItem"))

    if (item.type != "skill" && item.type != "powerSource")
      return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorPracticeSkillsOnly"))


    // If given skill is the same name as one the actor owns, use the owned one instead
    if (item.parent != this.actor)
    {
      let ownedSkill = this.actor.items.getName(item.name!)
      if (ownedSkill)
        item = ownedSkill
    }

    this.item = item;
    this.ui.skillImg!.src = item.data.img!
    this.ui.skillSelect!.value = item.id!;

    this.ui.skillName!.textContent = item.name;

    if (item.type == "powerSource" || ["artistic", "martial"].includes(item.category?.value || ""))
      this.ui.xp!.value = "5";
    else 
      this.ui.xp!.value = "10";

    this.checkData()
  }

  activateListeners(html: JQuery<HTMLElement>): void {

    const dragDrop = new DragDrop({
      dragSelector: ".item",
      dropSelector : ".dragarea",
      permissions : {dragstart : () => true, drop : () => true},
      callbacks : { drop: this._onDragDrop.bind(this) }
    })

    dragDrop.bind(html[0]!)

    super.activateListeners(html);
    this.alerts.skillAlert = html.find<HTMLAnchorElement>('.skill-header .alert')[0];
    this.ui.skillSelect = html.find<HTMLSelectElement>(".skill select").on("change", (ev : JQuery.ChangeEvent) => {
      let id = ev.currentTarget.value;
      let item = getGame().items!.get(id)
      this.setSkill(item);

    })[0]
    this.ui.skillDrag = html.find<HTMLDivElement>(".dragarea")[0]
    this.ui.skillImg = html.find<HTMLImageElement>(".dragarea img")[0]
    this.ui.skillName = html.find<HTMLImageElement>(".skill-name")[0]
    this.ui.xp = html.find<HTMLInputElement>(".xp input")[0]

    this.ui.skillDrag?.addEventListener("dragenter", (ev : DragEvent) => {
      (ev.target as HTMLElement).classList.add("hover")
    })
    this.ui.skillDrag?.addEventListener("dragleave", (ev : DragEvent) => {
      (ev.target as HTMLElement).classList.remove("hover")
    })


    //TODO:  Lift this to the base class
    this.ui.submitButton = html.find<HTMLButtonElement>("button[type='submit']").on('click', (ev: JQuery.ClickEvent) => {
      let game = getGame();

      let errors = this.checkData();

      if (errors?.length) {
        Dialog.confirm({
          title: game.i18n.localize('Error'),
          content: game.i18n.format('PILLARS.PracticeErrors', { errors: `<ul>${'<li>' + errors.join('</li><li>') + '</li>'}</ul>` }),

          yes: () => {
            this.submit();
            this.close();
          },
          no: () => {},
        });
      } else {
        this.submit();
        this.close();
      }
    })[0];
    this.checkData();
  }

  checkData() {
    let errors : string[] = [];

    if (this.item)
    {
      if (["social", "academic"].includes(this.item.category?.value!))
      {
        this.showAlert(this.alerts.skillAlert)
        errors.push(getGame().i18n.localize("PILLARS.CantPracticeSkill"))
      }
      else
      {
        this.hideAlert(this.alerts.skillAlert)
      }
    }

    return errors;
  }
}
