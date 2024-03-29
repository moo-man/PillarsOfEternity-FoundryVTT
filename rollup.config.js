const fs = require("fs");
const foundryPath = require("./foundry-path.js");
import copy from "rollup-plugin-copy-watch";
import jscc from "rollup-plugin-jscc";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";


let manifest = JSON.parse(fs.readFileSync("./system.json"));

let systemPath = foundryPath.systemPath(manifest.name);
console.log("Bundling to " + systemPath);

export default {
    input: ["src/pillars.ts", "styles/pillars.scss"],
    output: {
        dir : systemPath,
        format: "cjs",
        exports : "auto"
    },
    plugins: [
        typescript(),
        jscc({
            values: { _ENV: process.env.NODE_ENV }
        }),
        copy({
            targets: [
                { src: "./template.json", dest: systemPath },
                { src: "./system.json", dest: systemPath },
                { src: "./static/*", dest: systemPath },
            ],
            watch: ["./static/**/*", "system.json", "template.json"]
        }),
        postcss({
            extract : "pillars.css",
            plugins: []
        })
    ]
};