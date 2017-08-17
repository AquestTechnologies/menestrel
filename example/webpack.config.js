const path = require('path')

module.exports = {
  entry: './index.js',
  output: {
    filename: 'example-bundle.js',
    path: path.resolve(__dirname, '..'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        include: [
          __dirname,
          path.resolve(__dirname, '../lib'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            // https://github.com/babel/babel-preset-env/issues/186
            presets: ['babel-preset-env', 'babel-preset-react'].map(require.resolve),
          },
        },
      },
    ],
  },
}
