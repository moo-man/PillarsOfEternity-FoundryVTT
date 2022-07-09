import { getGame } from '../../../pillars';
import { SeasonalActivityData, SeasonalActivityResolve, SeasonalActivityResult } from '../../../types/seasonal-activities';
import { PillarsActor } from '../../actor/actor-pillars';
import BookOfSeasons from '../book-of-seasons';

export default class SeasonalActivity extends Application {

  actor: PillarsActor;
  resolve? : SeasonalActivityResolve

  
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.classes.push("seasonal-activity")
    options.width = 700;
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
}


