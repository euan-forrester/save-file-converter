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
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      // https://stackoverflow.com/a/68723223
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      // So can use 'process.env.<blah>' in browser code
      // https://stackoverflow.com/a/72016474 (also has good suggestions for various fallbacks if needed below)
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
        "module": false,
        "stream": require.resolve("stream-browserify"), // https://github.com/crypto-browserify/cipher-base/issues/11
        "buffer": require.resolve("buffer"), // https://stackoverflow.com/a/68723223
      }
    },
    module: {
      // WASM integration with webpack 5 based on: https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
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
