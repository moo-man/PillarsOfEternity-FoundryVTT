import { TokenDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tokenData";
import { getGame } from "../system/utility";
import { CheckAddData, DialogDamage } from "../../types/checks";
import { Defense } from "../../types/common";
import { PillarsItem } from "../document/item-pillars";
import SkillCheck from "../system/rolls/skill-check";



interface DamageDialogRenderOptions extends Application.RenderOptions {
    resolve : (value: DialogDamage[]) => void
    reject : (reason?: any) => void
}

export default class DamageDialog extends Application
{

    item : PillarsItem;
    check : SkillCheck;
    targets : TokenDocument[];
    disabled : TokenDocument[];
    additionalDamages : number;
    addedCrits : number;
    damages : DialogDamage[];
    resolve? : (value: DialogDamage[]) => void;
    reject? : (reason? :any) => void;

    constructor(item : PillarsItem, check: SkillCheck, targets : TokenDocument[])
    {
        super();
        this.item = foundry.utils.deepClone(item);
        this.check = check;
        this.targets = targets;//.map(i => i.document)
        this.disabled = []; // unselectable targets due to not exceeding defense
        this.additionalDamages = 0;
        this.addedCrits = 0;
        this.damages = this.constructDamages();
        this.assignTargets();
        this.calculateCritDice();
    }

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["pillars-of-eternity", "check-dialog", "damage-dialog", "form"]);
        options.title = getGame().i18n.localize("PILLARS.Damage");
        options.resizable = true;
        options.width = 550;
        options.template = "systems/pillars-of-eternity/templates/apps/damage-dialog.hbs";
        return options;
    }


    render(force=false, options : Partial<DamageDialogRenderOptions> = {}) 
    {

        super.render(force, options);
        if (options.resolve)
        {this.resolve = options.resolve;}
        if (options.reject)
        {this.reject = options.reject;}
    }

    getData() 
    {
        const data : Partial<Pick<DamageDialog, "damages" | "targets" | "disabled">> = {};

        data.damages = this.damages;
        data.targets = this.targets;
        data.disabled = this.disabled;

        return data;
    }

    constructDamages() 
    {
        let damages :  DialogDamage[] = [];

        if(this.item.system.damage)
        {
            damages = foundry.utils.deepClone(this.item.system.damage.value) as DialogDamage[];
            if (this.check && this.check.addedProperties?.damage?.length)
            {
                // Separate
                this.addedCrits = this.check.addedProperties.damage.filter((d) => !d.base && !d.crit && d.defaultCrit).reduce((prev : number , current : DialogDamage) => prev += current.defaultCrit, 0);
                damages = damages.concat(this.check.addedProperties.damage as DialogDamage[]);
            }

            damages = damages.filter(d => d.crit || d.base);
            damages.forEach((damage, i) => 
            {
                damage.mult = undefined;
                if (!damage.label) {damage.label = this.item.name || "";}
            });
        }
        return damages;
    }

    addDamage() 
    {
        this.additionalDamages++;
        this.damages.push(duplicate(this.damages[this.damages.length-1]) as DialogDamage);
        this.render(true);
    }

    calculateCritDice()
    {
        if (!this.check)
        {return false;}

        try 
        {
            for (const damage of this.damages)
            {
                if (!damage.target)
                {damage.mult = this.addedCrits;}
                const defense = damage.defense.toLowerCase() || "deflection";
                const target = this.targets.find(i => i.id == damage.target);
                let multiplier = 0;
                if (target?.actor && target?.actor?.type != "headquarters")
                {
                    const margin = (this.check.result?.total || 0) - (target?.actor?.system.defenses?.[<Defense>defense]!.value || 0);
                    multiplier = Math.floor(margin / 5);
                }
                damage.mult = this.check.requiresRoll ? multiplier : 0;

                // don't add default crits unless the attack hit
                if (damage.mult >= 0)
                {
                    damage.mult += this.addedCrits;
                    damage.mult += damage.defaultCrit || 0;
                }

                // Don't try to use a multiplier if no crit dice
                if (!damage.crit || Number(damage.crit) == 0)
                {
                    damage.mult = 0;
                }

                // If the attack didn't hit, disable the target
                if (damage.mult < 0)
                {
                    if (target && !this.disabled.find(t => t.id == target!.id))
                    {this.disabled.push(target);}
                    const targetIndex = this.targets.findIndex(i => i.id == damage.target);
                    if (targetIndex > -1)
                    {this.targets.splice(targetIndex, 1);}

                    delete damage.img;
                    delete damage.target;
                }
            }
        }
        catch(e)
        {
            console.log(getGame().i18n.localize("PILLARS.ErrorSetTargetDamage") + ": " + e);
        }

    }

    assignTargets()
    {
        const sizeDiff = this.targets.length - this.damages.length;


        for (let i = 0; i < sizeDiff; i++)
        {
            this.damages.push(duplicate(this.damages[this.damages.length-1]) as DialogDamage);
            this.additionalDamages++;
        }



        this.damages.forEach((damage, i) => 
        {
            damage.target = this.targets[Math.min(i, this.targets.length-1)]?.id;
            damage.img = this.targets[Math.min(i, this.targets.length-1)]?.data?.img;
        });
    }

    setTargetImages()
    {
        for(let i = 0; i < this.damages.length; i++)
        {this.setTargetImage(i);}
    }

    setCritSelections()
    {
        for(let i = 0; i < this.damages.length; i++)
        {this.setCritSelection(i);}
    }


    setTargetImage(index : number)
    {
        const damage = this.damages[index];
        const target = this.targets.find(i => i.id == damage?.target);
        const parent = this.element.find(`[data-index='${index}']`);
        const img = target ? target.data.img : "";
        parent.find(".target").find("img").attr("src", img);
    }

    setCritSelection(index : number)
    {
        const damage = this.damages[index];
        const parent = this.element.find(`[data-index='${index}']`);
        const select = parent.find<HTMLSelectElement>("select.mult")[0];
        if (damage && select)
        {select.value = damage.mult?.toString() || "";}
    }

    submit(ev : JQuery.UIEventBase) 
    {   
        ev.preventDefault();
        const damages = duplicate(this.damages) as typeof this.damages;
        damages.forEach(d => d.target = this.targets.find(i => i.id == d.target));
        damages.forEach(d => d.misses = <TokenDataProperties[]>this.disabled.map(i => i.toObject()));
        this.close({});
        if (this.resolve)
        {return this.resolve(damages);}
    }

    _onKeyDown(ev : JQuery.KeyDownEvent)
    {
        if (ev.key == "Enter")
        {
            ev.preventDefault();
            ev.stopPropagation();
            this.submit(ev);
        }
    }

    async close(options: Application.CloseOptions) 
    {
        $(document).off("keydown.damage");
        return super.close(options);
    }

    activateListeners(html : JQuery<HTMLElement>)
    {
        super.activateListeners(html);

        html.find(".add-roll").on("click", this.addDamage.bind(this));
        html.find("button").on("click", this.submit.bind(this));

        html.find(".label,.type,.base,.crit,.mult").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const parent = $(ev.currentTarget).parents(".damage");
            const index = parseInt(parent.attr("data-index") || "");
            const property = ev.currentTarget.classList[1];
            if (Number.isNumeric(index) && this.damages[index])
            {
                setProperty(this.damages[index]!, property, ev.target.value);
            }
        });

        html.find(".target-select").on("change", (ev : JQuery.ChangeEvent) => 
        {
            const parent = $(ev.currentTarget).parents(".damage");
            const damageIndex = parseInt(parent.attr("data-index") || "");

            if (damageIndex && this.damages[damageIndex])
            {
                this.damages[damageIndex]!.target = ev.target.value;
                this.damages[damageIndex]!.img = this.targets.find(i => i.id == ev.target.value)?.data?.img;
                this.calculateCritDice();
                this.setTargetImages();
                this.setCritSelections();
            }
        });

        // TODO: Test this
        $(document).on("keydown", ".damage", this._onKeyDown.bind(this));

    }


}