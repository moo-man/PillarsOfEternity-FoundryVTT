import { getGame } from '../../../pillars';
import { SeasonalActivityData, SeasonalActivityResolve, SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';

export default class SeasonalActivity extends Application {

  actor: PillarsActor;
  resolve? : SeasonalActivityResolve

  ui : {
    submitButton?: HTMLButtonElement;
  } = {}
  
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.classes.push("seasonal-activity")
    options.resizable = true;
    return options
  }


  constructor(data : SeasonalActivityData, resolve? : SeasonalActivityResolve, options?: ApplicationOptions) {
    super(options);
    {
      this.actor = data.actor;
      this.resolve = resolve
    }
  }

  static get label(): string {
    return getGame().i18n.localize('PILLARS.SeasonalActivity');
  }

  static create(data : SeasonalActivityData): Promise<SeasonalActivityResult> {
    return new Promise<SeasonalActivityResult>(async resolve => {
      let app = new this(data, resolve)
      app.render(true);
    })
  }

  submit(): SeasonalActivityResult {
    if (this.resolve)
      this.resolve({text : "", data : this.actor.toObject()})
    return {text : "", data : this.actor.toObject()}
  };

  showAlert(alert : HTMLAnchorElement | undefined)
  {
    if (alert)
      alert.style.display = ""
  }

  hideAlert(alert : HTMLAnchorElement | undefined)
  {
    if (alert)
      alert.style.display = "none"
  }

  checkData() : {errors : string[], message : string}{
    return {
      message : "",
      errors: []
    }
  }



  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)
    
    this.ui.submitButton = html.find<HTMLButtonElement>("button[type='submit']").on('click', (ev: JQuery.ClickEvent) => {
      let game = getGame();

      let state = this.checkData();

      if (state.errors.length) {
        Dialog.confirm({
          title: game.i18n.localize('Error'),
          content: state.message,
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
}


