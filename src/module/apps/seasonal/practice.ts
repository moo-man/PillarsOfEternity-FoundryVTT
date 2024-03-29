import { getGame } from "../../system/utility";
import { hasXPData } from "../../../types/common";
import {SeasonalActivityResult, PracticeTemplateData } from "../../../types/seasonal-activities";
import { PillarsItem } from "../../document/item-pillars";
import SeasonalActivityApplication from "./seasonal-activity";

export default class PracticeSeasonalActivityApplication extends SeasonalActivityApplication 
{
    ui: {
    xp?: HTMLInputElement;
    skillSelect?: HTMLSelectElement;
    skillDrag?: HTMLDivElement;
    skillImg?: HTMLImageElement;
    skillName?: HTMLHeadingElement;
  } & SeasonalActivityApplication["ui"] = {};

    alerts: {
    skillAlert?: HTMLAnchorElement;
  } = {};


    item? : PillarsItem; 

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("practice");
        options.width = 400;
        options.height = 400;
        return options;
    }

    get template() 
    {
        return "systems/pillars-of-eternity/templates/apps/seasonal/practice.hbs";
    }

    get title() 
    {
        return getGame().i18n.localize("PILLARS.Practice");
    }
    
    static get label(): string 
    {
        return getGame().i18n.localize("PILLARS.Practice");
    }


    async getData(): Promise<PracticeTemplateData> 
    {
        const data = (await super.getData()) as PracticeTemplateData;
        data.skills = getGame().items?.contents.filter(i => i.type == "skill") || [];
        return data;
    }

    async submit(): Promise<SeasonalActivityResult> 
    {
        const result = <SeasonalActivityResult>{};

        const xp = Number(this.ui.xp?.value);

        if (xp > 0 && this.item)
        {
            const itemData = this.item.toObject();
            if(hasXPData(itemData))
            {
                itemData.data.xp.value += xp;
                result.data = {items : [itemData], name : this.actor.name!, type : this.actor.type};
                result.text = `Practice: +${xp} ${itemData.name}`;
            }
        }

        if (this.resolve)
        {this.resolve(result);}

        return result;
    }

    async _onDragDrop(ev : DragEvent)
    {

        this.ui.skillDrag?.classList.remove("hover");
        const dragData = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");
        const item : PillarsItem | undefined = await Item.fromDropData(dragData);

        this.setSkill(item);
    }


    setSkill(item: PillarsItem | undefined) 
    {

        const game = getGame();

        if (!item)
        {return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorCannotFindItem"));}

        if (item.type != "skill" && item.type != "powerSource")
        {return ui.notifications!.error(game.i18n.localize("PILLARS.ErrorPracticeSkillsOnly"));}


        // If given skill is the same name as one the actor owns, use the owned one instead
        if (item.parent != this.actor)
        {
            const ownedSkill = this.actor.items.getName(item.name!);
            if (ownedSkill)
            {item = ownedSkill;}
        }

        if (item)
        {
            this.item = item;
      this.ui.skillImg!.src = item.data.img!;
      this.ui.skillSelect!.value = item.id!;
      
      this.ui.skillName!.textContent = item.name;

      if (item.type == "powerSource" || ["artistic", "martial"].includes(item.system.category?.value || ""))
      {this.ui.xp!.value = "5";}
      else 
      {this.ui.xp!.value = "10";}
      
        }
        this.checkData();
    }

    activateListeners(html: JQuery<HTMLElement>): void 
    {

        const dragDrop = new DragDrop({
            dragSelector: ".item",
            dropSelector : ".dragarea",
            permissions : {dragstart : () => true, drop : () => true},
            callbacks : { drop: this._onDragDrop.bind(this) }
        });

        dragDrop.bind(html[0]!);

        super.activateListeners(html);
        this.alerts.skillAlert = html.find<HTMLAnchorElement>(".item-header .alert")[0];
        this.ui.skillSelect = html.find<HTMLSelectElement>(".skill select").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const id = ev.currentTarget.value;
            const item = getGame().items!.get(id);
            this.setSkill(item);

        })[0];
        this.ui.skillDrag = html.find<HTMLDivElement>(".dragarea")[0];
        this.ui.skillImg = html.find<HTMLImageElement>(".dragarea img")[0];
        this.ui.skillName = html.find<HTMLImageElement>(".item-name")[0];
        this.ui.xp = html.find<HTMLInputElement>(".xp-footer input")[0];

        this.ui.skillDrag?.addEventListener("dragenter", (ev : DragEvent) => 
        {
            (ev.target as HTMLElement).classList.add("hover");
        });
        this.ui.skillDrag?.addEventListener("dragleave", (ev : DragEvent) => 
        {
            (ev.target as HTMLElement).classList.remove("hover");
        });
    }

    async checkData(): Promise<{ errors: string[]; message: string }> 
    {
        const state : {errors: string[], message : string}= {errors : [], message : ""};

        if (this.item)
        {
            if (["social", "academic"].includes(this.item.system.category?.value!))
            {
                this.showAlert(this.alerts.skillAlert);
                state.errors.push(getGame().i18n.localize("PILLARS.CantPracticeSkill"));
            }
            else
            {
                this.hideAlert(this.alerts.skillAlert);
            }
        }
    
        state.message = getGame().i18n.format("PILLARS.PracticeErrors", { errors: `<ul>${"<li>" + state.errors.join("</li><li>") + "</li>"}</ul>` });

        return state;
    }
}
