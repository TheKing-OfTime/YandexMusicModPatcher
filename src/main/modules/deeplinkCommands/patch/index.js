import Events from '../../../types/Events.js';
import PatchTypes from '../../../types/PatchTypes.js';
import { ipcMain } from 'electron';
import { getState } from '../../state.js';

const State = getState();

export default function run(...args) {
    const params = args?.[0];
    const window = args?.[1];
    const patchType = Object.values(PatchTypes).includes(params?.[0]) ? params?.[0] : PatchTypes.DEFAULT;
    if (!window) {
        State.state.onReadyEventsQueue.push(() => {
            ipcMain.emit(Events.PATCH, undefined, {
                patchType: patchType,
                fromAsarSrc: args?.[0]?.[1] ? decodeURI(args?.[0]?.[1]) : undefined
            })
        });
    } else {
        ipcMain.emit(Events.PATCH, undefined, {
            patchType: patchType,
            fromAsarSrc: args?.[0]?.[1] ? decodeURI(args?.[0]?.[1]) : undefined
        })
    }
}
