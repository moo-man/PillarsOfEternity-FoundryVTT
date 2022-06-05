import { CheckDataFlattened, CheckDialogData, State, WeaponCheckDataFlattened } from '../../types/checks';
import { PillarsActor } from '../actor/actor-pillars';
import PILLARS_UTILITY from '../system/utility';

type DialogData = Dialog.Data & { actor: PillarsActor; targets: Token[]; dialogData: CheckDialogData };

export default class RollDialog extends Dialog {
  actor?: PillarsActor;
  data: DialogData = <DialogData>{};
  dynamicInputs : Record<string, JQuery<HTMLInputElement> | null> = {
    modifier: null,
    state: null,
    steps: null,
  };

  userEntry : {
    modifier: string,
    state: State,
    steps: number
  } = {
      modifier : "",
      state : State.NORMAL,
      steps : 0
  };

  constructor(data: DialogData) {
    super(data);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'roll-dialog',
      resizable: true,
    });
  }

  async _render(...args : Parameters<Dialog["_render"]>) {
    await super._render(...args);
    let automatic = this.runChangeConditionals();
    let select = this.element.find('.effect-select')[0] as HTMLSelectElement;
    if (select) {
      let options = Array.from(select.children) as HTMLOptionElement[];
      options.forEach((opt, i) => {
        if (automatic[i]) {
          opt.selected = true;
          select.dispatchEvent(new Event('change'));
        }
      });
      if (automatic.some((i) => i)) select.focus();
    }
  }

  static async create(data: CheckDialogData): Promise<CheckDataFlattened> {
    let html = await renderTemplate('systems/pillars-of-eternity/templates/apps/roll-dialog.html', data);
    return new Promise((resolve) => {
      return new this({
        title: data.title,
        content: html,
        actor: data.actor,
        targets: data.targets,
        dialogData: data,
        buttons: {
          roll: {
            label: 'Roll',
            callback: (dlg) => {
              let data: CheckDataFlattened = <CheckDataFlattened>{};
              let html = $(dlg);
              data.modifier = html.find("input[name='modifier']").val()?.toString() || '';
              data.steps = parseInt(html.find("select[name='steps']").val()?.toString() || '') || 0;
              data.proxy = html.find("input[name='proxy']").is(':checked')?.toString() || '';
              data.assister = html.find("select[name='assistance']").val()?.toString() || '';
              data.state = <State>(html.find("input:radio[name='state']:checked").val()) || State.NORMAL;
              data.rollMode = (html.find("select[name='rollMode']").val()?.toString() as keyof CONFIG.Dice.RollModes) || CONFIG.Dice.rollModes.publicroll;
              resolve(data);
            },
          },
        },
        default: 'roll',
      }).render(true);
    });
  }

  runChangeConditionals() {
    let results = this.data.dialogData.changes.map((c) => {
      try {
        let func = new Function('data', c.conditional.script).bind({ actor: this.data.actor, targets: this.data.targets, effect: c.document });
        return func(this.data.dialogData) == true; // Only accept true returns
      } catch (e) {
        console.error('Something went wrong when processing conditional dialog effect: ' + e, c);
        return false;
      }
    });
    return results;
  }

  activateListeners(html : JQuery) {
    super.activateListeners(html);
    this.dynamicInputs = {
      modifier: null,
      state: null,
      steps: null,
    };

    html.find('input').on("focus", (ev : JQuery.FocusEvent) => {
      ev.currentTarget.select();
    });

    html.find("input[name='proxy']").on("change", ((ev : JQuery.ChangeEvent) => {
      let select = html.find("select[name='assistance']")[0] as HTMLSelectElement;
      if (ev.target.checked) {
        select.value = '';
        select.setAttribute('disabled', "true");
      } else select.removeAttribute('disabled');
    }))

    this.dynamicInputs.steps = html.find<HTMLInputElement>("select[name='steps']").on("change", ((ev : JQuery.ChangeEvent) => {
      this.userEntry.steps = parseInt(ev.currentTarget.value);
      this._setStepDice();
    }))

    this.dynamicInputs.modifier = html.find<HTMLInputElement>("[name='modifier']").on("change", ((ev : JQuery.ChangeEvent) => {
      this.userEntry.modifier = $(ev.currentTarget).val()?.toString() || "";
    }))

    this.dynamicInputs.state = html.find<HTMLInputElement>("[name='state']").on("change", ((ev : JQuery.ChangeEvent) => {
      this.userEntry.state = <State>$(ev.currentTarget).val();
    }))

    html.find('.effect-select').on("change", (this._onEffectSelect.bind(this)));

    this.userEntry = {
      modifier: (this.dynamicInputs.modifier[0])?.value.toString() || "",
      state: <State>(Array.from(this.dynamicInputs['state'])).filter((i) => i.checked)[0]?.value,
      steps: parseInt(this.dynamicInputs.steps[0]?.value || "")
    };
  }

  _setStepDice() {
    let stepDice = this._element!.find<HTMLInputElement>("input[name='step-dice']")[0]!;
    let steps = parseInt(this._element!.find<HTMLInputElement>("select[name='steps']")[0]?.value || "");
    if (steps == 0) {
      stepDice.value = '';
      return;
    }
    let negative = steps < 0;
    let dice = `1d${PILLARS_UTILITY.stepsToDice(steps).faces}`;

    stepDice.value = negative ? `-${dice}` : dice;
  }

  _onEffectSelect(ev) {
    let changes = [];
    $(ev.currentTarget)
      .val()
      .map((i) => {
        let indices = i.split(',');
        indices.forEach((changeIndex) => {
          changes.push(this.data.dialogData.changes[parseInt(changeIndex)]);
        });
      });

    for (let type in this.dynamicInputs) {
      if (type != 'state') this.dynamicInputs[type][0].value = this.userEntry[type];
    }

    changes.forEach((change) => {
      let input = this.dynamicInputs[change.key]?.[0] as HTMLInputElement
      if (input) {
        if (change.key == 'modifier') {
          if (input.value == '') input.value = change.value;
          else if (isNaN(Number(input.value)) || isNaN(change.value)) {
            input.value = input.value + ' + ' + change.value;
          } else {
            input.value = (parseInt(input.value) + parseInt(change.value)).toString();
          }
        }
        if (change.key == 'steps') {
          input.value = (parseInt(input.value) + parseInt(change.value)).toString();
        }
      }
    });

    let stateChanges = changes.filter((change) => change.key == 'state');
    let adv = stateChanges.some((change) => change.value == 'adv') || this.userEntry.state == 'adv';
    let dis = stateChanges.some((change) => change.value == 'dis') || this.userEntry.state == 'dis';
    let finalState = '';
    if ((adv && dis) || (!adv && !dis)) finalState = 'normal';
    else if (adv) finalState = 'adv';
    else if (dis) finalState = 'dis';

    (Array.from(this.dynamicInputs['state']!).find((i) => i.id == `state-${finalState}`))!.checked = true;

    this._setStepDice();
  }
}
