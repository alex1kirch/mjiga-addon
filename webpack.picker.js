const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');


const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	entry: {
		'issue-picker-dev': './src/frontend/pages/issue-picker-dev/main.tsx',
	},
	watchOptions: {
		aggregateTimeout: 4000,
		poll: 2000,
		ignored: ['node_modules', 'dist'],
	},
	output: {
		filename: 'js/[name].[hash].js',
		path: path.resolve(__dirname, 'dist/picker'),
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist/picker'),
		openPage: 'issue-picker-dev.html',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(
				__dirname,
				'./src/frontend/pages/issue-picker-dev/template.html',
			),
			filename: 'issue-picker-dev.html',
			inject: 'head',
			chunks: ['issue-picker-dev'],
		}),
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: 'defer',
		}),
	],
})
