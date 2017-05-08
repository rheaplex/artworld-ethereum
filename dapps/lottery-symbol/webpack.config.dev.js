var path = require('path');
var webpack = require('webpack');
var combineLoaders = require('webpack-combine-loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval',
  entry: './src/index',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  // So we can resolve the entry, components etc. without the .jsx extension
  resolve: {
    extensions: [".es6", ".js", ".jsx"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.template.ejs',
      inject: 'body',
    })
  ],
  module: {
    loaders: [
      {
        // Note regex extended to handle .jsx and .es
        test: /(\.jsx?|es6)$/,
        loaders: ['react-hot-loader', 'babel-loader', 'eslint-loader'],
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: combineLoaders([
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          {
            loader: 'sass-loader'
          }
        ])
      },
      // Ethereum contracts
      {
        test: /\.sol/,
        use: [
          { loader: 'json-loader' },
          { loader: 'truffle-solidity-loader',
            options: {
              migrations_directory: path.resolve(__dirname, './migrations'),
              network: 'development'
            }}
        ]
      },
      // Loaders needed by Bootstrap
      {
        test: /\.css$/,
        loader: combineLoaders([
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ])
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  devServer: {
    stats: 'errors-only',
  }
};
