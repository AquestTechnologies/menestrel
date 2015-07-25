var webpack = require('webpack');

var main = '104.155.1.36';
var port = 3000;

var config = {
  devtool: 'eval',
  entry: [
    'webpack/hot/dev-server',
    './client.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: 'http://' + main + ':' + port + '/static/'
    // https://github.com/webpack/webpack-dev-server/issues/135
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/
      }
    ]
  }
};

module.exports = config;
