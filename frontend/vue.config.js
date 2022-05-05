const webpack = require('webpack')
const path = require('path');
const contentBase = path.resolve(__dirname);

const testsDir = './tests';

module.exports = {
  productionSourceMap: process.env.VUE_APP_ENABLE_SOURCE_MAPS === 'true',
  pluginOptions: {
    s3Deploy: {
      registry: undefined,
      awsProfile: 'default',
      overrideEndpoint: false,
      region: 'us-west-2',
      bucket: 'save-file-converter-dev',
      createBucket: false,
      staticHosting: false,
      assetPath: 'dist',
      assetMatch: '**',
      deployPath: '/',
      acl: 'public-read',
      pwa: false,
      enableCloudfront: false,
      pluginVersion: '4.0.0-rc3',
      uploadConcurrency: 5,
    },
    s3DeployCleanup: {
      cleanupTag: {
        Key: 'DeployLifecycle',
        Value: 'DeleteMe',
      },
    },
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  configureWebpack: {
    plugins: [
      // So can use 'process.env.<blah>'' in browser code
      // https://stackoverflow.com/a/72016474
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    resolve: {
      alias: {
        "#": path.join(__dirname, testsDir)
      },
      fallback: {
        "fs": false,
        "stream": false, // or require.resolve("stream-browserify"), and yarn install stream-browserify
      }
    },
    // Copied from https://github.com/emscripten-core/emscripten/issues/10114#issuecomment-569561505
    devServer: {
      setupMiddlewares(middlewares, devServer) {
        // use proper mime-type for wasm files
        devServer.app.get('*.wasm', function (req, res, next) {
          var options = {
            root: contentBase,
            dotfiles: 'deny',
            headers: {
              'Content-Type': 'application/wasm'
            }
          };
          res.sendFile(req.url, options, function (err) {
            if (err) {
              next(err);
            }
          });
        });
        return middlewares;
      }
    },
    module: {
      rules: [
        { 
          test: /\.wasm$/,
          type: 'javascript/auto',
          loader: 'file-loader',
          options: {
            name: '[name]-[contenthash].[ext]',         
          }        
        }
      ]
    }
  }
};
