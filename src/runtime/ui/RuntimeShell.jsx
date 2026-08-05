import { useState, useEffect } from "react";
import "../RuntimeShell.css";
import "../backdrop/SceneBackdrop.css";

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

    // ── Proctoring State ──
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    // Helper to pause all videos and audios on page
    const pauseAllMedia = () => {
        const mediaElements = document.querySelectorAll("video, audio");
        mediaElements.forEach((el) => {
            try {
                el.pause();
            } catch (err) {}
        });
    };

    // ── Tab Switch / Focus Detection ──
    useEffect(() => {
        const handleTabSwitch = () => {
            if (isBlocked) return;

            // Trigger detection if tab is hidden or window lost focus
            if (document.hidden || !document.hasFocus()) {
                pauseAllMedia();

                if (warningCount === 0) {
                    setShowWarningModal(true);
                } else if (warningCount >= 1) {
                    setIsBlocked(true);
                    setShowWarningModal(false);
                }
            }
        };

        document.addEventListener("visibilitychange", handleTabSwitch);
        window.addEventListener("blur", handleTabSwitch);

        return () => {
            document.removeEventListener("visibilitychange", handleTabSwitch);
            window.removeEventListener("blur", handleTabSwitch);
        };
    }, [warningCount, isBlocked]);

    // ── Content Protection ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P, F12
            if (
                e.ctrlKey &&
                (e.key === "c" ||
                    e.key === "C" ||
                    e.key === "x" ||
                    e.key === "X" ||
                    e.key === "a" ||
                    e.key === "A" ||
                    e.key === "p" ||
                    e.key === "P")
            ) {
                e.preventDefault();
                return false;
            }

            // Block F12 (DevTools)
            if (e.key === "F12") {
                e.preventDefault();
                return false;
            }

            // Block PrintScreen (prevent taking standard screen capture snippets)
            if (e.key === "PrintScreen") {
                e.preventDefault();
                navigator.clipboard.writeText(""); // clear clipboard
                alert("Screenshots are restricted on this platform.");
                return false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleRestartLesson = () => {
        // Reset local proctoring state and refresh session/screen
        setWarningCount(0);
        setIsBlocked(false);
        setShowWarningModal(false);
        window.location.reload();
    };

    const handleResumeLesson = () => {
        setWarningCount(1);
        setShowWarningModal(false);
    };

    return (
        <div
            className="runtime-shell"
            data-grade-band={gradeBand}
            style={theme}
            onContextMenu={(e) => e.preventDefault()} // block right-click
            onCopy={(e) => e.preventDefault()} // block copying
            onCut={(e) => e.preventDefault()} // block cutting
            onDragStart={(e) => e.preventDefault()} // block dragging content
        >
            <main className="scene-backdrop" style={BACKDROP_STYLE}>
                {/* Scrollable content area */}
                <div className="scene-content-area">
                    {children}
                </div>

                {/* ── Title text on the bg board — bottom-left ── */}
                <div className="board-text-widget">
                    <span className="board-title-text">
                        {experience?.title || "English Activity"}
                    </span>
                    <span className="board-screen-text">
                        Screen {progress.currentScreen} / {progress.totalScreens}
                    </span>
                </div>

                {/* ── Attractive nav buttons — bottom-center ── */}
                <div className="floating-nav-bar">
                    {/* Previous — yellow round */}
                    <button
                        className="game-btn game-btn-prev"
                        disabled={progress.currentScreen <= 1 || isBlocked}
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
                            disabled={!canGoNext || isBlocked}
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
                            disabled={!canGoNext || isBlocked}
                            onClick={onNext}
                            aria-label="Next"
                            title="Next"
                        >
                            <span className="game-btn-label">Next</span>
                            <span className="game-btn-icon">▶</span>
                        </button>
                    )}
                </div>

                {/* ── Proctoring Warnings and Auto-Block Screens ── */}
                {showWarningModal && (
                    <div className="proctor-overlay">
                        <div className="proctor-card warning-card">
                            <h2>⚠️ Warning 1/2</h2>
                            <h3>Tab Switch Detected!</h3>
                            <p>Please stay on the lesson screen to continue learning.</p>
                            <button className="proctor-btn resume-btn" onClick={handleResumeLesson}>
                                I Understand & Resume
                            </button>
                        </div>
                    </div>
                )}

                {isBlocked && (
                    <div className="proctor-overlay">
                        <div className="proctor-card blocked-card">
                            <h2>🚫 Lesson Blocked</h2>
                            <p>You left the screen multiple times during active learning. Access has been locked.</p>
                            <button className="proctor-btn restart-btn" onClick={handleRestartLesson}>
                                Restart Lesson
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default RuntimeShell;