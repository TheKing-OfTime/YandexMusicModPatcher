module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    mode: process.env.NODE_ENV || 'production',
    entry: './src/main/index.js',
    target: "electron35.0-main",
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.json'],
        fallback: {
            "@aws-sdk/client-s3": false
        }
    },
};
