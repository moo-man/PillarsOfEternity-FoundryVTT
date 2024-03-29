import { PowerCheckData, PowerCheckDataFlattened } from "../../../types/checks";
import { ItemType } from "../../../types/common";
import { PowerRange } from "../../../types/powers";
import { PillarsItem } from "../../document/item-pillars";
import { PILLARS } from "../config";
import { getGame } from "../utility";
import SkillCheck from "./skill-check";
import WeaponCheck from "./weapon-check";

export default class PowerCheck extends SkillCheck
{
    data? : PowerCheckData;

    
    constructor(data? : PowerCheckDataFlattened) 
    {
        super(data);
        if (!data)
        {return;} 
            this.data!.checkData.sourceId = data.sourceId;
            this.data!.checkData.itemId = data.itemId;

    }   


    async rollCheck() 
    {
            
        const terms = this.getTerms();
        this.roll = Roll.fromTerms(terms);
        if (this.requiresRoll)
        {
            await this.roll.evaluate({async:true});
        }
        else 
        {
            this.roll = await new Roll("0").evaluate({async: true});
        } 
                
        // If embedded item, use up charges instead of power source
        const embeddedParent = this.power.EmbeddedPowerParent;
        if (embeddedParent && embeddedParent.system.category?.value != "grimoire")
        {
            const spendType = this.power.system.embedded?.spendType;
            if (spendType == "encounter" || spendType == "longRest")
            {this.power.update({"system.embedded.uses.value" : this.power.system.embedded?.uses.value - 1});}
            else if (spendType == "charges") 
            {embeddedParent.update({"system.powerCharges.value" : embeddedParent.system.powerCharges?.value - this.power.system.embedded?.chargeCost});}
        }
        else // Not embedded item or is grimoire item
        {
            const update : Record<string, unknown> = {"system.used.value" : true};

            if (this.power.system.source?.value == "spirits" && this.power.system.category?.value == "phrase") // If spirits and phrase, add 1 to pool
            {
                update["system.pool.current"] = Math.min(this.powerSource.system.pool?.current + 1, this.powerSource.system.pool?.max);
            }
            else // if normal power just subtract cost as normal
            {
                update["system.pool.current"] = this.powerSource.system.pool?.current - this.power.system.level?.cost;
            }

            this.powerSource.update(update);
        }

            this.data!.result = <PowerCheckData["result"]>this.roll.toJSON();

            this.handleEquippedWeaponRange();
    }

    async handleEquippedWeaponRange() 
    {
        const range = this.power.system.range?.find((r: PowerRange)=> r.value == "equippedWeapon");

        if (!range)
        {return;}

        const rangeGroup = range.group;

        if (this.power.type == "power")
        {
            const {damage, effects} = (this.power.system.groups?.[rangeGroup] || this.power.system.groups?.[getGame().i18n.localize("Default")])!;
                
            const allEffects = this._toEffectObjects(effects);
                
            const weaponId = await this.weaponSelectDialog() as string;
                this.result!.chosenWeapon = weaponId;
                this.updateMessageFlags();
                this.actor.setupWeaponCheck(weaponId, {add : {damage, effects: allEffects}}).then(async (check : WeaponCheck) => 
                {
                    await check.rollCheck();
                    check.sendToChat();
                });
        }
    }

    // Show the dialog to select which equipped weapon to apply this power to
    async weaponSelectDialog() 
    {
        const game = getGame();
        const weapons = this.actor.getItemTypes(ItemType.weapon).filter((w: PillarsItem) => w.system.equipped?.value);
        let html = `<select>`;
        weapons.forEach((w : PillarsItem) => 
        {
            html += `<option value=${w.id}>${w.name}</option>`;
        });
        html += `</select>`;
        return new Promise(resolve => 
        {
            new Dialog({
                title : game.i18n.localize("PILLARS.PromptSelectWeapon"),
                content : html,
                buttons : {
                    apply : {
                        label : game.i18n.localize("PILLARs.Apply"),
                        callback : (dlg) => {resolve($(dlg).find("select")[0]?.value);}
                    }
                }
            }).render(true);
        });
    }

    get checkData()  { return this.data?.checkData; }
    get result() { return this.data?.result;}

    get item()
    {

        const item =  this.actor.items.get(this.checkData?.itemId || "");
        if (item)
        {return item;}
        else {throw new Error(getGame().i18n.localize("PILLARS.ErrorCannotFindCheckItem"));}
    }

    get power() 
    {
        return this.item;
    }

    get tags () 
    {
        return [PILLARS.powerSources[this.item?.system.source?.value as keyof typeof PILLARS.powerSources]];
    }

    get requiresRoll() 
    {
        return !!this.power?.system.roll?.value;
    }

    get powerSource() : PillarsItem 
    {
        const item =  this.actor.items.get(this.checkData?.sourceId || "");
        if (item)
        {return item;}
        else {throw new Error(getGame().i18n.localize("PILLARS.ErrorCannotFindCheckItem"));}
    }
}