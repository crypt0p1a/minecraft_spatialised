const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
require('dotenv').config({ path: '../server/.env' });


const lambda = (env) => {
  console.log("environment", {...env, ...process.env});
  const environmentVariables = { ...env, ...process.env };
  const variables = {};
  if (!!environmentVariables.PUBLIC_SERVER_PORT) {
    variables.websocket = environmentVariables.PUBLIC_SERVER_PORT;
  } else {
    variables.websocket = -1;
  }

  return {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
            test: /\.html$/,
            use: [
              {
                    loader: "html-loader",
                    options: { minimize : false }
                }
            ]
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, '../public'),
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: "./src/index.ejs",
          filename: "../public/index.html",
          templateParameters: {
            'title': 'Simple Minecraft conference'
          },
        }),
        new webpack.DefinePlugin(variables)
    ],
    devServer: {
      static: { 
        directory: path.resolve(__dirname, '../public'), 
        publicPath: '/'
      },
      proxy: {
        '/v1': `http://localhost:${variables.websocket}`,
      },
    }
  };
}

module.exports = lambda
