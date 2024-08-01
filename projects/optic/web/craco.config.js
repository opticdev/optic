const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      fs: false,
      path: false,
      // Alias fallbacks for node files with `node:` prefix removed
      // In the future, we should split out our dependencies into node + browser
      'fs/promises': false,
      zlib: false,
      os: false,
      url: false,
      assert: false,
      'graceful-fs': false,
      child_process: false,
      '@stoplight/spectral-ruleset-bundler/with-loader': false,
    },
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
        '@stoplight/spectral-ruleset-bundler/with-loader': false,
      },
    },
    plugins: {
      add: [
        // https://github.com/webpack/webpack/issues/13290#issuecomment-1188760779
        // in combination with the fallbacks above
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      ],
    },
  },
};
