import React from 'react';
import CustomPathModal from "./CustomPathModal.jsx";
import MacPermissionsModal from "./MacPermissionsModal.jsx";
import WindowsLegacyAppModal from "./WindowsLegacyAppModal.jsx";


export default function ModalsContainer() {
    return (
    <>
        <CustomPathModal/>
        <MacPermissionsModal/>
        <WindowsLegacyAppModal/>
    </>
    );
}
