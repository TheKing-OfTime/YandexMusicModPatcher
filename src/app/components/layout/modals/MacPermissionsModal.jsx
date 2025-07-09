import Modal from "../../ui/Modal.jsx";
import React, { useCallback, useEffect, useState } from "react";
import TextBox from "../../ui/TextBox.jsx";
import { useOnRequestMacPermissions, useSendOpenExternalPermissionsSettings } from "../../Events.jsx";


function MacPermissionsModal() {

    const [isModalOpen, setModalOpen] = useState(false);
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendOpenPermissionsSettings = useCallback(() => {
        useSendOpenExternalPermissionsSettings();
    }, [])

    const handleRequestMacPermissions = useCallback(() => {
        console.log('Received REQUEST_MAC_PERMISSIONS');
        if (!isModalOpenRef.current) {
            setModalOpen(true);
        }
        console.log(isModalOpenRef.current);
    }, [isModalOpen]);

    useEffect(() => {
        const offRequestMacPermissions = useOnRequestMacPermissions(handleRequestMacPermissions);
        return () => {
            offRequestMacPermissions();
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
        sendOpenPermissionsSettings();
        setModalOpen(false);
    }}
    title="Требуются дополнительные права">
        <TextBox>
            На macOS патчеру для правильной работы требуется предоставить права <b>App Management</b> или <b>Full
            disk access</b><br/><br/>Нажав ОК откроется окно настроек
        </TextBox>
    </Modal>
    )
}

export default MacPermissionsModal;
