import webpack          from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import config           from './webpack.config.js';

export default function() {
  let startTime;
  const host = '0.0.0.0';
  const port = 3000;
  
  const bundle = webpack(config);
  bundle.plugin('compile', () => {
    startTime = Date.now();
    console.log('Bundling...');
  });
  
  bundle.plugin('done', () => {
    console.log('Bundled in ' + (Date.now() - startTime) + 'ms!');
  });
  
  new webpackDevServer(bundle, {
    publicPath: config.output.publicPath,
    noInfo : true,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true,
    stats: {
      colors: true
    },
    devServer: {
      hot: true,
      inline: true
    }
  }).listen(port, host, err => {
    if (err) return console.log(err);
    console.log('WDS listening at ' + host + ':' + port);
  });
}
