import React, { useState } from 'react';
import Tooltip from './Tooltip.jsx';
import InlineButton from './InlineButton.jsx';

export default function CopyButton({ icon, label, variant, tooltipBefore, tooltipAfter, tooltipDirection="top", onClick }) {
    const [ didCopy, setDidCopy ] = useState(false);

    return (
        <Tooltip label={ didCopy ? (tooltipAfter ?? "Cкопировано!") : (tooltipBefore ?? "Скопировать") } direction={ tooltipDirection } onMouseEnter={ () => setDidCopy(false) }>
            <InlineButton icon={ icon } variant={ variant } label={ label } onClick={
                () => {
                    setDidCopy(true);
                    const result = onClick();
                    navigator.clipboard.writeText(result);
                }
            }/>
        </Tooltip>
    )
}
