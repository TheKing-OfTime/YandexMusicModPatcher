import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../styles/ProgressBar.css';

function clamp01(v) {
    if (typeof v !== 'number' || Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(1, v));
}

function ProgressBar({
    progress = 0,
    height = '10px',
    color = '#5865f2',
    backgroundColor = '#343434',
    borderRadius = undefined
}) {
    const prevProgressRef = useRef(progress);
    const wasIndeterminateRef = useRef(progress === 1.1);

    // Показываемый прогресс в determinate режиме (нужен для сценария "сброс до 0, потом плавно к target")
    const [displayProgress, setDisplayProgress] = useState(() => {
        if (progress === 1.1) return 0;
        if (progress === -1) return 0;
        return clamp01(progress);
    });

    // Флаг: временно выключить transition (для мгновенного сброса width в 0)
    const [disableTransition, setDisableTransition] = useState(false);

    // RAF-ручки, чтобы можно было отменять при частых апдейтах
    const raf1Ref = useRef(0);
    const raf2Ref = useRef(0);

    // храним “последний реальный прогресс” (на случай если во время indeterminate приходит много обновлений)
    const latestRealProgressRef = useRef(clamp01(progress));

    useEffect(() => {
        return () => {
            if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
            if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
        };
    }, []);

    useEffect(() => {
        const prev = prevProgressRef.current;
        prevProgressRef.current = progress;

        // Обновляем latestRealProgress только для реального determinate
        if (progress !== 1.1 && progress !== -1) {
            latestRealProgressRef.current = clamp01(progress);
        }

        // Если вошли в indeterminate — просто фиксируем флаг и выходим
        if (progress === 1.1) {
            wasIndeterminateRef.current = true;

            // На всякий случай отменим запланированные RAF-переходы
            if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
            if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
            raf1Ref.current = 0;
            raf2Ref.current = 0;

            return;
        }

        // Если выходим из indeterminate в determinate — делаем: width=0 без transition, затем transition обратно, затем реальный прогресс
        if (wasIndeterminateRef.current && progress !== 1.1 && progress !== -1) {
            wasIndeterminateRef.current = false;

            // 1) мгновенный сброс до 0 без transition
            setDisableTransition(true);
            setDisplayProgress(0);

            // 2) на следующем кадре вернём transition
            if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
            if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);

            raf1Ref.current = requestAnimationFrame(() => {
                // В некоторых браузерах, чтобы гарантированно “применился” стиль без transition,
                // лучше сделать 2 кадра.
                raf2Ref.current = requestAnimationFrame(() => {
                    setDisableTransition(false);
                    setDisplayProgress(latestRealProgressRef.current);
                });
            });

            return;
        }

        // Если error
        if (progress === -1) {
            // В error оставляем текущую ширину (displayProgress) — чтобы не было скачка
            wasIndeterminateRef.current = false;

            if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
            if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
            raf1Ref.current = 0;
            raf2Ref.current = 0;

            return;
        }

        // Обычный determinate апдейт (не после indeterminate)
        if (progress !== 1.1) {
            // если progress уменьшился — оставим ваше “погасить и сбросить” поведение через стили (ниже),
            // но displayProgress всё равно обновим, чтобы в следующий раз было корректно
            setDisplayProgress(clamp01(progress));
        }
    }, [progress]);

    const containerStyle = useMemo(() => {
        return {
            height: height,
            backgroundColor: backgroundColor,
            borderRadius: borderRadius ?? height
        };
    }, [height, backgroundColor, borderRadius]);

    // База
    let progressStyle = {
        width: `${clamp01(displayProgress) * 100}%`,
        opacity: 1,
        backgroundColor: color,
        borderRadius: borderRadius
    };

    // Важно: когда disableTransition=true — глушим transition инлайном.
    // Когда false — НЕ задаём transition, чтобы работал transition из CSS.
    if (disableTransition) {
        progressStyle = { ...progressStyle, transition: 'none' };
    }

    const prev = prevProgressRef.current;

    // Сценарии как в вашем исходнике, но без ошибок с ref.current
    switch (progress) {
        case -1:
            progressStyle = {
                ...progressStyle,
                width: `${clamp01(displayProgress) * 100}%`,
                opacity: 0,
                transition: 'opacity 0.5s ease-in-out 1.5s, background-color 0.2s ease-in',
                backgroundColor: 'red'
            };
            break;

        // ваш “reset при уменьшении”
        case (progress < prev ? progress : false):
            progressStyle = {
                ...progressStyle,
                width: '0%',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out 0.7s, width 0.00001s linear 1s'
            };
            break;

        // indeterminate как было у вас (старую анимацию не трогаем)
        case 1.1:
            progressStyle = {
                ...progressStyle,
                width: '100%',
                transition: 'none',
                animation: 'ProgressBar_indeterminate 1.5s infinite'
            };
            break;
    }

    return (
        <div className="ProgressBar_container" style={containerStyle}>
            <div className="ProgressBar_progress" style={progressStyle} />
        </div>
    );
}

export default ProgressBar;
