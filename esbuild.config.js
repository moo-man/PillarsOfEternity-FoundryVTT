const copyStaticFiles = require("esbuild-copy-static-files")
const esbuild = require('esbuild')
const foundryPath = require("./foundry-path.js")


let buildPath = foundryPath.systemPath

esbuild.build({
    entryPoints: ['src/pillars.ts'],
    bundle: true,
    outfile: buildPath + "/pillars.js",
    watch : true,
    plugins: [copyStaticFiles({
      src : "./static",
      dest: buildPath + "/",
      recursive : true
    })]
  }).catch(() => process.exit(1))