export default function() {



  /**
   * @override Draw token bars in reverse
   */
  Token.prototype._drawBar = function(number, bar, data) {
    const val = Number(data.value);
    const pct = 1 - Math.clamped(val, 0, data.max) / data.max;

    // Determine sizing
    let h = Math.max((canvas.dimensions.size / 12), 8);
    const w = this.w;
    const bs = Math.clamped(h / 8, 1, 2);
    if ( this.data.height >= 2 ) h *= 1.6;  // Enlarge the bar for large tokens

    // Determine the color to use
    const blk = 0x000000;
    let color;
    if ( number === 0 ) color = PIXI.utils.rgb2hex([(1-(pct/2)), pct, 0]);
    else color = PIXI.utils.rgb2hex([(0.5 * pct), (0.7 * pct), 0.5 + (pct / 2)]);

    // Draw the bar
    bar.clear()
    bar.beginFill(blk, 0.5).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, this.w, h, 3)
    bar.beginFill(color, 1.0).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, pct*w, h, 2)

    // Set position
    let posY = number === 0 ? this.h - h : 0;
    bar.position.set(0, posY);
  }



  TokenLayer.prototype.storeHistory = function(type, data) {
    if (type == "delete")
    {
      data = data.map(token => {
        let obj = {}
        obj.token = token
        if (game.combat)
        {
          obj.combatant = game.combat.combatants.find(i => i.data.tokenId == token._id)?.toObject()
        }
        return obj
      })
    }
    
    if ( this.history.length >= 10 ) this.history.shift();
    this.history.push({type, data});

  }

  TokenLayer.prototype.undoHistory = function()
  {
    if ( !this.history.length ) return Promise.reject("No more tracked history to undo!");
    let event = this.history.pop();
    const type = this.constructor.documentName;

    // Undo creation with deletion
    if ( event.type === "create" ) {
      const ids = event.data.map(d => d._id);
      return canvas.scene.deleteEmbeddedDocuments(type, ids, {isUndo: true});
    }

    // Undo updates with update
    else if ( event.type === "update" ) {
      return canvas.scene.updateEmbeddedDocuments(type, event.data, {isUndo: true});
    }

    // Undo deletion with creation OVERRIDE - adds the combatant back to the tracker
    else if ( event.type === "delete" ) {
      let promise = canvas.scene.createEmbeddedDocuments(type, event.data.map(i => i.token), {isUndo: true, keepId: true});

      if (game.combat)
        game.combat.createEmbeddedDocuments("Combatant", event.data.map(i => i.combatant).filter(i => i), {isUndo: true, keepId: true});
        
      return promise
    }
  }


}