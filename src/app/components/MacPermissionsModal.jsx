import Modal from "./Modal.jsx";
import React, { useEffect, useState, useCallback } from "react";
import TextBox from "./TextBox.jsx";
import TextInput from "./TextInput.jsx";
import InlineButton from "./InlineButton.jsx";

function CustomPathModal() {

    const [isModalOpen, setModalOpen] = useState(false);
    const isModalOpenRef = React.useRef(isModalOpen);


    const sendOpenPermissionsSettings = useCallback(() => {
        window.desktopEvents.send('OPEN_EXTERNAL_PERMISSIONS_SETTINGS');
    }, [])

    const handleRequestMacPermissions = useCallback(() => {
        console.log('Received REQUEST_MAC_PERMISSIONS');
        if (!isModalOpenRef.current) {
            setModalOpen(true);
        }
        console.log(isModalOpenRef.current);
    }, [isModalOpen]);

    useEffect(() => {
        window.desktopEvents.on('REQUEST_MAC_PERMISSIONS', handleRequestMacPermissions);
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
                На macOS патчеру для правильной работы требуется предоставить права <b>App Management</b> или <b>Full disk access</b><br/><br/>Нажав ОК откроется окно настроек
            </TextBox>
        </Modal>
    )
}

export default CustomPathModal;
