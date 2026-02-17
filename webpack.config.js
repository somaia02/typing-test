const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({ title: 'Development', template: "./src/index.html" }),
    new CopyPlugin({
      patterns: [
        { 
          from: "*.(svg|png)",
          to: "assets/images/[name][ext]",
          context: "src/assets/images/"
        }
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /(?<!\.custom).css$/,
        use: [ MiniCssExtractPlugin.loader, "css-loader" ]
      },
      { 
        test: /\.custom.css$/,
        use: [ { loader: "css-loader" } ],
      }
    ],
  },
};