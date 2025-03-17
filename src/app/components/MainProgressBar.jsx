import * as React from 'react';

function MainProgressBar() {

    const [progress, setProgress] = React.useState(0);
    const [taskLabel, setTaskLabel] = React.useState('Idle...');
    const [logLabel, setLogLabel] = React.useState('');


    React.useEffect(() => {
        window.desktopEvents.on('PATCH_PROGRESS', (event, args) => {
            setProgress(Math.min(Math.max(args.progress, 0), 1));
            setLogLabel(args.logLabel);
            setTaskLabel(args.taskLabel);
        })
    }, [])

    return (
        <div className="ProgressBar_root">
            <div className="ProgressBar_container">
                <div className="ProgressBar_ProgressBar" id="progressBar" style={{width: progress*100 + '%'}}/>
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
