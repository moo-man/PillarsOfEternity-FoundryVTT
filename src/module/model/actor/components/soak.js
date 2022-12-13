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

    applyEquippedBonuses({armor, shield}, tooltips)
    {
        if (armor) {
            this.base += armor?.system.soak.value || 0;
            tooltips.soak.base.push(game.i18n.format('PILLARS.Tooltip', { value: armor.system.soak.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
    }
        if (shield) {
            this.shield = this.base + (shield?.system.soak.value || 0);
            if (tooltips)
            {
                tooltips.soak.shield = tooltips.soak.shield.concat(tooltips.soak.base);
                tooltips?.soak.shield.push(game.i18n.format('PILLARS.Tooltip', { value: shield.system.soak.value, source: game.i18n.localize('PILLARS.TooltipShield') }));
            }
        }

        tooltips?.soak.physical.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
        tooltips?.soak.burn.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
        tooltips?.soak.freeze.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
        tooltips?.soak.raw.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
        tooltips?.soak.corrode.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
        tooltips?.soak.shock.push(game.i18n.format('PILLARS.Tooltip', { value: this.base, source: game.i18n.localize('PILLARS.TooltipBase') }));
    }
}