export class ActorHealthModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            max: new foundry.data.fields.NumberField({ required: true, default: 9 }),
            value: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            modifier: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            bloodied: new foundry.data.fields.BooleanField({ required: false }),
            incap: new foundry.data.fields.BooleanField({ required: false }),
            dead: new foundry.data.fields.BooleanField({ required: false }),
            death: new foundry.data.fields.SchemaField({
                modifier: new foundry.data.fields.NumberField({ required: true, default: 0 }),
            }),
            threshold: new foundry.data.fields.SchemaField({
                bloodied: new foundry.data.fields.NumberField({ required: true, default: 3 }),
                incap: new foundry.data.fields.NumberField({ required: true, default: 6 }),
            }),
            wounds: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({ required: true, default: 0 })
            })
        }
    }

    compute()
    {
        this.threshold.bloodied += this.modifier;
        this.threshold.incap += this.modifier;
        this.bloodied = this.value > this.threshold.bloodied;
        this.incap = this.value > this.threshold.incap;
        this.dead = this.value >= this.max + this.death.modifier;

        // health.value = number of pips, can't be less than wounds
        this.value = Math.max(this.value, this.wounds.value);
    }
}