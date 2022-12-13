export class ActorEnduranceModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            max: new foundry.data.fields.NumberField({ required: true, default: 8 }),
            value: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            bonus: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            penalty: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            winded: new foundry.data.fields.BooleanField({ required: false }),
            incap: new foundry.data.fields.BooleanField({ required: false }),
            threshold: new foundry.data.fields.SchemaField({
                winded: new foundry.data.fields.NumberField({ required: true, default: 5 })
            })
        }
    }
    
    compute({armor, shield}, tooltips)
    {
        tooltips?.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: this.threshold.winded, source: game.i18n.localize('PILLARS.TooltipBase') }));
        this.threshold.winded += this.bonus;
        this.threshold.winded += armor?.system.winded?.value || 0;
        this.threshold.winded += shield?.system.winded?.value || 0;
        this.winded = this.value > this.threshold.winded;
        this.incap = this.value >= this.max + this.bonus;

        tooltips?.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: armor?.system.winded?.value, source: game.i18n.localize('PILLARS.TooltipArmor') }));
        tooltips?.endurance.threshold.winded.push(game.i18n.format('PILLARS.Tooltip', { value: shield?.system.winded?.value, source: game.i18n.localize('PILLARS.TooltipShield') }));
    }
}