export default function () {
    Hooks.on("getChatLogEntryContext", addChatMessageContextOptions)
}


 function addChatMessageContextOptions (html, options) {
    let canApply = li => {
      const message = game.messages.get(li.data("messageId"));
      return message?.isRoll && message?.isContentVisible && canvas.tokens?.controlled.length;
    };
    options.push(
      {
        name: game.i18n.localize("Reduce Health"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, "health", -1)
      },
      {
        name: game.i18n.localize("Reduce Endurance"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, "endurance", -1)
      },
      {
        name: game.i18n.localize("Increase Health"),
        icon: '<i class="fas fa-user-plus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, "health", 1)
      },
      {
        name: game.i18n.localize("Increase Endurance"),
        icon: '<i class="fas fa-user-plus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, "endurance", 1)
      }
    );
    return options;
  };
  
  /* -------------------------------------------- */
  
  /**
   * Apply rolled dice damage to the token or tokens which are currently controlled.
   * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
   *
   * @param {HTMLElement} li      The chat entry which contains the roll data
   * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
   * @return {Promise}
   */
  function applyChatCardDamage(li, type, multiplier) {
    const message = game.messages.get(li.data("messageId"));
    const roll = message.roll;
    return Promise.all(canvas.tokens.controlled.map(t => {
      const a = t.actor;
      return a.applyDamage(roll.total, type, multiplier);
    }));
  }