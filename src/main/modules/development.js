import { protocol } from 'electron';
import isDev from 'electron-is-dev';

export const isDevelopment = isDev;

export function registerSchemes() {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'http',
            privileges: {
                standard: true,
                bypassCSP: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: false,
                stream: true,
            },
        },
        {
            scheme: 'wss',
            privileges: {
                standard: true,
                bypassCSP: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: false,
                stream: true,
            },
        },
        {
            scheme: 'ws',
            privileges: {
                standard: true,
                bypassCSP: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: false,
                stream: true,
            },
        },
        {
            scheme: 'file',
            privileges: {
                standard: true,
                bypassCSP: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: false,
                stream: true,
            },
        },
        {
            scheme: 'https',
            privileges: {
                standard: true,
                bypassCSP: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: false,
                stream: true,
            },
        },
    ])
}
