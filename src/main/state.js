import { initStore } from "./store.js";

// const defaultState = {
//
// };

class State {
    constructor() {
        this.store = initStore();
        this.state = {
            //...defaultState,
            store: this.store,
        };
    }

    get(key) {
        const keys = key.split('.');
        return keys.reduce((acc, k) => acc?.[k], this.state);
    }

    set(key, value) {
        const keys = key.split('.');
        let obj = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            if (typeof obj[keys[i]] !== 'object' || obj[keys[i]] === null) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;

        if (keys[0] === 'store') {
            this.store.set(keys.slice(1).join('.'), value);
        }
    }
}


export const initState = (() => {
    let state;
    return () => {
        if (!state) {
            state = new State();
        }
        return state;
    }
});
