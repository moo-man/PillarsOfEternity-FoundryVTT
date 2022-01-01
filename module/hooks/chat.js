import { PillarsChat } from "../system/chat.js";

export default function () {


    Hooks.on("renderChatMessage", PillarsChat._onRenderChatMessage)

    // Activate chat listeners defined in dice-wfrp4e.js
    Hooks.on('renderChatLog', (log, html, data) => {

        html.on("click", ".roll-damage", PillarsChat._onDamageButtonClick)

        html.on("click", ".apply-effect", PillarsChat._onApplyEffectClick)

        html.on("mouseenter", ".target-img", PillarsChat._onHoverInTargetImage)
        html.on("mouseleave", ".target-img", PillarsChat._onHoverOutTargetImage)
        html.on("click", ".target-img", PillarsChat._onClickTargetImage)

    });


}
