import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StateContext } from "../StateContext.jsx";
import { useOnIsInstallPossibleResponse, useOnPatchProgress, useSendDepatch, useSendIsInstallPossible, useSendPatch } from "../Events.jsx";
import TabSelector from '../ui/TabSelector.jsx';
import InlineButton from '../ui/InlineButton.jsx';

import '../../styles/ActionsBar.css';


function ActionsBar({ currentPage, setCurrentPage }) {

    const State = useContext(StateContext);

    const [isPatched, setIsPatched] = useState(false);
    const [isPatching, setIsPatching] = useState(false);
    const [isDepatching, setIsDepatching] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    const onDepatchClick = useCallback(() => {
        useSendDepatch();
        setIsDepatching(true);
    }, [])
    const onPatchClick = useCallback(() => {
        useSendPatch();
        setIsPatching(true);
    }, [])

    const onTabSelectorToggled = useCallback((tab) => {
        setCurrentPage(tab.name);
    }, [setCurrentPage])

    useEffect(() => {
        const OffPatchProgress = useOnPatchProgress((event, args) => {
            if (args.progress === 1) {
                setIsPatching(false);
                setIsPatched(true);
            } else if (args.progress === 0) {
                setIsDepatching(false);
                setIsPatched(false);
            } else if (args.progress === -1) {
                setTimeout(()=> {
                    useSendIsInstallPossible();
                }, 3000)
            }
        })
        const OffIsInstallPossible = useOnIsInstallPossibleResponse((event, args) => {
            setCanInstall(args.isPossible);
            setIsPatching(false);
            setIsDepatching(false);
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
            <TabSelector
                tabs={
                [
                    { name: 'main', disabled: true, label: 'Home', tooltipLabel: 'Home' },
                    { name: 'settings', icon: 'settings', tooltipLabel: 'Settings' },
                    { name: 'logs', icon: 'logs', tooltipLabel: 'Logs' }
                ]}
                defaultActiveTabName={ 'logs' }
                onTabSelect={ onTabSelectorToggled }
            />
            {/* TODO: Вернуть кнопку удаления модификации в каком то ином виде
             <button className="ActionsBar_DepatchButton"
             onClick={onDepatchClick}
             disabled={isDepatching || isPatching || !isPatched || !canInstall}>
             {isDepatching ? "Depatching" : (!isPatched ? "Depatched" : "Depatch")}
             </button> */ }
            <InlineButton
                className="ActionsBar_PatchButton"
                onClick={ onPatchClick }
                disabled={ isDepatching || isPatching || isPatched || !canInstall }
                label={ (isPatching ? "Patching" : (isPatched ? "Patched" : "Patch")) }
            />
        </div>
    )
}

export default ActionsBar;
