// webpack.config.js
var path = require('path')
module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, './bin/'),
        filename: 'flyRender.min.js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css' },
            {test: /\.js?$/, loader: 'babel-loader'},
            {test: /\.(png|jpg|jpeg)$/, loader: 'url-loader?limit=10240'}
        ]
    }
};