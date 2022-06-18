const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: './src/index.ts',
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
      })
  ],
};
