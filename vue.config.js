const webpack = require('webpack');
module.exports = {
    devServer: {
        https: true
    },
    chainWebpack: config => {
        config.plugin('ignore')
            .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));//忽略/moment/locale下的所有文件
    }
}
