// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const paths = require('../config/paths');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const config = {
	mode: 'production',
	entry: [paths.chromeExtensionIndexJs],
	output: {
		path: paths.chromeExtensionOutput,
		filename: 'panel.js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				oneOf: [
					{
						test: /\.(js|mjs|jsx|ts|tsx)$/,
						include: paths.appSrc,
						loader: require.resolve('babel-loader'),
						options: {
							customize: require.resolve(
								'babel-preset-react-app/webpack-overrides'
							),

							plugins: [
								[
									require.resolve('babel-plugin-named-asset-import'),
									{
										loaderMap: {
											svg: {
												ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
											},
										},
									},
								],
							],
							// This is a feature of `babel-loader` for webpack (not Babel itself).
							// It enables caching results in ./node_modules/.cache/babel-loader/
							// directory for faster rebuilds.
							cacheDirectory: true,
							cacheCompression: false,
							compact: false,
						},
					},
				]
			}
		]
	},
	plugins: [
	]
};

const compiler = webpack(config);
compiler.run((err, stats) => {
	let messages;
	if (err) {
		if (!err.message) {
			throw err;
		}
		messages = formatWebpackMessages({
			errors: [err.message],
			warnings: [],
		});
	} else {
		messages = formatWebpackMessages(
			stats.toJson({all: false, warnings: true, errors: true})
		);
	}
	if (messages.errors.length) {
		// Only keep the first error. Others are often indicative
		// of the same problem, but confuse the reader with noise.
		if (messages.errors.length > 1) {
			messages.errors.length = 1;
		}
		throw new Error(messages.errors.join('\n\n'));
	}
});

