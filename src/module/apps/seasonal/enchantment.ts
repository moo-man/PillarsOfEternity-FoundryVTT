import { getGame } from '../../../pillars';
import { hasEmbeddedPowers, hasXP, hasXPData, ItemType } from '../../../types/common';
import { SeasonalActivityResult, PracticeTemplateData, ENCHANTMENT_STATE, SeasonalActivityData } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import { PillarsItem } from '../../item/item-pillars';
import { PILLARS } from '../../system/config';
import { Imbuement } from '../../system/seasonal/enchantment';
import SeasonalActivityApplication from './seasonal-activity';

export default class EnchantmentSeasonalActivityApplication extends SeasonalActivityApplication {
  ui: {
    itemDrag?: HTMLDivElement;
  } & SeasonalActivityApplication['ui'] = {};

  alerts: {} = {};

  item?: PillarsItem | PillarsActor;
  power?: PillarsItem;
  maedrs: PillarsItem[] = [];

  imbuement: Imbuement | undefined;

  submitted = false; // Keep track of this app's submission

  status: {} = {};

  static get defaultOptions() {
    let options = super.defaultOptions;
    options.width = 600;
    options.height = 'auto';
    options.tabs = [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'imbuement' }];
    options.closeOnSubmit = false;
    return options;
  }

  get template() {
    return 'systems/pillars-of-eternity/templates/apps/seasonal/enchantment.html';
  }

  get title() {
    return getGame().i18n.localize('PILLARS.Enchantment');
  }

  static get label(): string {
    return getGame().i18n.localize('PILLARS.Enchantment');
  }

  

  static create(data: SeasonalActivityData): Promise<SeasonalActivityResult> {
    let enchantments = data.actor.getFlag('pillars-of-eternity', 'enchantments') as Record<string, Imbuement["data"]> || {};

    let options = [`<option value="new">New Enchantment</option>`]
    Object.keys(enchantments).forEach(key => {
      options.push(`<option value=${key}>${enchantments[key]?.itemData.name} - ${enchantments[key]?.powerData.name} (${enchantments[key]?.progress.current}/${enchantments[key]?.progress.total})</option>`)
    })

    return new Promise<SeasonalActivityResult>(async (resolve) => {
      new Dialog({
        title: 'Choose Enchantment',
        content: `
        <select>
        ${options.join("")}
        </select>
        `,
        buttons: {
          confirm: {
            label: 'Confirm',
            callback: (dlg) => {
              dlg = $(dlg);
              let value = dlg.find('select')[0]?.value;
              if (value) {
                let app = new this(data, resolve)
                if (value != "new")
                {
                  let imbuement = Imbuement.fromData(enchantments[value]!)
                  app.imbuement = imbuement
                }
                app.render(true)
              }
            },
          },
        },
      }).render(true);
    });
  }

  render(...args: Parameters<Application['render']>) {
    super.render(...args);
    this.checkData();
  }

  async submit(): Promise<SeasonalActivityResult> {
    let result = <SeasonalActivityResult>{};

    if (!this.imbuement) throw new Error('No Enchantment');

    // We don't want to close immediately because users want to see the new progress
    // Instead, change the submit button to a "close" button
    if (this.submitted)
    {
      this.close()
      return result
    }

    try {
      switch (this.imbuement.progress.state) {
        case ENCHANTMENT_STATE.NOT_STARTED:
          this.imbuement.start();
          break;
        case ENCHANTMENT_STATE.IN_PROGRESS:
          this.imbuement.advanceProgress();
          break;
        case ENCHANTMENT_STATE.FINISHED:
          if (this.resolve) {
            this.resolve({ text: this.imbuement.getStateMessage(), data: this.imbuement.getFinishedData() });
            this.close();
          }
      }

      // Look at progress again after click
      switch (this.imbuement.progress.state) {
        case ENCHANTMENT_STATE.NOT_STARTED: // Should not happen
          this.imbuement.start();
          break;
        case ENCHANTMENT_STATE.IN_PROGRESS:
          if (this.resolve) this.resolve({ text: this.imbuement.getStateMessage(), data: this.imbuement.getSaveData() });
          // ui.notifications!.notify("Book of Seasons Updated")
          break;
        case ENCHANTMENT_STATE.FINISHED:
          if (this.resolve) this.resolve({ text: this.imbuement.getStateMessage(), data: this.imbuement.getFinishedData() });
          // ui.notifications!.notify("Item Added and Book of Seasons Updated")

      }

      this.submitted = true;
      await this._render(true);

    } catch (e) {
      ui.notifications!.error('Error Progressing Enchantment: ' + e);
      throw new Error('Error Progressing Enchantment: ' + e);
    }
    return result;
  }

  disable() {
    this.element.find('.enchantment')[0]?.classList.add('disabled');
  }

  async getData() {
    let submitButton = "PILLARS.EnchantmentStart"

    // Priority to Finish, then if this enchantment has already been submitted, change to Close, otherwise, based on progress state
    if (this.imbuement?.progress.state == ENCHANTMENT_STATE.FINISHED)
      submitButton = "PILLARS.EnchantmentFinish"
    
    else if (this.submitted)
      submitButton = "Close"

    else if (this.imbuement?.progress.state == ENCHANTMENT_STATE.IN_PROGRESS)
      submitButton = "PILLARS.EnchantmentContinue"

    else if (this.imbuement?.progress.state == ENCHANTMENT_STATE.NOT_STARTED)
      submitButton = "PILLARS.EnchantmentStart"


    return {
      imbuement: this.imbuement,
      item: this.imbuement?.item || this.item,
      power: this.imbuement?.power || this.power,
      maedrs: this.imbuement?.maedrs || this.maedrs,
      submitButton
    };
  }

  async _onDragDrop(ev: DragEvent) {
    let target = ev.currentTarget as HTMLElement;

    target.classList.remove('hover');
    let dragData = JSON.parse(ev.dataTransfer?.getData('text/plain') || '');

    if (target.dataset.type == 'maedr') {
      let maedr = await PillarsItem.fromDropData(dragData);
      if (maedr) this.addMaedr(maedr);
    } // Item/Actor or Power
    else {
      if (dragData) {
        let item: PillarsItem | PillarsActor | undefined;
        if (dragData.type == 'Item') item = await PillarsItem.fromDropData(dragData);
        else item = await PillarsActor.fromDropData(dragData);

        this.setItem(target.dataset.type as 'power' | 'item', item);
      }
    }
  }

  setItem(type: 'power' | 'item', item: PillarsItem | PillarsActor | undefined) {
    if (type == 'item' && item?.documentName != 'Actor' && !hasEmbeddedPowers(item)) {
      throw ui.notifications?.error('Wrong Item Type');
    }
    if (type == 'power' && item?.type != 'power') {
      throw ui.notifications?.error('Wrong Item Type');
    }

    if (type == 'item') this.item = item;
    else if (type == 'power') this.power = item as PillarsItem;

    if (this.item && this.power) {
      this.imbuement = new Imbuement(this.item, this.power, this.actor, this.maedrs);
    }

    this.render(true);
    this.checkData();
  }

  // Add a maedr to this object if enchantment objct hasn't been created
  addMaedr(maedr: PillarsItem) {
    if (maedr.category?.value == 'maedr') {
      this.imbuement ? this.imbuement.addMaedr(maedr) : this.maedrs.push(maedr);
      this.render(true);
    }
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    const dragDrop = new DragDrop({
      dragSelector: '.item',
      dropSelector: '.dragarea',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this._onDragDrop.bind(this) },
    });

    dragDrop.bind(html[0]!);

    html.find('.dragarea').each((i, element) => {
      element.addEventListener('dragenter', (ev: DragEvent) => {
        (ev.currentTarget as HTMLElement).classList.add('hover');
      });
    });

    html.find('.dragarea').each((i, element) => {
      element.addEventListener('dragleave', (ev: DragEvent) => {
        (ev.currentTarget as HTMLElement).classList.remove('hover');
      });
    });

    html.find('.update-enchantment').on('change', (ev: JQuery.ChangeEvent) => {
      let path = ev.currentTarget.dataset.path as string;
      let value = ev.target.value;
      if (Number.isNumeric(value)) value = Number(value);

      // This listeners handles more than checkboxes, so have to parse values
      if (ev.target.checked == true) value = true;
      else if (ev.target.checked == false) value = false;

      setProperty(this.imbuement?.data!, path, value);
      this.imbuement?.computeProgress();
      this.render(true);
    });
  }

  async checkData(): Promise<{ errors: string[]; message: string }> {
    let state: { errors: string[]; message: string } = { errors: [], message: '' };
    let game = getGame();

    state.message = getGame().i18n.format('PILLARS.StudyErrors', { errors: `<ul>${'<li>' + state.errors.join('</li><li>') + '</li>'}</ul>` });

    return state;
  }
}
