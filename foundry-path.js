const path = require('path');
const fs = require('fs-extra');

function foundryConfig() {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
  let config;

  if (fs.existsSync(configPath)) {
      config = fs.readJSONSync(configPath);
  }

  let foundryPath
  if (config.foundryDataPath)
    foundryPath = path.join(config.foundryDataPath, config.systemName)
  else
    foundryPath = path.resolve(__dirname, 'build')

  console.log("Foundry Path: " + foundryPath)
  return foundryPath
}

exports.systemPath = foundryConfig()