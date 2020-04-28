const Path = require('path');
const PnpWebpackPlugin = require(`pnp-webpack-plugin`);
const createWebpackConfig = require('../config/webpack.config');
const {
  mergePlugins,
} = require('@storybook/preset-create-react-app/dist/helpers/mergePlugins');
const {
  processCraConfig,
} = require('@storybook/preset-create-react-app/dist/helpers/processCraConfig');

// Extracted and adapted from @storybook/preset-create-react-app to work with our ejected CRA setup

module.exports = {
  webpackFinal: (storybookConfig, options) => {
    const filteredRules =
      storybookConfig.module &&
      storybookConfig.module.rules.filter(
        ({ test }) =>
          !(
            test instanceof RegExp &&
            ((test && test.test('.js')) || test.test('.ts'))
          )
      );

    const projectWebpackConfig = createWebpackConfig(storybookConfig.mode);
    const projectRules = processCraConfig(projectWebpackConfig, options);

    // CRA uses the `ModuleScopePlugin` to limit suppot to the `src` directory.
    // Here, we select the plugin and modify its configuration to include Storybook config directory.
    const plugins = projectWebpackConfig.resolve.plugins.map((plugin) => {
      if (plugin.appSrcs) {
        // Mutate the plugin directly as opposed to recreating it.
        // eslint-disable-next-line no-param-reassign
        plugin.appSrcs = [...plugin.appSrcs, Path.resolve(options.configDir)];
      }
      return plugin;
    });

    return {
      ...storybookConfig,
      module: {
        ...storybookConfig.module,
        rules: [...(filteredRules || []), ...projectRules],
      },
      plugins: mergePlugins(
        storybookConfig.plugins,
        projectWebpackConfig.plugins
      ),
      resolve: {
        ...storybookConfig.resolve,
        extensions: projectWebpackConfig.resolve.extensions,
        modules: [
          ...((storybookConfig.resolve && storybookConfig.resolve.modules) ||
            []),
          ...Path.join(__dirname, '..'),
        ],
        plugins: [...plugins, PnpWebpackPlugin],
      },
      resolveLoader: {
        modules: ['node_modules'],
        plugins: [PnpWebpackPlugin.moduleLoader(module)],
      },
    };
  },
};
