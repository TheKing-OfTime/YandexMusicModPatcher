import React, { useEffect, useState, useCallback } from 'react';

function ActionsBar({ isSettingsOpen, setIsSettingsOpen }) {

    const [isPatched, setIsPatched] = useState(false);
    const [isPatching, setIsPatching] = useState(false);
    const [isDepatching, setIsDepatching] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    const onSettingsClick = useCallback(() => {
        setIsSettingsOpen(prev => !prev);
    }, [])
    const onDepatchClick = useCallback(() => {
        window.desktopEvents.send('DEPATCH');
        setIsDepatching(true);
    }, [])
    const onPatchClick = useCallback(() => {
        window.desktopEvents.send('PATCH');
        setIsPatching(true);
    }, [])

    useEffect(() => {
        window.desktopEvents.on('PATCH_PROGRESS', (event, args) => {
            if (args.progress === 1) {
                setIsPatching(false);
                setIsPatched(true);
            }
        })
        window.desktopEvents.on('IS_INSTALL_POSSIBLE_RESPONSE', (event, args) => {
            setCanInstall(args.isPossible);
        })
        window.desktopEvents.send('IS_INSTALL_POSSIBLE');
    }, [])

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
