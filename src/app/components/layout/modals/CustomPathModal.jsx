import Modal from "../../ui/Modal.jsx";
import React, {useCallback, useEffect, useState} from "react";
import TextBox from "../../ui/TextBox.jsx";
import TextInput from "../../ui/TextInput.jsx";
import InlineButton from "../../ui/InlineButton.jsx";
import {
    useOnExplorerDialogResponse,
    useOnRequestYmPath,
    useSendOpenExplorerDialog,
    useSendSetCustomYmPath
} from "../../Events.jsx";

function CustomPathModal() {

    const [isModalOpen, setModalOpen] = useState(false);
    const [customPath, setCustomPath] = useState('');
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendCustomPath = useCallback((path) => {
        if (!path) return;
        useSendSetCustomYmPath({path});
    }, [])

    const sendOpenExploreDialog = useCallback(() => {
        useSendOpenExplorerDialog();
    }, [])

    const handleRequestYmPath = useCallback(() => {
        console.log('Received REQUEST_YM_PATH');
        if (!isModalOpenRef.current) {
            setModalOpen(true);
        }
        console.log(isModalOpenRef.current);
    }, [isModalOpen]);


    const handleExplorerDialogResponse = useCallback((event, args) => {
        console.log('Received EXPLORER_DIALOG_RESPONSE', args);
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
            onClose={() => setModalOpen(false)}
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
