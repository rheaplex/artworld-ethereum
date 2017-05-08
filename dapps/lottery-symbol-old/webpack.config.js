const path = require('path');

const webpack = require("webpack");

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './app/js/app.jsx',
  output: {
    path: path.join(__dirname, "./build"),
    filename: 'js/app.js'
  },
  module: {
    loaders: [
      { test: /\.(js|jsx|es6)$/, exclude: /node_modules/,
        loaders: ["react-hot-loader", "babel-loader", "eslint-loader"] },
      { test: /\.sol/, loader: 'truffle-solidity-loader' },

      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css-loader!sass-loader')
      }
    ]
  },
  resolve: {
    extensions: [".es6", ".js", ".jsx"]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
      //      { from: './app/images', to: "images" },
      //      { from: './app/fonts', to: "fonts" }
    ]),
    new ExtractTextPlugin({ filename: 'css/app.css', allChunks: true })
  ],
  devServer: {
    stats: 'errors-only',
  }
};
