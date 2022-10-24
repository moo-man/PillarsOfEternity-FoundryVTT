import actorHooks from "./actor"
import chatHooks from "./chat"
import itemHooks from "./item";
import handlebars from "./handlebars"
import diceSoNiceHooks from "./dsn"
import readyHooks from "./ready"
import effects from "./effects";
import entryContextHooks from "./entryContext";
import scene from "./scene";
import initHooks from "./init"
import settings from "./settings";
import { PILLARS_UTILITY } from "../system/utility";

export default function () {
    initHooks()
    actorHooks();
    itemHooks();
    chatHooks();
    handlebars();
    diceSoNiceHooks();
    readyHooks();
    effects();
    entryContextHooks();
    scene();
    settings();


    
    // #if _ENV === "development"
    Hooks.on("renderApplication", (app : Application, html : HTMLElement, data : unknown) => {
        PILLARS_UTILITY.log(`Rendering ${app.constructor.name}: `, undefined, data)
    })
    //#endif

}


