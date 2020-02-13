const path = require('path');
const envConfig = require('./config')[process.env.NODE_ENV || 'development'];
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  entry: {
    settings: './src/frontend/pages/settings/main.tsx',
    'miro-plugin': './src/frontend/pages/miro-plugin/main.ts',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
        }
      }
    },
  },
  externals: [
    {
      '@miro/client-sdk': 'miro',
      'node-fetch': 'fetch',
    },
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        './src/frontend/pages/settings/template.html',
      ),
      filename: 'settings.html',
      inject: 'head',
      chunks: ['react', 'settings'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        './src/frontend/pages/miro-plugin/template.html',
      ),
      filename: 'miro-plugin.html',
      inject: 'head',
      chunks: ['miro-plugin'],
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [{
        path: `${envConfig.miro.baseUrl}/app/static/sdk.1.1.js`,
      }],
      append: false,
      publicPath: false,
      files: ['miro-plugin.html', 'issue-picker.html', 'settings.html'],
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),
  ],
});
