import React from 'react';
import '../../styles/Modal.css'; // Подключите стили для модального окна

function Modal({
                   isOpen,
                   onClose,
                   title,
                   children,
                   onSubmit = undefined,
                   onSubmitLabel = undefined,
                   onCancelLabel = undefined
               }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="Modal_overlay" onClick={onClose}>
            <div className="Modal_content" onClick={(e) => e.stopPropagation()}>
                <div className="Modal_header">
                    <h2>{title}</h2>
                </div>
                <div className="Modal_body">
                    {children}
                </div>
                <div className="Modal_footer">
                    <ModalFooter onClose={onClose} onSubmit={onSubmit} onSubmitLabel={onSubmitLabel}
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
