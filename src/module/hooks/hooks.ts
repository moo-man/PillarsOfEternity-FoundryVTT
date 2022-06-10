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
}