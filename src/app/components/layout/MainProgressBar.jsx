import React, { useEffect, useState } from 'react';
import { useOnPatchProgress } from '../Events.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';


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
    <div className="MainProgressBar_root">
        <ProgressBar progress={progress} color={"#E4CF0E"} height={'20px'} />
        <div className="MainProgressBar_labelsContainer">
            <div className="MainProgressBar_TaskLabel" id="taskLabel">
                <span>{taskLabel}</span>
            </div>
            <div className="MainProgressBar_LogLabel" id="logLabel">
                <span>{logLabel}</span>
            </div>
        </div>
    </div>
    )
}

export default MainProgressBar;
