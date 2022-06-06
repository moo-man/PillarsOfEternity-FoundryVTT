import { PowerCheckData, PowerCheckDataFlattened } from "../../types/checks.js"
import { ItemType } from "../../types/common.js"
import { PillarsItem } from "../item/item-pillars.js"
import { PILLARS } from "./config.js"
import SkillCheck from "./skill-check.js"

export default class PowerCheck extends SkillCheck
{
    data? : PowerCheckData

    
        constructor(data : PowerCheckDataFlattened) {
            super(data)
            if (!data)
                return 
            this.data!.checkData.sourceId = data.sourceId
            this.data!.checkData.itemId = data.itemId

        }   


        async rollCheck() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            if (this.requiresRoll)
                await this.roll.evaluate({async:true})  
                
            // If embedded item, use up charges instead of power source
            let embeddedParent = this.power.EmbeddedPowerParent;
            if (embeddedParent && embeddedParent.category?.value != "grimoire")
            {
                let spendType = this.power.embedded?.spendType;
                if (spendType == "encounter" || spendType == "longRest")
                    this.power.update({"data.embedded.uses.value" : this.power.embedded?.uses.value! - 1});
                else if (spendType == "charges") 
                    embeddedParent.update({"data.powerCharges.value" : embeddedParent.powerCharges?.value! - this.power.embedded?.chargeCost!})
            }
            else // Not embedded item or is grimoire item
            {
                let update : Record<string, unknown> = {"data.used.value" : true}

                if (this.power.source?.value == "spirits" && this.power.category?.value == "phrase") // If spirits and phrase, add 1 to pool
                {
                    update["data.pool.current"] = Math.min(this.powerSource.pool?.current! + 1, this.powerSource.pool?.max!)
                }
                else // if normal power just subtract cost as normal
                {
                    update["data.pool.current"] = this.powerSource.pool?.current! - this.power.level?.cost!
                }

                this.powerSource.update(update)
            }

            this.data!.result = <PowerCheckData["result"]>this.roll.toJSON()

            this.handleEquippedWeaponRange()
        }

        async handleEquippedWeaponRange() {
            let range = this.power.range?.find(r => r.value == "equippedWeapon");

            if (!range)
                return

            let rangeGroup = range.group;

            if (this.power.data.type == "power")
            {
                let {damage, effects} = (this.power.data.groups[rangeGroup] || this.power.data.groups["Default"])!
                
                let allEffects = this._toEffectObjects(effects);
                
                let weaponId = await this.weaponSelectDialog() as string
                this.result!.chosenWeapon = weaponId
                this.updateMessageFlags();
                this.actor.setupWeaponCheck(weaponId, {add : {damage, allEffects}}).then(async check => {
                    await check.rollCheck()
                    check.sendToChat();
                })
            }
        }

        // Show the dialog to select which equipped weapon to apply this power to
        async weaponSelectDialog() {
            let weapons = this.actor.getItemTypes(ItemType.weapon).filter(w => w.equipped?.value);
            let html = `<select>`
            weapons.forEach(w => {
                html += `<option value=${w.id}>${w.name}</option>`
            })
            html += `</select>`
            return new Promise(resolve => {
                new Dialog({
                    title : "Select a Weapon",
                    content : html,
                    buttons : {
                        apply : {
                            label : "Apply",
                            callback : (dlg) => {resolve($(dlg).find("select")[0]?.value)}
                        }
                    }
                }).render(true)
            })
        }

        get checkData()  { return this.data?.checkData }
        get result() { return this.data?.result}

        get item()
        {

            let item =  this.actor.items.get(this.checkData?.itemId || "")
            if (item)
                return item
            else throw new Error("Cannot find item in Check object")
        }

        get power() {
            return this.item
        }

        get tags () {
            return [PILLARS.powerSources[this.item?.source?.value as keyof typeof PILLARS.powerSources]]
        }

        get requiresRoll() {
            return !!this.power?.roll?.value
        }

        get powerSource() : PillarsItem {
            let item =  this.actor.items.get(this.checkData?.sourceId || "")
            if (item)
                return item
            else throw new Error("Cannot find item in Check object")
        }
}