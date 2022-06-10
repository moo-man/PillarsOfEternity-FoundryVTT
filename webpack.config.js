const path = require('path');
const fs = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin')

function getFoundryConfig() {
    const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
    let config;

    if (fs.existsSync(configPath)) {
        config = fs.readJSONSync(configPath);
    }
    return config;
}


let foundryConfig = getFoundryConfig();
let buildPath
if (foundryConfig.foundryDataPath)
    buildPath = path.join(foundryConfig.foundryDataPath, foundryConfig.systemName)
else
    buildPath = path.resolve(__dirname, 'build')

    console.log(buildPath)


module.exports = {
    entry: './src/pillars.ts',
    module : {
        rules : [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    optimization : {
        minimize: false
    },
    resolve : {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: 'pillars.js',
        path : buildPath
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'static' },
                { from: './template.json' },
                { from: './system.json' }
            ]
        })
    ],
};

