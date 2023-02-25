import { PillarsItemSheet } from "./item-sheet";

export class PillarsPowerSheet extends PillarsItemSheet
{

    /** @override */
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["power"]);
        return options;
    }

    // TODO move power specific stuff here

}

