import { getGame } from "../../system/utility";
import { hasEmbeddedPowers, hasXP, hasXPData, ItemType } from "../../../types/common";
import { SeasonalActivityResult, PracticeTemplateData, ENCHANTMENT_STATE, SeasonalActivityData } from "../../../types/seasonal-activities";
import { PillarsItem } from "../../document/item-pillars";
import { PILLARS } from "../../system/config";
import { Embellishment } from "../../system/seasonal/embellishment";
import { Enchantment } from "../../system/seasonal/enchantment";
import { Imbuement } from "../../system/seasonal/imbuement";
import { Refinement } from "../../system/seasonal/refinement";
import SeasonalActivityApplication from "./seasonal-activity";
import { PillarsActor } from "../../document/actor-pillars";

export default class EnchantmentSeasonalActivityApplication extends SeasonalActivityApplication 
{
    ui: {
    itemDrag?: HTMLDivElement;
  } & SeasonalActivityApplication["ui"] = {};

    alerts: object = {};

    item?: PillarsItem | PillarsActor;
    power?: PillarsItem;
    maedrs: PillarsItem[] = [];

    enchantment: Enchantment | undefined;

    submitted = false; // Keep track of this app's submission

    status: object = {};

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 600;
        options.height = "auto";
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "imbuement" }];
        options.closeOnSubmit = false;
        return options;
    }

    get template() 
    {
        return "systems/pillars-of-eternity/templates/apps/seasonal/enchantment.hbs";
    }

    get title() 
    {
        return getGame().i18n.localize("PILLARS.Enchantment");
    }

    static get label(): string 
    {
        return getGame().i18n.localize("PILLARS.Enchantment");
    }

    static create(data: SeasonalActivityData): Promise<SeasonalActivityResult> 
    {
        const enchantments = (data.actor.getFlag("pillars-of-eternity", "enchantments") as Record<string, Enchantment["data"]>) || {};

        const options = [`<option value="new">New Enchantment</option>`];
        Object.keys(enchantments).forEach((key) => 
        {
            options.push(`<option value=${key}>${enchantments[key]?.itemData.name} (${enchantments[key]?.progress.current}/${enchantments[key]?.progress.total})</option>`);
        });

        return new Promise<SeasonalActivityResult>((resolve) => 
        {
            new Dialog({
                title: "Choose Enchantment",
                content: `
        <select>
        ${options.join("")}
        </select>
        `,
                buttons: {
                    confirm: {
                        label: "Confirm",
                        callback: (dlg) => 
                        {
                            dlg = $(dlg);
                            const value = dlg.find("select")[0]?.value;
                            if (value) 
                            {
                                const app = new this(data, resolve);
                                if (value != "new") 
                                {
                                    let enchantment: Enchantment | undefined;

                                    switch (enchantments[value]?.type) 
                                    {
                                    case "imbuement":
                                        enchantment = Imbuement.fromData(enchantments[value]! as Imbuement["data"]);
                                        break;
                                    case "embellishment":
                                        enchantment = Embellishment.fromData(enchantments[value]! as Embellishment["data"]);
                                        break;
                                    case "refinement":
                                        enchantment = Imbuement.fromData(enchantments[value]! as Imbuement["data"]);
                                        break;
                                    }
                                    app.enchantment = enchantment;
                                }
                                app.render(true);
                            }
                        },
                    },
                },
            }).render(true);
        });
    }

    render(...args: Parameters<Application["render"]>) 
    {
        super.render(...args);
        if (this.enchantment)
        {this._tabs[0]?.activate(this.enchantment.data.type);}
        this.checkData();
    }

    async submit(): Promise<SeasonalActivityResult> 
    {
        const result = <SeasonalActivityResult>{};

        if (!this.enchantment) {throw new Error("No Enchantment");}


        this.checkData();


        // We don't want to close immediately because users want to see the new progress
        // Instead, change the submit button to a "close" button
        if (this.submitted) 
        {
            this.close();
            return result;
        }

        try 
        {
            switch (this.enchantment.progress.state) 
            {
            case ENCHANTMENT_STATE.NOT_STARTED:
                this.enchantment.start();
                break;
            case ENCHANTMENT_STATE.IN_PROGRESS:
                this.enchantment.advanceProgress();
                break;
            case ENCHANTMENT_STATE.FINISHED:
                if (this.resolve) 
                {
                    this.resolve({ text: this.enchantment.getStateMessage(), data: this.enchantment.getFinishedData() });
                    this.close();
                }
            }

            // Look at progress again after click
            switch (this.enchantment.progress.state) 
            {
            case ENCHANTMENT_STATE.NOT_STARTED: // Should not happen
                this.enchantment.start();
                break;
            case ENCHANTMENT_STATE.IN_PROGRESS:
                if (this.resolve) {this.resolve({ text: this.enchantment.getStateMessage(), data: this.enchantment.getSaveData() });}
                // ui.notifications!.notify("Book of Seasons Updated")
                break;
            case ENCHANTMENT_STATE.FINISHED:
                if (this.resolve) {this.resolve({ text: this.enchantment.getStateMessage(), data: this.enchantment.getFinishedData() });}
        // ui.notifications!.notify("Item Added and Book of Seasons Updated")
            }

            this.submitted = true;
            await this._render(true);
        }
        catch (e) 
        {
      ui.notifications!.error("Error Progressing Enchantment: " + e);
      throw new Error("Error Progressing Enchantment: " + e);
        }
        return result;
    }

    disable() 
    {
        this.element.find(".enchantment")[0]?.classList.add("disabled");
    }

    async getData() 
    {
        let submitButton = "PILLARS.EnchantmentStart";

        // Priority to Finish, then if this enchantment has already been submitted, change to Close, otherwise, based on progress state
        if (this.enchantment?.progress.state == ENCHANTMENT_STATE.FINISHED) {submitButton = "PILLARS.EnchantmentFinish";}
        else if (this.submitted) {submitButton = "Close";}
        else if (this.enchantment?.progress.state == ENCHANTMENT_STATE.IN_PROGRESS) {submitButton = "PILLARS.EnchantmentContinue";}
        else if (this.enchantment?.progress.state == ENCHANTMENT_STATE.NOT_STARTED) {submitButton = "PILLARS.EnchantmentStart";}

        if (this.enchantment instanceof Imbuement)
        {
            return {
                imbuement: this.enchantment,
                item: this.enchantment?.item || this.item,
                power: this.enchantment?.power || this.power,
                maedrs: this.enchantment?.maedrs || this.maedrs,
                submitButton,
            };
        }
        else if (this.enchantment instanceof Embellishment)
        {
            return {
                imbuement: this.enchantment,
                item: this.enchantment?.item || this.item,
                actor : this.enchantment?.actor || this.actor,
                skills : this.actor.getItemTypes(ItemType.skill).filter((i : PillarsItem) => i.system.category?.value == "artisan"),
                submitButton,
            };
        }
        else if (this.enchantment instanceof Refinement)
        {
            return {
                imbuement: this.enchantment,
                item: this.enchantment?.item || this.item,
                actor : this.enchantment?.actor || this.actor,
                submitButton,
            };
        }
    }

    async _onDragDrop(ev: DragEvent) 
    {
        const target = ev.currentTarget as HTMLElement;

        target.classList.remove("hover");
        const dragData = JSON.parse(ev.dataTransfer?.getData("text/plain") || "");

        if (target.dataset.type == "maedr") 
        {
            const maedr = await PillarsItem.fromDropData(dragData);
            if (maedr) {this.addMaedr(maedr);}
        } // Item/Actor or Power
        else 
        {
            if (dragData) 
            {
                let item: PillarsItem | PillarsActor | undefined;
                if (dragData.type == "Item") {item = await PillarsItem.fromDropData(dragData);}
                else {item = await PillarsActor.fromDropData(dragData);}

                this.setItem(target.dataset.type as "power" | "item", item, target.dataset.type);
            }
        }
    }

    setItem(type: "power" | "item", item: PillarsItem | PillarsActor | undefined, mode? : string) 
    {
        if (type == "item" && item?.documentName != "Actor" && !hasEmbeddedPowers(item)) 
        {
            throw ui.notifications?.error("Wrong Item Type");
        }
        if (type == "power" && item?.type != "power") 
        {
            throw ui.notifications?.error("Wrong Item Type");
        }

        if (type == "item") {this.item = item;}
        else if (type == "power") {this.power = item as PillarsItem;}

        if (this.item && this.power) 
        {
            this.enchantment = new Imbuement(this.item, this.power, this.actor, this.maedrs);
        }
        if (item && mode == "embellishment")
        {this.enchantment = new Embellishment(item, this.actor);}

        this.render(true);
        this.checkData();
    }

    // Add a maedr to this object if enchantment objct hasn't been created
    addMaedr(maedr: PillarsItem) 
    {
        if (maedr.system.category?.value == "maedr" && this.enchantment instanceof Imbuement) 
        {
            this.enchantment ? this.enchantment.addMaedr(maedr) : this.maedrs.push(maedr);
            this.render(true);
        }
    }

    activateListeners(html: JQuery<HTMLElement>): void 
    {
        super.activateListeners(html);

        const dragDrop = new DragDrop({
            dragSelector: ".item",
            dropSelector: ".dragarea",
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: this._onDragDrop.bind(this) },
        });

        dragDrop.bind(html[0]!);
    
        html.find(".dragarea").each((i, element) => 
        {
            element.addEventListener("dragenter", (ev: DragEvent) => 
            {
                (ev.currentTarget as HTMLElement).classList.add("hover");
            });
        });

        html.find(".dragarea").each((i, element) => 
        {
            element.addEventListener("dragleave", (ev: DragEvent) => 
            {
                (ev.currentTarget as HTMLElement).classList.remove("hover");
            });
        });

        html.find(".update-enchantment").on("change", (ev: JQuery.ChangeEvent) => 
        {
            const path = ev.currentTarget.dataset.path as string;
            let value = ev.target.value;
            if (Number.isNumeric(value)) {value = Number(value);}

            // This listeners handles more than checkboxes, so have to parse values
            if (ev.target.checked == true) {value = true;}
            else if (ev.target.checked == false) {value = false;}

            setProperty(this.enchantment?.data!, path, value);
            this.enchantment?.computeProgress();
            this.render(true);
        });
    }

    async checkData(): Promise<{ errors: string[]; message: string }> 
    {
        const state: { errors: string[]; message: string } = { errors: [], message: "" };
        const game = getGame();

        this.enchantment?.validate();

        state.message = game.i18n.format("PILLARS.EnchantmentErrors", { errors: `<ul>${"<li>" + state.errors.join("</li><li>") + "</li>"}</ul>` });

        return state;
    }
}
