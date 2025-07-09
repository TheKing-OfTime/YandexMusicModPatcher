import React, { useCallback, useState } from 'react';
import '../../styles/Modal.css';

function Modal({
    isOpen,
    setIsOpen,
    title,
    children,
    onSubmit = undefined,
    onSubmitLabel = undefined,
    onCancelLabel = undefined,
    onClose = undefined,
}) {

    const [isClosing, setIsClosing] = useState(false);

    const closeModal = useCallback(() => {
        onClose?.();
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 290);
    }, [onClose, setIsOpen, setIsClosing]);

    if (!isOpen) {
        return null;
    }

    return (
    <div className={`Modal_overlay ${isClosing ? ' Modal_overlay__fadeOut' : ''}`} onClick={closeModal}>
        <div className={`Modal_content${isClosing ? ' Modal_content__slideOut' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="Modal_header">
                <h2>{title}</h2>
            </div>
            <div className="Modal_body">
                {children}
            </div>
            <div className="Modal_footer">
                <ModalFooter onClose={closeModal} onSubmit={onSubmit} onSubmitLabel={onSubmitLabel}
                             onCancelLabel={onCancelLabel}></ModalFooter>
            </div>
        </div>
    </div>
    );
}

export default Modal;

function ModalFooter({ onClose, onSubmit = undefined, onSubmitLabel = 'ОК', onCancelLabel = 'Закрыть' }) {
    return onSubmit ? (
    <div className="Modal_footer_buttons_container">
        <button className="Modal_cancelButton" onClick={onClose}>{onCancelLabel}</button>
        <button className="Modal_submitButton" type="submit" onClick={onSubmit}>{onSubmitLabel}</button>
    </div>
    ) : (
    <div className="Modal_footer_buttons_container">
        <button className="Modal_submitButton" onClick={onClose}>{onSubmitLabel}</button>
    </div>
    );
}
