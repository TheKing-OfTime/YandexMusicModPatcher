const path = require('path');

const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

rules.push({
    test: /\.css$/,
    use: [{loader: 'style-loader'}, {loader: 'css-loader'}],
});

rules.push(
    {
        test: /\.svg$/,
        include: path.resolve(__dirname, 'src/app/media/icons'),
        loader: 'svg-sprite-loader',
        options: {
            extract: true,
            outputPath: 'static/icons/',
            spriteFilename: 'sprite.svg',
        }
    }
)

module.exports = {
    // Put your normal webpack config below here
    mode: process.env.NODE_ENV || 'production',
    //target: "electron35.0-renderer",
    module: {
        rules,
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json', '.css', '.html'],
    },

    plugins: [
        new SpriteLoaderPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets', to: 'static/assets' },
            ],
        }),
    ]
};
