import Modal from "../../ui/Modal.jsx";
import React, { useCallback, useEffect, useState } from "react";
import TextBox from "../../ui/TextBox.jsx";
import { useOnRequestLegacyYmAppDeletion, useSendDeleteLegacyYmApp } from "../../Events.jsx";


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
    setIsOpen={setModalOpen}
    onSubmit={() => {
        sendDeleteLegacyYmApp();
        setModalOpen(false);
    }}
    title="Устаревшая версия Яндекс Музыки"
    onSubmitLabel="Удалить"
    onCancelLabel="Отмена"
    >
        <TextBox>
            У вас установлена устаревшая версия Яндекс Музыки из MS Store.<br/>Она может помешать установке и
            использованию новой версии.<br/><br/><b>Удалить устаревшую версию?</b>
        </TextBox>
    </Modal>
    )
}

export default WindowsLegacyAppModal;
