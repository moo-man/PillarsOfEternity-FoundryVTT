import { getGame } from '../../../pillars';
import { XPAllocationData, XPAllocationTemplateData, SeasonalActivityResult, SeasonalActivityResolve } from '../../../types/seasonal-activities';
import { PillarsItem } from '../../item/item-pillars';
import SeasonalActivity from './seasonal-activity';

export default class XPAllocationActivity extends SeasonalActivity {
  experience: number | undefined;

  editableExperience: boolean;
  items : Collection<PillarsItem> | Promise<Collection<PillarsItem>>
  ui: {
    threeIntoThreeText?: HTMLSpanElement;
    availableExperience?: HTMLInputElement;
    totalExp?: HTMLInputElement;
    itemLists?: HTMLDivElement;
  } & SeasonalActivity["ui"]= {};

  alerts: {
    threeIntoThreeAlert?: HTMLAnchorElement;
    threeIntoThreePass?: HTMLAnchorElement;
    experience?: HTMLAnchorElement;
    general?: HTMLAnchorElement;
  } = {};


    
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.width = 700;
    return options
  }


  constructor(data: XPAllocationData, resolve?: SeasonalActivityResolve, options?: ApplicationOptions) {
    super(data, resolve, options);
    this.experience = data.experience;
    this.editableExperience = !data.experience;
    this.items = this.setItems()
  }

  get template() {
    return 'systems/pillars-of-eternity/templates/apps/seasonal/xp-allocation.html';
  }

  async setItems(): Promise<Collection<PillarsItem>> {
    return new Collection(this.actor.items.contents.map(i => [i.id!, i]))
  }


  async getData(): Promise<XPAllocationTemplateData> {
    let data = (await super.getData()) as XPAllocationTemplateData;
    data.lists = {};
    data.experience = this.experience;
    data.editableExperience = this.editableExperience;
    return data;
  }

  async submit(): Promise<SeasonalActivityResult> {
    let result = <SeasonalActivityResult>{};
    let items = await this.items;
    let experienceList: string[] = [];
    // get all items with experience allocated
    let itemData = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>('.item-experience')!)
      .filter((i) => (i.value || 0) > 0)
      .map((i) => {
        let id = i.parentElement?.dataset.id;
        let item = items.get(id!);
        experienceList.push(`+${i.value} ${item?.name}`);
        if (item)
          return {
            _id: item!.id,
            'data.xp.value': (item.xp?.value || 0) + Number(i.value),
            type: item!.type,
            name: item!.name!,
          };
      });
    result.data = { items: itemData, name: this.actor.name!, type: this.actor.type };
    result.text = experienceList.join(', ');

    return result;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    this.ui.threeIntoThreeText = html.find<HTMLSpanElement>('.3into3 span')[0];
    this.ui.availableExperience = html.find<HTMLInputElement>('.experience .availableExp')[0];
    this.ui.totalExp = html.find<HTMLInputElement>('.experience .totalExp').on('change', (ev: JQuery.ChangeEvent) => {
      this.checkData();
    })[0];
    this.ui.itemLists = html.find<HTMLDivElement>('.item-lists')[0];

    html.find('.item-experience').on('change', (ev: JQuery.ChangeEvent) => {
      this.checkData();
    });

    this.alerts.general = html.find<HTMLAnchorElement>('.general.alert')[0];
    this.alerts.threeIntoThreeAlert = html.find<HTMLAnchorElement>('.3into3 .alert')[0];
    this.alerts.threeIntoThreePass = html.find<HTMLAnchorElement>('.3into3 .pass')[0];
    this.alerts.experience = html.find<HTMLAnchorElement>('.experience .alert')[0];

    this.checkData()
  }

  async checkData(): Promise<{ errors: string[]; message: string }> {

    let state : {errors: string[], message : string}= {errors : [], message : ""};
 
    // If no experience, prevent item lists from being filled
    if (!this.ui.totalExp?.value && !this.ui.itemLists?.classList.contains('disabled')) {
      this.ui.itemLists?.classList.add('disabled');
      this.ui.submitButton!.disabled = true;
      this.hideAlert(this.alerts.experience);
      this.hideAlert(this.alerts.threeIntoThreeAlert);
      this.hideAlert(this.alerts.threeIntoThreePass);
      return state;
    } else if (this.ui.itemLists?.classList.contains('disabled')) {
      this.ui.itemLists.classList.remove('disabled');
    }

    this.ui.submitButton!.disabled = this.ui.itemLists?.classList.contains("disabled")!

    // Get all items with experience allocated
    let itemsAllocated = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>('.item-experience')!).filter((i) => (i.value || 0) > 0);

    // Total the experience allocated
    let experienceAllocated = itemsAllocated.reduce((prev, curr): number => (prev += Number(curr.value || 0)), 0);

    if (experienceAllocated > Number(this.ui.totalExp?.value || 0)) {
      this.showAlert(this.alerts.experience);
      state.errors.push('Allocated XP exceeds total XP available.');
    } else {
       if (experienceAllocated < Number(this.ui.totalExp?.value || 0))
        state.errors.push('XP still available to spend')
       this.hideAlert(this.alerts.experience);
    }

    // Update available xp
    this.ui.availableExperience!.value = (Number(this.ui.totalExp?.value || 0) - experienceAllocated).toString();

    // Get items with greater than 3 allocated
    let greaterThan3 = itemsAllocated.filter((i) => (Number(i.value) || 0) >= 3);

    if (greaterThan3.length < 3 && experienceAllocated > 0) {
      this.showAlert(this.alerts.threeIntoThreeAlert);
      this.hideAlert(this.alerts.threeIntoThreePass);
      state.errors.push('3 into 3 rule not satisified');
    } else if (experienceAllocated > 0) {
      this.hideAlert(this.alerts.threeIntoThreeAlert);
      this.showAlert(this.alerts.threeIntoThreePass);
    }

    state.message = getGame().i18n.format('PILLARS.XPAllocationErrors', { errors: `<ul>${'<li>' + state.errors.join('</li><li>') + '</li>'}</ul>` })

    return state;
  }
}
