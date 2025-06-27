const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    background: "./src/background.ts",
    content: "./src/content.tsx",
    sidepanel: "./src/sidepanel.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      crypto: false,
      buffer: false,
    },
    alias: {
      "@react-native-async-storage/async-storage": false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/sidepanel.html",
      filename: "sidepanel.html",
      chunks: ["sidepanel"],
    }),
  ],
  externals: {
    "@react-native-async-storage/async-storage": "undefined",
  },
};
