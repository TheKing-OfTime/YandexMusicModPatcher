const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const path = require('path');
const fs = require('fs');

function cleanup(buildPath, electronVersion, platform, arch, callback) {
    const appPath = path.join(buildPath, '..');
    const locales = path.join(appPath, 'locales');
    try {
        if (fs.existsSync(locales)) {
            fs.readdirSync(locales)
            .filter(f => !['en-US.pak', 'ru.pak'].includes(f))
            .forEach(f => fs.unlinkSync(path.join(locales, f)));
        }
    } catch (e) {
        console.error('cleanup error', e);
    }
    callback();
}

module.exports = {
    packagerConfig: {
        asar: true,
        icon: './assets/icons/icon.ico',
        executableName: 'yandexmusicmodpatcher',
        extendInfo: 'Info.plist',
        afterCopy: [cleanup],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupIcon: './assets/icons/icon.ico',
                icon: './assets/icons/icon.ico',
                productName: "Yandex Music Mod Patcher",
                options: {
                    setupIcon: './assets/icons/icon.ico',
                    icon: './assets/icons/icon.ico'
                },
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                format: 'ULFO'
            }
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: './assets/icons/png/512x512.png',
                }
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    icon: './assets/icons/png/512x512.png',
                }
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                //devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/app/index.html',
                            js: './src/app/index.js',
                            name: 'main_window',
                            preload: {
                                js: './src/main/preload.js',
                            },
                        },
                    ],
                },
            },
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
