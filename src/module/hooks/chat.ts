import { PillarsChat } from "../system/chat";

export default function () 
{


    Hooks.on("renderChatMessage", PillarsChat._onRenderChatMessage);

    // Activate chat listeners defined in dice-wfrp4e.js
    Hooks.on<Hooks.RenderApplication>("renderChatLog", (log : Application, html : JQuery<HTMLElement>) => 
    {

        html.on("click", ".roll-damage", PillarsChat._onDamageButtonClick);
        html.on("click", ".roll-healing", PillarsChat._onHealingButtonClick);
        html.on("click", ".apply-effect", PillarsChat._onApplyEffectClick);
        html.on("mouseenter", ".highlight-token", PillarsChat._onHoverInTargetImage);
        html.on("mouseleave", ".highlight-token", PillarsChat._onHoverOutTargetImage);
        html.on("click", ".highlight-token", PillarsChat._onClickTargetImage);
        html.on("click", ".shield", PillarsChat._onShieldClick);
        html.on("click", ".add-summon", PillarsChat._onAddSummonClick);
    });


}
