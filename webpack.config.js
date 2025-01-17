const path = require('path');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
module.exports = {
  entry: slsw.lib.entries,target: 'node',
  externals: [nodeExternals()],
  mode: 'development',
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};

