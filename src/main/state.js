import { getStore } from "./store.js";
import { sendStateUpdated } from "./events.js";


class State {
    constructor() {
        this.store = getStore();
        this.state = {
            ...this.store.getAll(),
            onReadyEventsQueue: [],
        };
        console.log('State initialized with:', this.state);
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

        this.store.set(key, value);

        sendStateUpdated(undefined, this.state)
    }
}


export const getState = (() => {
    let state;
    return () => {
        if (!state) {
            state = new State();
        }
        return state;
    }
})();
