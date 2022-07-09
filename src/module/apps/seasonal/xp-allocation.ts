import { getGame } from '../../../pillars';
import { XPAllocationData, XPAllocationTemplateData, SeasonalActivityResult, SeasonalActivityResolve } from '../../../types/seasonal-activities';
import SeasonalActivity from './seasonal-activity';

export default class XPAllocationActivity extends SeasonalActivity {
  experience: number | undefined;

  editableExperience: boolean;

  ui: {
    threeIntoThreeText?: HTMLSpanElement;
    availableExperience?: HTMLInputElement;
    totalExp?: HTMLInputElement;
    itemLists?: HTMLDivElement;
    submitButton?: HTMLButtonElement;
  } = {};

  alerts: {
    threeIntoThreeAlert?: HTMLAnchorElement;
    threeIntoThreePass?: HTMLAnchorElement;
    experience?: HTMLAnchorElement;
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
  }

  get template() {
    return 'systems/pillars-of-eternity/templates/apps/seasonal/xp-allocation.html';
  }

  async getData(): Promise<XPAllocationTemplateData> {
    let data = (await super.getData()) as XPAllocationTemplateData;
    data.lists = {};
    data.experience = this.experience;
    data.editableExperience = this.editableExperience;
    return data;
  }

  submit(): SeasonalActivityResult {
    let result = <SeasonalActivityResult>{};

    let experienceList: string[] = [];
    // get all items with experience allocated
    let itemData = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>('.item-experience')!)
      .filter((i) => (i.value || 0) > 0)
      .map((i) => {
        let id = i.parentElement?.dataset.id;
        let item = this.actor.items.get(id!);
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

    this.alerts.threeIntoThreeAlert = html.find<HTMLAnchorElement>('.3into3 .alert')[0];
    this.alerts.threeIntoThreePass = html.find<HTMLAnchorElement>('.3into3 .pass')[0];
    this.alerts.experience = html.find<HTMLAnchorElement>('.experience .alert')[0];

    this.ui.submitButton = html.find<HTMLButtonElement>("button[type='submit']").on('click', (ev: JQuery.ClickEvent) => {
      let game = getGame();

      let errors = this.checkData();

      if (errors?.length) {
        Dialog.confirm({
          title: game.i18n.localize('Error'),
          content: game.i18n.format('PILLARS.XPAllocationErrors', { errors: `<ul>${'<li>' + errors.join('</li><li>') + '</li>'}</ul>` }),

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

    // If no experience, prevent item lists from being filled
    if (!this.ui.totalExp?.value && !this.ui.itemLists?.classList.contains('disabled')) {
      this.ui.itemLists?.classList.add('disabled');
      this.ui.submitButton!.disabled = true;
      this.hideAlert(this.alerts.experience);
      this.hideAlert(this.alerts.threeIntoThreeAlert);
      this.hideAlert(this.alerts.threeIntoThreePass);
      return;
    } else if (this.ui.itemLists?.classList.contains('disabled')) {
      this.ui.submitButton!.disabled = false;
      this.ui.itemLists.classList.remove('disabled');
    }

    // Get all items with experience allocated
    let itemsAllocated = Array.from(this.ui.itemLists?.querySelectorAll<HTMLInputElement>('.item-experience')!).filter((i) => (i.value || 0) > 0);

    // Total the experience allocated
    let experienceAllocated = itemsAllocated.reduce((prev, curr): number => (prev += Number(curr.value || 0)), 0);

    if (experienceAllocated > Number(this.ui.totalExp?.value || 0)) {
      this.showAlert(this.alerts.experience);
      errors.push('Allocated XP exceeds total XP available.');
    } else {
       if (experienceAllocated < Number(this.ui.totalExp?.value || 0))
        errors.push('XP still available to spend')
       this.hideAlert(this.alerts.experience);
    }

    // Update available xp
    this.ui.availableExperience!.value = (Number(this.ui.totalExp?.value || 0) - experienceAllocated).toString();

    // Get items with greater than 3 allocated
    let greaterThan3 = itemsAllocated.filter((i) => (Number(i.value) || 0) >= 3);

    if (greaterThan3.length < 3 && experienceAllocated > 0) {
      this.showAlert(this.alerts.threeIntoThreeAlert);
      this.hideAlert(this.alerts.threeIntoThreePass);
      errors.push('3 into 3 rule not satisified');
    } else if (experienceAllocated > 0) {
      this.hideAlert(this.alerts.threeIntoThreeAlert);
      this.showAlert(this.alerts.threeIntoThreePass);
    }

    return errors;
  }
}
