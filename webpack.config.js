var path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');

var entries = {};

entries.app = ["./src/index.tsx"];

module.exports = {
    entry: entries,
    module: {
        rules: [
            {
                test: /\.raw.cpp$/i,
                use: 'raw-loader',
            },
            {
                test: /.bdf$/,
                use: 'raw-loader',
                exclude: /node_modules/,
                include: /src/
            },
            {
                test: /.tsx?$/,
                loaders: ['ts-loader'],
                exclude: /node_modules/,
                include: /src/
            },
            {
                test: /\.css$/,
                include: MONACO_DIR,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].bundle.min.js"
    },
    devtool: "eval",
    devServer: {
        contentBase: "dist/",
        port: 8081,
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:8080/api/',
        //         secure: false
        //     }
        // }
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            tslint: true,
            checkSyntacticErrors: true
        }),
        new CopyWebpackPlugin([
            // {
            //     from: 'some/path/here',
            //     to: 'here' // inside dist/
            // }
        ]),
        new MonacoWebpackPlugin({
            // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            languages: ['cpp']
        })
    ]
};