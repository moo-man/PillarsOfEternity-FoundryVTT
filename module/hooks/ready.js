export default function () {

    Hooks.on("ready", () => {
        CONFIG.ChatMessage.documentClass.prototype.getTest = function() {
            let rollData = this.getFlag("pillars-of-eternity", "rollData")
            return game.pillars.rollClass.SkillTest.recreate(rollData)
        }
    })
}