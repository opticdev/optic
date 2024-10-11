const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
  webpack: {
    alias: {
      fs: false,
      path: false,
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
        // Replace node prefix
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
        // HtmlWebpackPlugin to generate HTML output
        new HtmlWebpackPlugin({
          inject: 'body', // Inject scripts at the end of the body
          template: './public/index.html',
          filename: 'index.html', // Ensure a single output HTML file
        }),
        // Inline JavaScript into the HTML
        new HtmlInlineScriptPlugin(),
      ],
    },
    configure: (webpackConfig) => {
      // Remove any existing HtmlWebpackPlugin instances to prevent conflicts
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) =>
          !(
            plugin.constructor &&
            plugin.constructor.name === 'HtmlWebpackPlugin'
          )
      );

      // Add HtmlWebpackPlugin after removing any existing instances
      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
          inject: 'body',
          template: './public/index.html',
          filename: 'index.html',
        }),
        new HtmlInlineScriptPlugin()
      );

      return webpackConfig;
    },
  },
};
