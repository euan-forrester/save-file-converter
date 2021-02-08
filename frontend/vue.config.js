module.exports = {
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
      pluginVersion: '3.0.0',
      uploadConcurrency: 5,
    },
    s3DeployCleanup: {
      cleanupTag: {
        Key: 'DeployLifecycle',
        Value: 'DeleteMe',
      },
    },
  },
};
