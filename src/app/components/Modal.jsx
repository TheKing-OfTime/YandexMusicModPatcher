import React from 'react';
import '../styles/Modal.css'; // Подключите стили для модального окна

function Modal({ isOpen, onClose, title, children, onSubmit=undefined }) {
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
                    <ModalFooter onClose={onClose} onSubmit={onSubmit}></ModalFooter>
                </div>
            </div>
        </div>
    );
}

export default Modal;

function ModalFooter({ onClose, onSubmit = undefined }) {
    return onSubmit ? (
        <div className="Modal_footer">
            <button className="Modal_cancelButton" onClick={onClose}>Закрыть</button>
            <button className="Modal_submitButton" type="submit" onClick={onSubmit}>ОК</button>
        </div>
    ) : (
        <div className="Modal_footer">
            <button className="Modal_submitButton" onClick={onClose}>ОК</button>
        </div>
    );
}