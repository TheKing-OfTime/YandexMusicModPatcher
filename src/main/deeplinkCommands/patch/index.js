import Events from '../../types/Events.js';
import PatchTypes from '../../types/PatchTypes.js';
import { ipcMain } from 'electron';
import { getState } from '../../state.js';

const State = getState();

export default function run(...args) {
    const patchType = PatchTypes[args?.[0]] ?? PatchTypes.DEFAULT;
    State.onReadyEventsQueue.push(()=> {
        ipcMain.emit(Events.PATCH, {
            patchType: patchType,
            fromAsarSrc: args?.[1] ? decodeURI(args?.[1]) : undefined
        })
    });
}
