import SkillCheck from "./skill-check.js"

export default class PowerCheck extends SkillCheck
{
        constructor(data) {
            super(data)
            if (!data)
                return 
            this.data.checkData.sourceId = data.sourceId
            this.data.checkData.itemId = data.itemId

        }   


        async rollCheck() {
            
            let terms = this.getTerms()
            this.roll = Roll.fromTerms(terms)
            if (this.requiresRoll)
                await this.roll.evaluate({async:true})  
                
                
            // If embedded item, use up charges instead of power source
            let embeddedParent = this.power.EmbeddedPowerParent;
            if (embeddedParent && embeddedParent.category.value != "grimoire")
            {
                let spendType = this.power.embedded.spendType;
                if (spendType == "encounter" || spendType == "longRest")
                    this.power.update({"data.embedded.uses.value" : this.power.embedded.uses.value - 1});
                else if (spendType == "charges") 
                    embeddedParent.update({"data.powerCharges.value" : embeddedParent.powerCharges.value - this.power.embedded.chargeCost})
            }
            else // Not embedded item or is grimoire item
                this.powerSource.update({"data.used.value" : true, "data.pool.current" : this.powerSource.pool.current - this.power.level.cost})

            this.data.result = this.roll.toJSON()

            this.handleEquippedWeaponRange()

        }


        async handleEquippedWeaponRange() {
            let range = this.power.range.find(r => r.value == "equippedWeapon");

            if (!range)
                return

            let rangeGroup = range.group;

            let {damage, effects} = (this.power.groups[rangeGroup] || this.power.groups["Default"])

            effects = this._toEffectObjects(effects);

            let weaponId = await this.weaponSelectDialog()
            this.result.chosenWeapon = weaponId
            this.updateMessageFlags();
            this.actor.setupWeaponCheck(weaponId, {add : {damage, effects}}).then(async check => {
                await check.rollCheck()
                check.sendToChat();
            })
        }

        // Show the dialog to select which equipped weapon to apply this power to
        async weaponSelectDialog() {
            let weapons = this.actor.getItemTypes("weapon").filter(w => w.equipped.value);
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
                            callback : (dlg) => {resolve(dlg.find("select")[0].value)}
                        }
                    }
                }).render(true)
            })
        }

        get item()
        {
            return this.actor.items.get(this.checkData.itemId)
        }

        get power() {
            return this.item
        }

        get tags () {
            return [game.pillars.config.powerSources[this.item.source.value]]
        }

        get requiresRoll() {
            return this.power.roll.value
        }

        get powerSource() {
            return this.actor.items.get(this.checkData.sourceId)
        }
}