const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');

rules.push({
    test: /\.css$/,
    use: [{loader: 'style-loader'}, {loader: 'css-loader'}],
});

module.exports = {
    // Put your normal webpack config below here
    module: {
        rules,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets', to: 'static/assets' },
            ],
        }),
    ]
};
