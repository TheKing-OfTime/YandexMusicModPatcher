import Modal from "./Modal.jsx";
import React, { useEffect, useState, useCallback } from "react";
import TextBox from "./TextBox.jsx";
import TextInput from "./TextInput.jsx";
import InlineButton from "./InlineButton.jsx";
import { useSendDeleteLegacyYmApp, useOnRequestLegacyYmAppDeletion } from "./Events.jsx";

function WindowsLegacyAppModal() {

    const [isModalOpen, setModalOpen] = useState(false);
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendDeleteLegacyYmApp = useCallback(() => {
        useSendDeleteLegacyYmApp();
    }, [])

    const handleRequestLegacyYmAppDeletion = useCallback(() => {
        console.log('Received REQUEST_LEGACY_YM_APP_DELETION');
        if (!isModalOpenRef.current) {
            setModalOpen(true);
        }
        console.log(isModalOpenRef.current);
    }, [isModalOpen]);

    useEffect(() => {
        const offRequestLegacyYmAppDeletion = useOnRequestLegacyYmAppDeletion(handleRequestLegacyYmAppDeletion);
        return () => {
            offRequestLegacyYmAppDeletion();
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
                sendDeleteLegacyYmApp();
                setModalOpen(false);
            }}
            title="Устаревшая версия Яндекс Музыки"
            onSubmitLabel="Удалить"
            onCancelLabel="Отмена"
        >
            <TextBox>
                У вас установлена устаревшая версия Яндекс Музыки из MS Store.<br/>Она может помешать установке и использованию новой версии.<br/><br/><b>Удалить устаревшую версию?</b>
            </TextBox>
        </Modal>
    )
}

export default WindowsLegacyAppModal;
