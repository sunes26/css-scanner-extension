const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      // Background service worker
      background: './background/background.ts',
      // Popup script
      popup: './popup/popup.ts',
      // Content script - bundle all modules together
      content: './content/content-bundle.ts'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name]/[name].js',
      clean: true
    },

    devtool: isProduction ? false : 'cheap-module-source-map',

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            },
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction
            }
          },
          extractComments: false
        })
      ]
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          // Manifest
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform(content) {
              // Update manifest to use bundled scripts
              const manifest = JSON.parse(content.toString());
              manifest.background.service_worker = 'background/background.js';
              return JSON.stringify(manifest, null, 2);
            }
          },
          // Icons
          {
            from: 'icons',
            to: 'icons'
          },
          // Popup HTML and CSS
          {
            from: 'popup/popup.html',
            to: 'popup/popup.html'
          },
          {
            from: 'popup/popup.css',
            to: 'popup/popup.css'
          },
          // Content CSS
          {
            from: 'content/content.css',
            to: 'content/content.css'
          }
        ]
      })
    ],

    resolve: {
      extensions: ['.ts', '.js']
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'ts-loader'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: '88'
                    }
                  }
                ]
              ]
            }
          }
        }
      ]
    },

    performance: {
      hints: false
    },

    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  };
};
