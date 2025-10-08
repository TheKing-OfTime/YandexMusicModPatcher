import electronStore from 'electron-store';


const schema = {
    patchType: {
        type: 'string',
        default: 'default',
        enum: ['default', 'devtoolsOnly'],
        description: 'Patch type'
    },
    lastPatchInfo: {
        type: 'object',
        properties: {
            ymVersion: {
                type: 'string',
                pattern: '^\\d+\\.\\d+\\.\\d+(-[\\w\\.]+)?$',
                description: 'Version of the last patch'
            },
            modVersion: {
                type: 'string',
                pattern: '^\\d+\\.\\d+\\.\\d+(-[\\w\\.]+)?$',
                description: 'Version of the last patch'
            },
            patchType: {
                type: 'string',
                default: 'default',
                enum: ['default', 'devtoolsOnly'],
                description: 'Patch type'
            },
            date: {
                type: 'string',
                description: 'Date of the last patch'
            }
        },
        default: {
            ymVersion: '1.0.0',
            modVersion: '1.0.0',
            patchType: 'default',
            date: ''
        },
        description: 'Last patch info'
    },
    customYMPath: {
        type: 'string',
        default: '',
        description: 'Custom Yandex Music path'
    },
    useZIP: {
        type: 'boolean',
        default: true,
        description: 'Use compressed asar'
    },
    keepCache: {
        type: 'boolean',
        default: true,
        description: 'Keep downloads as cache after patch done'
    },
    autoUpdate: {
        type: 'boolean',
        default: true,
        description: 'Auto update the patcher'
    },
    controlYMUpdates: {
        type: 'boolean',
        default: true,
        description: 'Auto update Yandex Music and the mod'
    },
    ignoreLegacyYM: {
        type: 'boolean',
        default: false,
        description: 'Ignore legacy Yandex Music app'
    },
};

class Store {
    constructor() {
        this.store = new electronStore({
            name: 'settings',
            encryptionKey: 'yandex-music-mod-client',
            schema,
        });
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        if (this.store.has(key)) this.store.set(key, value);
    }

    getAll() {
        return this.store.store;
    }
}

export const getStore = (() => {
    let store;
    return () => {
        if (!store) {
            store = new Store();
        }
        return store;
    }
})();
