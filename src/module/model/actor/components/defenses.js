import { PILLARS } from "../../../system/config";

export class DefenseModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            value: new foundry.data.fields.NumberField({ required: false, initial: 10 }),
            base: new foundry.data.fields.NumberField({ required: false, initial: 10 }),
            bonus: new foundry.data.fields.NumberField({ required: false, initial: 10 }),
            penalty: new foundry.data.fields.NumberField({ required: false, initial: 10 }),
            checked: new foundry.data.fields.BooleanField({ required: false, initial: 10 })
        }
    }
}

export class ActorDefensesModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            deflection: new foundry.data.fields.EmbeddedDataField(DefenseModel),
            fortitude: new foundry.data.fields.EmbeddedDataField(DefenseModel),
            reflex: new foundry.data.fields.EmbeddedDataField(DefenseModel),
            will: new foundry.data.fields.EmbeddedDataField(DefenseModel)
        }
    }

    compute(size)
    {
        this.deflection.value = (this.deflection.base || 10) - size * 2;
        this.reflex.value = (this.reflex.base || 15) - size * 2;
        this.fortitude.value = (this.fortitude.base || 15) + size * 2;
        this.will.value = this.will.base || 15;
        
        let checkedCount = 0;
        for (let defense of Object.keys(this)) 
          checkedCount += this[defense].checked ? 1 : 0;

        
        if (checkedCount > 0) {
          let bonus = 5 - checkedCount;
          for (let defense of Object.keys(this))
            if (this[defense].checked) {
              this[defense].value += bonus;
            }
        }
    }

    applyTierBonus(tier)
    {
      let bonus = PILLARS.tierBonus[tier]?.def || 0;
      for (let defense of Object.keys(this)) 
        this[defense].value += bonus
    }

    applyEquippedBonuses({shield, weapons})
    {
        let weaponDeflectionBonus = 0;
        for (let weapon of weapons) {
          let skill = weapon.Skill;
          if (skill) {
            let bonus = Math.floor((skill.rank || 0) / 5);
            if (bonus > weaponDeflectionBonus) weaponDeflectionBonus = bonus;
          }
        }
    
        if (weaponDeflectionBonus > 0) {
          this.deflection.value += weaponDeflectionBonus;
        }
        if (shield) {
          this.deflection.value += shield.system.deflection.value;
        }
    }
}