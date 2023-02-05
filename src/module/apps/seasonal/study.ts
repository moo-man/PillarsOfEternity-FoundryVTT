import { getGame } from "../../system/utility";
import { ItemType } from "../../../types/common";
import { SeasonalActivityResult } from "../../../types/seasonal-activities";
import { PillarsItem } from "../../document/item-pillars";
import { StudyActivity } from "../../system/seasonal/study";
import { StudyTeacherActivity } from "../../system/seasonal/study-teacher";
import { StudyTextActivity } from "../../system/seasonal/study-text";
import SeasonalActivityApplication from "./seasonal-activity";
import { PillarsActor } from "../../document/actor-pillars";

export default class StudySeasonalActivityApplication extends SeasonalActivityApplication 
{
    ui: {
    xp?: HTMLInputElement;
    itemDrag?: HTMLDivElement;

    // teachingSkill? : HTMLSpanElement;

    actorDrag?  : HTMLDivElement,
  } & SeasonalActivityApplication["ui"] = {};

    alerts: {
    languagePass?: HTMLAnchorElement;
    languageWarn?: HTMLAnchorElement;
    languageAlert?: HTMLAnchorElement;
    skillMinimum? : HTMLAnchorElement
    skillMaximum? : HTMLAnchorElement
    reqPass?: HTMLAnchorElement;
    reqAlert?: HTMLAnchorElement;
  } = {};

    object? : StudyActivity;

