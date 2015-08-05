var webpack = require('webpack');

var config = {
  devtool: 'eval',
  entry: [
    'webpack/hot/dev-server',
    './client.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: 'http://' + '104.155.1.36' + ':' + 3000 + '/static/'
    // https://github.com/webpack/webpack-dev-server/issues/135
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    extensions: ['', '.js']
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
