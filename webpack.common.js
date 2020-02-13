const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const pkg = require('./package');

const env = process.env.NODE_ENV || 'development';
const envConfig = require('./config')[env];

module.exports = {
  devtool: env !== 'production' ? 'inline-source-map' : '',
  output: {
    filename: 'js/[name].[hash].js',
    path: path.resolve(__dirname, 'dist/public'),
    publicPath: envConfig.cdnUrl,
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: env !== 'development',
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[local]',
              },
              localsConvention: 'dashesOnly',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      LOCAL_BASE_URL: JSON.stringify(envConfig.localBaseUrl),
      MIRO_BASE_URL: JSON.stringify(envConfig.miro.baseUrl),
      MIRO_APP_CLIENT_ID: JSON.stringify(envConfig.miro.clientId),
      VERSION: JSON.stringify(`${pkg.name}@${pkg.version}`),
      ANALYTICS_URL: JSON.stringify(envConfig.stat ? envConfig.stat.url : ''),
      ANALYTICS_KEY: JSON.stringify(envConfig.stat ? envConfig.stat.frontendKey : ''),
    }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[hash].css' }),
    new CopyPlugin([
      {
        from: './src/frontend/assets',
        to: 'assets',
      },
    ]),
  ],
};
