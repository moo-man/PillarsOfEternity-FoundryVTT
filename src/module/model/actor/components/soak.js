export class SoakModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            base: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            shield: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            physical: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            burn: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            freeze: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            corrode: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            shock: new foundry.data.fields.NumberField({ required: true, default: 0 })
        };
    }

    applyEquippedBonuses({armor, shield})
    {
        if (armor) 
        {
            this.base += armor?.system.soak.value || 0;
            this.tooltips?.soak.base.push(game.i18n.format("PILLARS.Tooltip", { value: armor.system.soak.value, source: game.i18n.localize("PILLARS.TooltipArmor") }));
        }
        if (shield) 
        {
            this.shield = this.base + (shield?.system.soak.value || 0);
            if (this.tooltips)
            {
                this.tooltips.soak.shield = this.tooltips.soak.shield.concat(this.tooltips.soak.base);
                this.tooltips.soak.shield.push(game.i18n.format("PILLARS.Tooltip", { value: shield.system.soak.value, source: game.i18n.localize("PILLARS.TooltipShield") }));
            }
        }

        this.tooltips?.soak.physical.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
        this.tooltips?.soak.burn.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
        this.tooltips?.soak.freeze.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
        this.tooltips?.soak.raw.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
        this.tooltips?.soak.corrode.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
        this.tooltips?.soak.shock.push(game.i18n.format("PILLARS.Tooltip", { value: this.base, source: game.i18n.localize("PILLARS.TooltipBase") }));
    }
}