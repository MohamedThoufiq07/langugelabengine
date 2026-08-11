import React, { useState, useEffect, useCallback } from "react";

function ProctoringGuard({
    runtime,
    children
}) {
    const experience = runtime?.getExperience();
    const currentActivityIndex = runtime?.engineState?.getCurrentActivityIndex();
    const currentActivity = experience?.activities?.[currentActivityIndex];
    
    const isAssessment = experience?.experienceType === 'ASSESSMENT' || experience?.experience_type === 'ASSESSMENT' || currentActivity?.activityType === 'ASSESSMENT' || currentActivity?.activity_type === 'ASSESSMENT';

    // ── Proctoring State ──
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    // Helper to pause all videos and audios on page
    const pauseAllMedia = useCallback(() => {
        const mediaElements = document.querySelectorAll("video, audio");
        mediaElements.forEach((el) => {
            try {
                el.pause();
            } catch (err) {}
        });
    }, []);

    // ── Tab Switch / Focus Detection ──
    useEffect(() => {
        if (!isAssessment) {
            // Bypass/Disable all proctoring event listeners
            return;
        }

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
    }, [isAssessment, warningCount, isBlocked, pauseAllMedia]);

    // ── Content Protection (Keydown & Screen Capture Restriction) ──
    useEffect(() => {
        if (!isAssessment) return;

        const handleKeyDown = (e) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, F12
            if (
                e.ctrlKey &&
                (e.key === "c" ||
                    e.key === "C" ||
                    e.key === "v" ||
                    e.key === "V" ||
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
    }, [isAssessment]);

    // ── Video Enforcement: Disable seeking/fast-forwarding ──
    useEffect(() => {
        if (!isAssessment) return;

        const handlePlay = (e) => {
            const video = e.target;
            if (video && video._prevTime === undefined) {
                video._prevTime = video.currentTime;
            }
        };

        const handleTimeUpdate = (e) => {
            const video = e.target;
            if (video && !video._seeking) {
                video._prevTime = video.currentTime;
            }
        };

        const handleSeeking = (e) => {
            const video = e.target;
            if (video && video.currentTime > (video._prevTime || 0)) {
                video._seeking = true;
                video.currentTime = video._prevTime || 0;
                video._seeking = false;
            }
        };

        document.addEventListener("play", handlePlay, true);
        document.addEventListener("timeupdate", handleTimeUpdate, true);
        document.addEventListener("seeking", handleSeeking, true);

        return () => {
            document.removeEventListener("play", handlePlay, true);
            document.removeEventListener("timeupdate", handleTimeUpdate, true);
            document.removeEventListener("seeking", handleSeeking, true);
        };
    }, [isAssessment]);

    const handleRestartLesson = useCallback(() => {
        setWarningCount(0);
        setIsBlocked(false);
        setShowWarningModal(false);
        window.location.reload();
    }, []);

    const handleResumeLesson = useCallback(() => {
        setWarningCount(1);
        setShowWarningModal(false);
    }, []);

    // Enforce user-select: none globally in assessment mode
    useEffect(() => {
        if (isAssessment) {
            document.body.style.userSelect = "none";
            document.body.style.webkitUserSelect = "none";
        } else {
            document.body.style.userSelect = "";
            document.body.style.webkitUserSelect = "";
        }
        return () => {
            document.body.style.userSelect = "";
            document.body.style.webkitUserSelect = "";
        };
    }, [isAssessment]);

    return (
        <div
            style={{ width: "100%", height: "100%" }}
            onContextMenu={isAssessment ? (e) => e.preventDefault() : undefined}
            onCopy={isAssessment ? (e) => e.preventDefault() : undefined}
            onCut={isAssessment ? (e) => e.preventDefault() : undefined}
        >
            {children}

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
        </div>
    );
}

export default ProctoringGuard;
