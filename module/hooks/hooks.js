import actorHooks from "./actor.js"
import chatHooks from "./chat.js"
import itemHooks from "./item.js";
import handlebars from "./handlebars.js"
import diceSoNiceHooks from "./dsn.js"
import readyHooks from "./ready.js"
import effects from "./effects.js";
import entryContextHooks from "./entryContext.js";
import scene from "./scene.js";

export default function () {
    actorHooks();
    itemHooks();
    chatHooks();
    handlebars();
    diceSoNiceHooks();
    readyHooks();
    effects();
    entryContextHooks();
    scene();
}