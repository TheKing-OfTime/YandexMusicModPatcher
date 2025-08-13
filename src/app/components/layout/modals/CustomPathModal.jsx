import Modal from "../../ui/Modal.jsx";
import React, { useCallback, useContext, useEffect, useState } from "react";
import TextBox from "../../ui/TextBox.jsx";
import TextInput from "../../ui/TextInput.jsx";
import InlineButton from "../../ui/InlineButton.jsx";
import {
    useOnExplorerDialogResponse,
    useOnRequestYmPath,
    useSendOpenExplorerDialog,
    useSendSetCustomYmPath
} from "../../Events.jsx";
import { StateContext } from '../../StateContext.jsx';


function CustomPathModal() {

    const State = useContext(StateContext);

    const [isModalOpen, setModalOpen] = useState(false);
    const [customPath, setCustomPath] = useState(State.customYMPath || '');
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendCustomPath = useCallback((path) => {
        if (!path) return;
        useSendSetCustomYmPath({ path });
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
        <div style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <TextInput value={customPath} disabled={true}/>
            <InlineButton onClick={sendOpenExploreDialog}>Обзор</InlineButton>
        </div>
    </Modal>
    )
}

export default CustomPathModal;
