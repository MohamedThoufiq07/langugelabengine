import { useMemo, useState, useEffect } from "react";
import "../RuntimeShell.css";
import "../backdrop/SceneBackdrop.css";
import SceneBackdrop from "../backdrop/SceneBackdrop";
import ProctoringGuard from "../proctoring/ProctoringGuard";

const BACKDROP_STYLE = {
    backgroundImage: "url('/bg.png')",
    backgroundSize: "100% 100%",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
};

function RuntimeShell({
    runtime,
    progress,
    canGoNext,
    onPrevious,
    onNext,
    onExit,
    theme,
    gradeBand = "mid",
    children
}) {
    const experience = runtime.getExperience();
    const isLastScreen =
        progress.currentActivity === progress.totalActivities &&
        progress.currentScreen === progress.totalScreens;

    const currentActivityIndex = runtime.engineState.getCurrentActivityIndex();
    const currentActivity = experience?.activities?.[currentActivityIndex];
    const isAssessment = experience?.experienceType === "ASSESSMENT" || experience?.experience_type === "ASSESSMENT" || currentActivity?.activityType === "ASSESSMENT" || currentActivity?.activity_type === "ASSESSMENT";

    const [timeLeft, setTimeLeft] = useState(() => {
        const durationMinutes = experience?.estimatedDuration || experience?.estimated_duration || 15;
        return durationMinutes * 60;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [experience]);

    const formattedTime = useMemo(() => {
        const h = Math.floor(timeLeft / 3600);
        const m = Math.floor((timeLeft % 3600) / 60);
        const s = timeLeft % 60;
        const pad = (num) => String(num).padStart(2, "0");
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }, [timeLeft]);

    const isTimeLow = timeLeft < 60; // 1 minute

    const dynamicBackdropStyle = isAssessment ? {
        backgroundImage: "url('/Assesment bg.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
    } : BACKDROP_STYLE;

    return (
        <ProctoringGuard runtime={runtime}>
            <div
                className="runtime-shell"
                data-grade-band={gradeBand}
                style={theme}
            >
                <main className="scene-backdrop" style={dynamicBackdropStyle}>
                    <SceneBackdrop runtime={runtime} />

                    {/* Countdown Timer at top right */}
                    <div className={`elab-assessment-timer ${isTimeLow ? "time-low" : ""}`}>
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="timer-svg-icon"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="timer-text">
                            {timeLeft === 0 ? "Time's Up!" : formattedTime}
                        </span>
                    </div>
                    
                    {/* Scrollable content area */}
                    <div className="scene-content-area">
                        {children}
                    </div>

                    {/* ── Title text on the bg board — bottom-left ── */}
                    {!isAssessment && (
                        <div className="board-text-widget">
                            <span className="board-title-text">
                                {experience?.title || "English Activity"}
                            </span>
                            <span className="board-screen-text">
                                Screen {progress.currentScreen} / {progress.totalScreens}
                            </span>
                        </div>
                    )}

                    {/* ── Attractive nav buttons — bottom-center ── */}
                    <div className="floating-nav-bar">
                        {/* Previous — yellow round */}
                        <button
                            className="game-btn game-btn-prev"
                            disabled={progress.currentScreen <= 1}
                            onClick={onPrevious}
                            aria-label="Previous"
                            title="Previous"
                        >
                            <span className="game-btn-icon">◀</span>
                            <span className="game-btn-label">Prev</span>
                        </button>

                        {/* Exit — red clearly visible */}
                        <button
                            className="game-btn game-btn-exit"
                            onClick={onExit}
                            aria-label="Exit"
                            title="Exit"
                        >
                            <span className="game-btn-icon">🏠</span>
                            <span className="game-btn-label">Exit</span>
                        </button>

                        {/* Next / Finish — green round */}
                        {isLastScreen ? (
                            <button
                                className="game-btn game-btn-finish"
                                disabled={!canGoNext}
                                onClick={onNext}
                                aria-label="Finish"
                                title="Finish"
                            >
                                <span className="game-btn-label">Done</span>
                                <span className="game-btn-icon">✓</span>
                            </button>
                        ) : (
                            <button
                                className="game-btn game-btn-next"
                                disabled={!canGoNext}
                                onClick={onNext}
                                aria-label="Next"
                                title="Next"
                            >
                                <span className="game-btn-label">Next</span>
                                <span className="game-btn-icon">▶</span>
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </ProctoringGuard>
    );
}

export default RuntimeShell;