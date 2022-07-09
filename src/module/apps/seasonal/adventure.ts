import { getGame } from '../../../pillars';
import { ItemType } from '../../../types/common';
import { AdventureActivityData, AdventureTemplateData, SeasonalActivityData, SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import BookOfSeasons from '../book-of-seasons';
import SeasonalActivity from './seasonal-activity';

export default class AdventureSeasonalActivity extends SeasonalActivity {

  experience : number | undefined

  editableExperience : boolean;

  ui : {
    threeIntoThreeText? : HTMLSpanElement
    availableExperience? : HTMLInputElement
    totalExp? : HTMLInputElement
    itemLists? : HTMLDivElement
  } = {}

  alerts : {
    threeIntoThree? : HTMLAnchorElement
    experience? : HTMLAnchorElement
  } = {}

  constructor(data : AdventureActivityData, resolve? : (value :  SeasonalActivityResult) => void, options? : ApplicationOptions)
  {
    super(data, resolve, options );
    this.experience = data.experience
    this.editableExperience = !data.experience
  }

  get template() {
    return "systems/pillars-of-eternity/templates/apps/seasonal/adventure.html"
  }

  get title() {
    return "Allocate Experience"
  }
  
  static get label(): string {
    return getGame().i18n.localize('PILLARS.Adventure');
  }

  async getData() : Promise<AdventureTemplateData> {
    let data = await super.getData() as AdventureTemplateData;
    data.skills = this.actor.getItemTypes(ItemType.skill).filter(i => i.used?.value)
    data.connections = this.actor.getItemTypes(ItemType.connection).filter(i => i.used?.value)
    data.powerSources = this.actor.getItemTypes(ItemType.powerSource).filter(i => i.used?.value)
    data.experience = this.experience
    data.editableExperience = this.editableExperience
    return data
}

  submit(): SeasonalActivityResult {
    let result = <SeasonalActivityResult>{};

    let experienceList : string []= []
    // get all items with experience allocated
    let itemData = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>(".item-experience")!).filter(i => (i.value || 0) > 0).map(i => {
      let id = i.parentElement?.dataset.id
      let item = this.actor.items.get(id!)
      experienceList.push(`${i.value} -> ${item?.name}`)
      if (item)
        return {
          _id : item!.id,
          "data.xp.value" : (item.xp?.value || 0) + Number(i.value),
          type : item!.type,
          name : item!.name!
        }
    })
    result.data = {items : itemData, name : this.actor.name!, type : this.actor.type}

    result.text = "Adventure: " + experienceList.join(", ")

    if (this.resolve)
      this.resolve(result);
    return result
  };


  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    this.ui.threeIntoThreeText = html.find<HTMLSpanElement>(".3into3 span")[0]
    this.ui.availableExperience = html.find<HTMLInputElement>(".experience .availableExp")[0]
    this.ui.totalExp = html.find<HTMLInputElement>(".experience .totalExp").on("change", (ev : JQuery.ChangeEvent) => {
      this.checkData();
    })[0]
    this.ui.itemLists = html.find<HTMLDivElement>(".item-lists")[0]

    html.find(".item-experience").on("change", (ev : JQuery.ChangeEvent) => {
      this.checkData();
    })


    this.alerts.threeIntoThree = html.find<HTMLAnchorElement>(".3into3 .alert")[0]
    this.alerts.experience = html.find<HTMLAnchorElement>(".experience .alert")[0]

    html.find<HTMLButtonElement>("button[type='submit']").on("click", (ev : JQuery.ClickEvent) => {
      this.submit();
      this.close();
    })

    
  }

  checkData() {
    // If no experience, prevent item lists from being filled
    if (!this.ui.totalExp?.value && !this.ui.itemLists?.classList.contains("disabled"))
    {
      this.ui.itemLists?.classList.add("disabled")
      this.hideAlert(this.alerts.experience)
      this.hideAlert(this.alerts.threeIntoThree)
      return 
    }
    else if (this.ui.itemLists?.classList.contains("disabled"))
    {
      this.ui.itemLists.classList.remove("disabled")
    }

    // Get all items with experience allocated
    let itemsAllocated = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>(".item-experience")!).filter(i => (i.value || 0) > 0)

    // Total the experience allocated
    let experienceAllocated = itemsAllocated.reduce((prev, curr) : number => prev += Number(curr.value || 0), 0)


    if (experienceAllocated > Number(this.ui.totalExp?.value || 0))
      this.showAlert(this.alerts.experience)
    else 
      this.hideAlert(this.alerts.experience)

      // Update available xp
    this.ui.availableExperience!.value = ((Number(this.ui.totalExp?.value || 0)) - experienceAllocated).toString()

    // Get items with greater than 3 allocated
    let greaterThan3 = itemsAllocated.filter(i => (Number(i.value) || 0) >= 3 )

    if (greaterThan3.length < 3 && experienceAllocated > 0)
    {
      this.showAlert(this.alerts.threeIntoThree)
      this.ui.threeIntoThreeText!.textContent = "3 into 3 rule not satisfied!"
    }
    else if (experienceAllocated > 0)
    {
      this.hideAlert(this.alerts.threeIntoThree)
      this.ui.threeIntoThreeText!.textContent = "3 into 3 rule satisfied"
    }

  }
}


