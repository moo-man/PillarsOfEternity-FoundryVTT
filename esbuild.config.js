const esbuild = require('esbuild')
const foundryPath = require("./foundry-path.js")
const esCopy = require("esbuild-plugin-copy")
//import { copy } from 'esbuild-plugin-copy';

let buildPath = foundryPath.systemPath

module.exports = {
    entryPoints: ['src/pillars.ts'],
    bundle: true,
    outfile: buildPath + "/pillars.js",
    watch : true,
    plugins: [esCopy.copy({
      resolveFrom : "cwd",
      assets : {
        from: ["./static/**/*"],
        to : [buildPath],
        keepStructure: true
      }
    }),
    esCopy.copy({
      resolveFrom : "cwd",
      assets : {
        from: ["./template.json", "./system.json"],
        to : [buildPath + "/pillars-of-eternity"] // No idea why I need to specify /pillars-of-eternity as buildPath includes that
      }
    })
  ]
  }