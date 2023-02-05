import { getGame } from "../system/utility";
import { DialogHealing } from "../../types/checks";
import { PillarsItem } from "../document/item-pillars";
import SkillCheck from "../system/rolls/skill-check";

interface HealingDialogRenderOptions extends Application.RenderOptions {
    resolve : (value: DialogHealing[]) => void
    reject : (reason?: any) => void
}

export default class HealingDialog extends Application
{
    item : PillarsItem;
    check : SkillCheck;
    targets : TokenDocument[];
    additionalHealing : number;
    healing : DialogHealing[];
    resolve? : (value: DialogHealing[]) => void;
    reject? : (reason?: any) => void;

    constructor(item : PillarsItem, check : SkillCheck, targets: TokenDocument[])
    {
        super();
        this.item = foundry.utils.deepClone(item);
        this.check = check;
        this.targets = targets;//.map(i => i.document)
        this.additionalHealing = 0;
        this.healing = this.constructHealing();
        this.assignTargets();
    }

    static get defaultOptions() 
    {
        return mergeObject(super.defaultOptions, {
            id: "healing-dialog",
            classes : ["pillars-of-eternity"],
            title : getGame().i18n.localize("PILLARS.Healing"),
            //height: "auto",
            resizable: true,
            width: 500,
            template : "systems/pillars-of-eternity/templates/apps/healing-dialog.hbs"
        });
    }


    render(force=false, options: Partial<HealingDialogRenderOptions>) 
    {
        super.render(force, options);
        if (options.resolve)
        {this.resolve = options.resolve;}
        if (options.reject)
        {this.reject = options.reject;}
    }
    
    getData() 
    {

        const data : Partial<Pick<HealingDialog, "healing" | "targets">> = {};

        data.healing = this.healing;
        data.targets = this.targets;
        
        return data;
    }

    constructHealing() 
    {
        const healing : DialogHealing[] = foundry.utils.deepClone(this.item.system.healing)!;

        healing.forEach(h => 
        {
            if (!h.label) {h.label = this.item.name!;}
        });
        return healing;
    }

    addHealing() 
    {
        this.additionalHealing++;
        this.healing.push(duplicate(this.healing[this.healing.length-1]) as DialogHealing);
        this.render(true, {});
    }

    assignTargets() 
    {
        const sizeDiff = this.targets.length - this.healing.length;

        for (let i = 0; i < sizeDiff; i++)
        {
            this.healing.push(duplicate(this.healing[this.healing.length-1]) as DialogHealing);
            this.additionalHealing++;
        }

        this.healing.forEach((healing, i) => 
        {
            healing.target = this.targets[Math.min(i, this.targets.length-1)]?.id;
            healing.img = this.targets[Math.min(i, this.targets.length-1)]?.data?.img;
        });
    }

    setTargetImages() 
    {
        for(let i = 0; i < this.healing.length; i++)
        {this.setTargetImage(i);}
    }



    setTargetImage(index: number)
    {
        const healing = this.healing[index];
        const target = this.targets.find(i => i.id == healing?.target);
        const parent = this.element.find(`[data-index='${index}']`);
        const img = target ? target.data.img : "";
        parent.find(".target").find("img").attr("src", img);
    }

    submit() 
    {
        const healing = duplicate(this.healing) as typeof this.healing;
        healing.forEach(h => h.target = this.targets.find(i => i.id == h.target));
        healing.forEach(h => h.healing = true);
        this.close({});
        if (this.resolve)
        {return this.resolve(healing);}
    }

    _onKeyDown(ev : JQuery.KeyDownEvent)
    {
        if (ev.key == "Enter")
        {
            ev.preventDefault();
            ev.stopPropagation();
            this.submit();
        }
    }

    async close(options : Application.CloseOptions) 
    {
        $(document).off("keydown.damage");
        return super.close(options);
    }

    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html);

        html.find(".add-damage").on("click", this.addHealing.bind(this));
        html.find("button").on("click", this.submit.bind(this));

        html.find(".label,.base").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const parent = $(ev.currentTarget).parents(".healing");
            const index = parseInt(parent.attr("data-index") || "");
            const property = ev.currentTarget.classList[1];
            if (Number.isNumeric(index) && this.healing[index])
            {setProperty(this.healing[index]!, property, ev.target.value);}
        });

        html.find(".target-select").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const parent = $(ev.currentTarget).parents(".healing");
            const healingIndex = parseInt(parent.attr("data-index") || "");
 
            if (Number.isNumeric(healingIndex) && this.healing[healingIndex])
            {
                this.healing[healingIndex]!.target = ev.target.value;
                this.healing[healingIndex]!.img = this.targets.find(i => i.id == ev.target.value)?.data?.img;
                this.setTargetImages();

            }
        });

        $(document).on("keydown", ".damage", this._onKeyDown.bind(this));
    }


}