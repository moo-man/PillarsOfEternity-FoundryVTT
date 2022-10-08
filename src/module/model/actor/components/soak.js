export class SoakModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            base: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            shield: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            physical: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            burn: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            freeze: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            corrode: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            shock: new foundry.data.fields.NumberField({ required: true, default: 0 })
        }
    }

    applyEquippedBonuses({armor, shield})
    {
        if (armor) {
            this.base += armor?.system.soak.value || 0;
        }
        if (shield) {
            this.shield = this.base + (shield?.system.soak.value || 0);
        }
    }
}