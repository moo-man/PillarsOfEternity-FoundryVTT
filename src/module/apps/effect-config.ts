
import { getGame } from "../system/utility";
import EffectScriptConfig from "./effect-script";


export default class PillarsEffectConfig extends ActiveEffectConfig<ActiveEffectConfig.Options, ActiveEffectConfig.Data & {showEquip : boolean, modes : Record<number, string>}> 
{
    async getData()
    {
        const game = getGame();
        const data = await super.getData();
        data.modes[6] = game.i18n.localize("PILLARS.RollDialogEffect");
        data.modes[7] = game.i18n.localize("PILLARS.TargetersRollDialogEffect");
        return data;
    }   

    activateListeners(html : JQuery<HTMLElement>) 
    {
        super.activateListeners(html);

        html.find(".changes-list .effect-controls").each((i, element) => 
        {
            if (this.object?.changes[i]!.mode > 5)
            {
                element.append($(`<a class="effect-script-config"><i class="fas fa-cog"></i></a>`)[0]!);
            }
        });
        
        if(this.object.item?.canEquip || false)
        {
            html.find(".tab[data-tab='details']").append($(`
            <div class="form-group">
                <label>Item Equip</label>
                <div class="form-fields">
                    <input type="checkbox" name="flags.pillars-of-eternity.itemEquip" checked=${this.object.getFlag("pillars-of-eternity", "itemEquip")}/>
                </div>
            </div>
            `)[0]!);
        }
            
        html.find(".effect-script-config").on("click", (ev : JQuery.ClickEvent) => 
        {
            const index = parseInt($(ev.currentTarget).parents(".effect-change").attr("data-index")!);
            if (Number.isNumeric(index))
            {new EffectScriptConfig({effect : this.object, index}).render(true);}
        });

        html.find(".mode select").on("change", ev => 
        {
            this.submit({preventClose: true});
        });
    }
}