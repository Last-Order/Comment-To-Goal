module.exports = {
    devServer: {
        host: 'localhost',
        disableHostCheck: true
    },
    transpileDependencies: [
        'vue-echarts',
        'resize-detector'
    ],
    pluginOptions: {
        electronBuilder: {
            chainWebpackMainProcess: config => {
                // Chain webpack config for electron main process only
                config.mode('development');
                // config.externals(['uws']);
            },
            externals: ['socket.io'],
            builderOptions: {
                appId: 'moe.sound.sora.ctg',
                // asar: false,
                artifactName: "ctg-${os}-${version}.${ext}",
                productName: 'Comment To Goal',
                win: {
                    target: ['portable', 'msi'],
                    icon: 'build/icons/icon.ico',
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true
                },
                mac: {
                    category: 'public.app-category.developer-tools',
                    target: ['dmg']
                },
                linux: {
                    target: ['deb', 'appImage']
                }
            }
        }
    }
}