import React, { useEffect, useState } from 'react';
import { useOnPatchProgress } from '../Events.jsx';


function MainProgressBar() {

    const [progress, setProgress] = useState(0);
    const [taskLabel, setTaskLabel] = useState('Idle...');
    const [logLabel, setLogLabel] = useState('');

    const [isDecreasing, setIsDecreasing] = useState(false);


    useEffect(() => {
        const OffPatchProgress = useOnPatchProgress((event, args) => {
            setProgress((previousProgress) => {
                if (previousProgress <= args.progress) {
                    setIsDecreasing(false);
                    return args.progress;
                } else {
                    setIsDecreasing(true);
                    setTimeout(() => setProgress(args.progress), 1000);
                    return previousProgress;
                }
            });
            setLogLabel(args.subTaskLabel);
            setTaskLabel(args.taskLabel);
        })

        return () => {
            OffPatchProgress();
        }

    }, [])

    return (
    <div className="ProgressBar_root">
        <div className="ProgressBar_container">
            <div className="ProgressBar_ProgressBar" id="progressBar" style={isDecreasing ? {
                width: progress * 100 + '%',
                opacity: 0,
                transition: "opacity 0.3s ease-in-out 0.7s, width 0.3s ease-in-out"
            } : {
                width: progress * 100 + '%', opacity: 1
            }}/>
        </div>
        <div className="ProgressBar_labelsContainer">
            <div className="ProgressBar_TaskLabel" id="taskLabel">
                <span>{taskLabel}</span>
            </div>
            <div className="ProgressBar_LogLabel" id="logLabel">
                <span>{logLabel}</span>
            </div>
        </div>
    </div>
    )
}

export default MainProgressBar;
