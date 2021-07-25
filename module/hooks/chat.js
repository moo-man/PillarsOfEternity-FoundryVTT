export default function () {


    Hooks.on("renderChatMessage", async (app, html, msg) => {
        // Do not display "Blind" chat cards to non-gm
        if (html.hasClass("blind") && !game.user.isGM) {
            html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
            html.html("").css("display", "none");
        }


        let postedItem = html.find(".post-item")[0]
        if (postedItem)
        {
            postedItem.setAttribute("draggable", true)
            postedItem.addEventListener("dragstart", ev => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({type: "item", payload : app.getFlag("pillars-of-eternity", "transfer")}))
            })
        }

    
    })

    // Activate chat listeners defined in dice-wfrp4e.js
    Hooks.on('renderChatLog', (log, html, data) => {


    });

}