    mode : "text" | "teacher" = "text";

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 600;
        options.height = "auto";
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "text" }];
        return options;
    }

    get template() 
    {
        return "systems/pillars-of-eternity/templates/apps/seasonal/study.hbs";
    }

    get title() 
    {
        return getGame().i18n.localize("PILLARS.Study");
    }

    static get label(): string 
    {
        return getGame().i18n.localize("PILLARS.Study");
    }

  
    async _render(...args : Parameters<Application["_render"]>)
    {
        await super._render(...args);
        this.checkData();
    }

    async getData(options?: Partial<ApplicationOptions> | undefined)
    {
        return {
            object : this.object,
            skills : this.object instanceof StudyTeacherActivity 
                ? this.object.teacher.getItemTypes(ItemType.skill).filter(i => (i.rank || 0) > 0) 
                : []
        };
    }

    async submit(): Promise<SeasonalActivityResult> 
    {
        let result = <SeasonalActivityResult>{};

        const xp = Number(this.ui.xp?.value);

        result = await this.object?.getSubmitData(xp) || result;

        if (this.resolve)
        {this.resolve(result);}

        return result;
    }
    async _onDragDrop(ev: DragEvent) 
    {
        this.ui.itemDrag?.classList.remove("hover");
        const dragData = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");

        if (dragData.type == "Item")
        {
            const item : PillarsItem | undefined = await Item.fromDropData(dragData);
            this.setItem(item);
        }
        else if (dragData.type == "Actor")
        {
            const actor = await Actor.fromDropData(dragData);
            this.setActor(actor);
        }
    }

    setItem(item: PillarsItem | undefined) 
    {
        const game = getGame();

        if (!item) {return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCannotFindItem"));}

        if (item.data.type != "equipment" || (item.data.type == "equipment" && item.system.category.value != "book"))
        {return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorPracticeSkillsOnly"));}

        if (this.mode == "text")
        {
            this.object = new StudyTextActivity(this.actor, item);
            this.render(true);
        }
    }

    setActor(actor : PillarsActor | undefined)
    {
        const game = getGame();
        if (!actor) {return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCannotFindActor"));}


        if (this.mode == "teacher")
        {
            this.object = new StudyTeacherActivity(this.actor, actor);
            this.render(true);
        }


        this.checkData();
    }


    _onChangeTab(event: MouseEvent | null, tabs: Tabs, active: string): void 
    {
        super._onChangeTab(event, tabs, active);
        this.mode = active as "text" | "teacher";
    }

    activateListeners(html: JQuery<HTMLElement>): void 
    {
        const dragDrop = new DragDrop({
            dragSelector: ".item",
            dropSelector: ".dragarea",
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: this._onDragDrop.bind(this) },
        });

        dragDrop.bind(html[0]!);

        super.activateListeners(html);
        this.alerts.languagePass = html.find<HTMLAnchorElement>(".language .pass")[0];
        this.alerts.languageWarn = html.find<HTMLAnchorElement>(".language .warn")[0];
        this.alerts.languageAlert = html.find<HTMLAnchorElement>(".language .alert")[0];
        this.alerts.reqPass = html.find<HTMLAnchorElement>(".req .pass")[0];
        this.alerts.reqAlert = html.find<HTMLAnchorElement>(".req .alert")[0];
        this.ui.actorDrag = html.find<HTMLDivElement>(".dragarea")[0];
        this.ui.itemDrag = html.find<HTMLDivElement>(".dragarea.item")[0];
        this.ui.xp = html.find<HTMLInputElement>(".xp input")[0];
        this.alerts.skillMaximum = html.find<HTMLAnchorElement>(".skill-maximum .alert")[0];
        this.alerts.skillMinimum = html.find<HTMLAnchorElement>(".teaching-minimum .alert")[0];

        html.find(".skill-select").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const skill = ev.currentTarget.value;
            if (this.object instanceof StudyTeacherActivity)
            {
                this.object.setSkill(skill);
                this.render(true);
            }
        });

        html.find<HTMLInputElement>("[name='skillMaximum'],[name='raiseMinimum'],[name='students']").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const property = ev.currentTarget.name as "students" | "raiseMinimum" | "skillMaximum";
            if (this.object instanceof StudyTeacherActivity)
            {
                this.object[property] = Number(ev.currentTarget.value);
                // let input = ev.currentTarget as HTMLInputElement;

                // if (input.parentElement)
                //   input.parentElement.querySelector<HTMLSpanElement>(".range-value")!.textContent = this.object[property].toString()

                this.object.evaluate();
                this.render(true);

            }
        });

        this.ui.itemDrag?.addEventListener("dragenter", (ev: DragEvent) => 
        {
            (ev.target as HTMLElement).classList.add("hover");
        });
        this.ui.itemDrag?.addEventListener("dragleave", (ev: DragEvent) => 
        {
            (ev.target as HTMLElement).classList.remove("hover");
        });
    }

    async checkData(): Promise<{ errors: string[]; message: string }> 
    {
        const state: { errors: string[]; message: string } = { errors: [], message: "" };
        const game = getGame();

        if (this.mode == "text")
        {
            if (this.object?.status.range && this.object?.status.range != "ok")
            {
                state.errors.push(game.i18n.localize("PILLARS.NotWithinBookSkillRange"));
                this.showAlert(this.alerts.reqAlert, this.object.text.range);
                this.hideAlert(this.alerts.reqPass);
            }
            else if (this.object?.status.range == "ok")
            {
                this.showAlert(this.alerts.reqPass, this.object.text.range);
                this.hideAlert(this.alerts.reqAlert);
            }
      
            if (this.object?.status.language == "full")
            {
                this.showAlert(this.alerts.languagePass, this.object.text.language);
                this.hideAlert(this.alerts.languageWarn);
                this.hideAlert(this.alerts.languageAlert);
            }
            else if (this.object?.status.language == "half")
            {
                this.showAlert(this.alerts.languageWarn, this.object.text.language);
                this.hideAlert(this.alerts.languagePass);
                this.hideAlert(this.alerts.languageAlert);
            }
            else if (this.object?.status.language == "none")
            {
                state.errors.push(game.i18n.localize("PILLARS.NotProficientBookLanguage"));
                this.showAlert(this.alerts.languageAlert, this.object.text.language);
                this.hideAlert(this.alerts.languagePass);
                this.hideAlert(this.alerts.languageWarn);
            }
        }

        else {(this.mode == "teacher");}
        {
            this.object?.text.skillMaximum 
                ? this.showAlert(this.alerts.skillMaximum, this.object.text.skillMaximum) 
                : this.hideAlert(this.alerts.skillMaximum);

            this.object?.text.skillMinimum 
                ? this.showAlert(this.alerts.skillMinimum, this.object.text.skillMinimum) 
                : this.hideAlert(this.alerts.skillMinimum);
      
            state.errors.push(this.object?.text.skillMaximum || "");
            state.errors.push(this.object?.text.skillMinimum || "");
            state.errors = state.errors.filter(i => i);
        }
    



        state.message = getGame().i18n.format("PILLARS.StudyErrors", { errors: `<ul>${"<li>" + state.errors.join("</li><li>") + "</li>"}</ul>` });

        return state;
    }
}
