import React, { useEffect, useRef } from 'react'
import '../../styles/ProgressBar.css'


function ProgressBar({ progress= 0, height='10px', color='#5865f2', backgroundColor='#343434', borderRadius=undefined }) {

    const previousProgress = useRef(0);

    useEffect(() => {
        previousProgress.current = progress;
    }, [progress]);

    let
        progressStyle= { width: Math.min(progress, 1) * 100 + '%', opacity: 1, backgroundColor: color, borderRadius: borderRadius },
        containerStyle = { height: height, backgroundColor: backgroundColor, borderRadius: borderRadius ?? height };

    switch (progress) {
        case -1:
            progressStyle = { ...progressStyle, width: Math.min(previousProgress, 1) * 100 + '%', opacity: 0, transition: "opacity 0.5s ease-in-out 1.5s, background-color 0.2s ease-in", backgroundColor: 'red' };
            break;
        case (progress < previousProgress.current ? progress : false):
            progressStyle = {
                ...progressStyle,
                width: '0%',
                opacity: 0,
                transition: "opacity 0.3s ease-in-out 0.7s, width 0.00001s linear 1s"
            };
            break;
        case 1.1: // Indeterminate
            progressStyle = {
                ...progressStyle,
                width: '100%',
                transition: "none",
                animation: 'ProgressBar_indeterminate 1.5s infinite'
            };
            break;
    }

    return (
        <div className="ProgressBar_container" style={containerStyle}>
            <div className="ProgressBar_progress" style={progressStyle}/>
        </div>
    )
}

export default ProgressBar;
