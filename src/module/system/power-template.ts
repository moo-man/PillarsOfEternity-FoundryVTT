import { getGame } from "../system/utility";
import { PowerGroups, PowerTarget } from "../../types/powers";
import { PillarsItem } from "../document/item-pillars";
import { PILLARS } from "./config";

export default class PowerTemplate extends MeasuredTemplate 
{

    item? : PillarsItem; 
    actorSheet? : FormApplication;

    // V10 shim
    updateSource : any;
    distance : any;
    x : any;
    y: any;
    direction: any;

    static fromItem(item: PillarsItem, groupId: keyof PowerGroups, index = 0) 
    {
        const game = getGame();
        if (item.data.type == "power") 
        {
            const target = item.data.groups?.[groupId]?.target;
            let type;
            let subtype;
            if (!target) 
            {
                const target = item.system.target?.find((i : PowerTarget) => !i.group);
                type = target?.value;
                subtype = target?.subtype;
            }
            else 
            {
                type = target[index]?.value;
                subtype = target[index]?.subtype;
            }
            const templateShape = PILLARS.areaTargetTypes[type as keyof typeof PILLARS.areaTargetTypes];
            const distanceType  = PILLARS.areaTargetDistances[type as keyof typeof PILLARS.areaTargetDistances];
            const templateData : 
      {
        distance : number, 
        t: "circle" | "cone" | "ray" | "rect" | null | undefined, 
        direction : number, 
        user : string, 
        x : number, 
        y : number, 
        fillColor: string, 
        angle : number
      } = mergeObject(distanceType[subtype as keyof typeof distanceType], { t: templateShape });

            if (!templateShape) {return null;}

            // Prepare template data
            templateData.direction = 0;
            (templateData.user = game.user!.id), (templateData.x = 0), (templateData.y = 0), (templateData.fillColor = game.user!.color!);

            // Additional type-specific data
            if (templateData.t == "cone") {templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;}

            // Return the template constructed from the item data
            const cls = CONFIG.MeasuredTemplate.documentClass;
            const template = new cls(templateData, { parent: canvas!.scene! });
            const object = new this(template);
            object.item = item;
            object.actorSheet = item.actor?.sheet!;
            return object;
        }
    }

    /* -------------------------------------------- */

    /**
   * Creates a preview of the spell template
   */
    drawPreview() 
    {

        const initialLayer = canvas!.activeLayer;

        // Draw the template and switch to the template layer
        this.draw();
        this.layer.activate();
    this.layer.preview!.addChild(this);

    // Hide the sheet that originated the preview
    if (this.actorSheet) {this.actorSheet.minimize();}

    // Activate interactivity
    this.activatePreviewListeners(initialLayer);
    }

    containedTokenIds() 
    {
        const grid = canvas!.grid!;
        const d = canvas!.dimensions!;
        const ids = [];

        // Get number of rows and columns
        const [maxr, maxc] = grid!.grid!.getGridPositionFromPixels(d.width, d.height);
        let nr = Math.ceil((this.distance * 1.5) / d.distance / (d.size / grid.h));
        let nc = Math.ceil((this.distance * 1.5) / d.distance / (d.size / grid.w));
        nr = Math.min(nr, maxr);
        nc = Math.min(nc, maxc);

        // Get the offset of the template origin relative to the top-left grid space
        const [tx, ty] = canvas!.grid!.getTopLeft(this.x, this.y);
        const [row0, col0] = grid!.grid!.getGridPositionFromPixels(tx, ty);
        const hx = Math.ceil(canvas!.grid!.w / 2);
        const hy = Math.ceil(canvas!.grid!.h / 2);
        const isCenter = this.x - tx === hx && this.y - ty === hy;

        // Identify grid coordinates covered by the template Graphics
        // for (let r = -nr; r < nr; r++) {
        //   for (let c = -nc; c < nc; c++) {

        for (const token of canvas!.tokens!.placeables) 
        {
            //let [gx, gy] = canvas!.grid!.grid.getPixelsFromGridPosition(row0 + r, col0 + c);
            const testX = token.center.x - this.x;
            const testY = token.center.y - this.y;
            const contains = this.shape?.contains(testX, testY);
            if (!contains) {continue;}
            ids.push(token.document.id || "");
        }
        //   }
        // }
        return ids;
    }
    /* -------------------------------------------- */

    /**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
   */
    activatePreviewListeners(initialLayer : CanvasLayer<CanvasLayerOptions> | null) 
    {
        const handlers : Record<string, (event :any) => void> = {};
        let moveTime = 0;

        // Update placement (mouse-move)
        handlers.mm = (event : JQuery.MouseMoveEvent) => 
        {
            event.stopPropagation();
            const now = Date.now(); // Apply a 20ms throttle
            if (now - moveTime <= 20) {return;}
            const center = event.data.getLocalPosition(this.layer);
            const snapped = canvas!.grid!.getSnappedPosition(center.x, center.y, 2);
            this.updateSource({ x: snapped.x, y: snapped.y });
            (<PIXI.Circle | PIXI.Ellipse | PIXI.Rectangle | PIXI.RoundedRectangle>this.shape).x = snapped.x;
            (<PIXI.Circle | PIXI.Ellipse | PIXI.Rectangle | PIXI.RoundedRectangle>this.shape).y = snapped.y;
            this.refresh();
            moveTime = now;
            let targets = [];
            targets = this.containedTokenIds();
      getGame().user!.updateTokenTargets(targets);
        };

        // Cancel the workflow (right-click)
        handlers.rc = (event: JQuery.ClickEvent) => 
        {
            //@ts-ignore
            this.layer._onDragLeftCancel(event);
      canvas!.stage!.off("mousemove", handlers.mm);
      canvas!.stage!.off("mousedown", handlers.lc);
      canvas!.app!.view.oncontextmenu = null;
      canvas!.app!.view.onwheel = null;
      initialLayer?.activate();
      this.actorSheet!.maximize();
        };

        // Confirm the workflow (left-click)
        handlers.lc = (event : JQuery.ClickEvent) => 
        {
      handlers.rc!(event);
      const destination = canvas!.grid!.getSnappedPosition(this.x, this.y, 2);
      this.updateSource(destination);
      // @ts-ignore
      canvas!.scene!.createEmbeddedDocuments("MeasuredTemplate", [this.toObject()]);
        };

        // Rotate the template by 3 degree increments (mouse-wheel)
        handlers.mw = (event: WheelEvent) => 
        {
            if (event.ctrlKey) {event.preventDefault();} // Avoid zooming the browser window
            event.stopPropagation();
            const delta = canvas!.grid!.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
            const snap = event.shiftKey ? delta : 5;
            this.updateSource({ direction: this.direction + snap * Math.sign(event.deltaY) });
            this.refresh();
        };

    // Activate listeners
    canvas!.stage!.on("mousemove", handlers.mm);
    canvas!.stage!.on("mousedown", handlers.lc);
    canvas!.app!.view.oncontextmenu = handlers.rc as (this: GlobalEventHandlers, ev: MouseEvent) => any;
    canvas!.app!.view.onwheel = handlers.mw as (this: GlobalEventHandlers, ev: MouseEvent) => any;
    }
}
