module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main/index.js',
    target: "electron35.0-main",
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
};
