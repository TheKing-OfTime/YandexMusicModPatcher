import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StateContext } from "../StateContext.jsx";
import {
    useOnIsInstallPossibleResponse,
    useOnPatchProgress,
    useSendDepatch,
    useSendIsInstallPossible,
    useSendPatch
} from "../Events.jsx";


function ActionsBar({ isSettingsOpen, setIsSettingsOpen }) {

    const State = useContext(StateContext);

    const [isPatched, setIsPatched] = useState(false);
    const [isPatching, setIsPatching] = useState(false);
    const [isDepatching, setIsDepatching] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    const onSettingsClick = useCallback(() => {
        setIsSettingsOpen(prev => !prev);
    }, [])
    const onDepatchClick = useCallback(() => {
        useSendDepatch();
        setIsDepatching(true);
    }, [])
    const onPatchClick = useCallback(() => {
        useSendPatch();
        setIsPatching(true);
    }, [])

    useEffect(() => {
        const OffPatchProgress = useOnPatchProgress((event, args) => {
            if (args.progress === 1) {
                setIsPatching(false);
                setIsPatched(true);
            } else if (args.progress === 0) {
                setIsDepatching(false);
                setIsPatched(false);
            }
        })
        const OffIsInstallPossible = useOnIsInstallPossibleResponse((event, args) => {
            setCanInstall(args.isPossible);
        })
        useSendIsInstallPossible();

        return () => {
            OffPatchProgress();
            OffIsInstallPossible();
        }
    }, [])

    useEffect(() => {
        State?.lastPatchInfo?.patchType !== State?.patchType && setIsPatched(false);
    }, [State]);

    return (
    <div className="ActionsBar_root">
        <button className="ActionsBar_SettingsButton"
                onClick={onSettingsClick}
                disabled={isDepatching || isPatching}>
            <span>{isSettingsOpen ? 'Back' : 'Settings'}</span>
        </button>
        <button className="ActionsBar_DepatchButton"
                onClick={onDepatchClick}
                disabled={isDepatching || isPatching || !isPatched || !canInstall}>
            <span>{isDepatching ? "Depatching" : (!isPatched ? "Depatched" : "Depatch")}</span>
        </button>
        <button className="ActionsBar_PatchButton"
                onClick={onPatchClick}
                disabled={isDepatching || isPatching || isPatched || !canInstall}>
            <span>{isPatching ? "Patching" : (isPatched ? "Patched" : "Patch")}</span>
        </button>
    </div>
    )
}

export default ActionsBar;
