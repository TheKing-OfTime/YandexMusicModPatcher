import Modal from "../../ui/Modal.jsx";
import React, { useCallback, useContext, useEffect, useState } from "react";
import TextBox from "../../ui/TextBox.jsx";
import {
    useOnExplorerDialogResponse,
    useOnRequestYmPath,
    useSendOpenExplorerDialog,
    useSendSetCustomYmPath, useSendUpdateState
} from "../../Events.jsx";
import { StateContext } from '../../StateContext.jsx';
import InlinePathChooser from '../InlinePathChooser.jsx';


function CustomPathModal() {

    const State = useContext(StateContext);

    const [isModalOpen, setModalOpen] = useState(false);
    const [customPath, setCustomPath] = useState( '');
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendCustomPath = useCallback((path) => {
        useSendSetCustomYmPath({ path });
        useSendUpdateState({ key: 'customYMPath', value: path });
    }, [])

    const sendOpenExploreDialog = useCallback(() => {
        useSendOpenExplorerDialog();
    }, [])

    const handleRequestYmPath = useCallback(() => {
        if (!isModalOpenRef.current) {
            setModalOpen(true);
        }
        console.log(isModalOpenRef.current);
    }, [isModalOpen]);


    const handleExplorerDialogResponse = useCallback((event, args) => {
        if (isModalOpenRef.current && args.path) {
            setCustomPath(args.path);
        }
    }, [isModalOpen]);

    useEffect(() => {
        const offRequestYmPath = useOnRequestYmPath(handleRequestYmPath);
        const offExplorerDialogResponse = useOnExplorerDialogResponse(handleExplorerDialogResponse);
        return () => {
            offRequestYmPath();
            offExplorerDialogResponse();
        }
    }, []);

    useEffect(() => {
        isModalOpenRef.current = isModalOpen;
    }, [isModalOpen]);

    return (
    <Modal
    isOpen={isModalOpen}
    setIsOpen={setModalOpen}
    onSubmit={() => {
        sendCustomPath(customPath);
        setModalOpen(false);
    }}
    title="Укажите путь к папке с Яндекс Музыкой">
        <TextBox>
            Не удалось найти яндекс музыку автоматически. Укажите путь вручную.
        </TextBox>
        <InlinePathChooser path={customPath} onExploreClick={sendOpenExploreDialog} />
    </Modal>
    )
}

export default CustomPathModal;
