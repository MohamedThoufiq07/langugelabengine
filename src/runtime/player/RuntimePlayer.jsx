/**
 * ============================================================
 * EnglishLab Runtime
 * ------------------------------------------------------------
 * RuntimePlayer
 *
 * Responsibilities
 * ----------------
 * • Display current screen
 * • Handle navigation
 * • Show progress
 * • Show completion
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import RendererRegistry from "../rendering/RendererRegistry";
import { pickThemeForScreen, parseGradeBand } from "../theme/presets";

import RuntimeShell from "../ui/RuntimeShell";

import LoadingScreen from "./LoadingScreen";

function RuntimePlayer({ runtime, onExit }) {
    const registry = useMemo(() => new RendererRegistry(), []);

    const [loading, setLoading] = useState(true);
    const [screen, setScreen] = useState(null);

    // True once all required blocks on the current screen are completed.
    // Reset to false whenever we navigate to a new screen.
    const [isScreenCompleted, setIsScreenCompleted] = useState(false);

    useEffect(() => {
        setScreen(runtime.getCurrentScreen());
        setLoading(false);
    }, [runtime]);

    const refreshScreen = useCallback(() => {
        setScreen(runtime.getCurrentScreen());
    }, [runtime]);

    const handleComplete = useCallback((result = {}) => {
        runtime.completeCurrentScreen(result);

        // Mark the screen as completed so the Next button becomes enabled.
        setIsScreenCompleted(true);
        refreshScreen();
    }, [runtime, refreshScreen]);

    // Start directly at activity 0 — no skills selection page
    const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);
    const [justFinishedActivityIndex, setJustFinishedActivityIndex] = useState(null);
    const [showCongrats, setShowCongrats] = useState(false);

    const progress = runtime.getProgress();
    const experience = runtime.getExperience();

    const handleReplay = useCallback(() => {
        runtime.engineState.getProgress().completedActivities = [];
        runtime.engineState.getProgress().completedScreens = [];
        runtime.engineState.getProgress().score = 0;
        setShowCongrats(false);
        setJustFinishedActivityIndex(null);
        setSelectedActivityIndex(0);
        window.location.reload();
    }, [runtime]);

    const isAssessment = useMemo(() => {
        const check = experience?.experienceType === 'ASSESSMENT' ||
               experience?.experience_type === 'ASSESSMENT' ||
               experience?.activities?.some(act => act.activityType === 'ASSESSMENT' || act.activity_type === 'ASSESSMENT');
        window.__isAssessment = check;
        return check;
    }, [experience]);

    const isExperienceType = useMemo(() => {
        const type = (experience?.experienceType || experience?.experience_type || experience?.lessonType || experience?.lesson_type || "").toLowerCase();
        console.log("DEBUG: experienceType is:", type, "experience object:", experience);
        return type === "experience" || type === "lesson";
    }, [experience]);

    // Auto-set activity 0 whenever the experience changes
    useEffect(() => {
        if (experience?.activities?.length > 0) {
            runtime.engineState.setCurrentActivity(0);
            runtime.engineState.setCurrentScreen(0);
            refreshScreen();
            setSelectedActivityIndex(0);
        }
    }, [experience]);

    // Get current activity screens
    const currentActivity = useMemo(() => {
        if (selectedActivityIndex === null) return null;
        return experience?.activities?.[selectedActivityIndex] || null;
    }, [experience, selectedActivityIndex]);

    const activityScreens = useMemo(() => {
        return currentActivity?.screens || [];
    }, [currentActivity]);

    const activities = experience?.activities || [];

    // Navigation — stays within the current activity
    const handleNext = useCallback(() => {
        if (!isScreenCompleted) return;

        // Reset completion state for the incoming screen before navigating.
        setIsScreenCompleted(false);

        const currentScreenIdx = runtime.getCurrentScreenIndex();
        if (currentActivity && currentScreenIdx < currentActivity.screens.length - 1) {
            // Move to next screen within the same activity
            runtime.engineState.setCurrentScreen(currentScreenIdx + 1);
            runtime.screenLifecycle.reset();
            runtime.screenLifecycle.load();
            runtime.screenLifecycle.start();
            refreshScreen();
        } else {
            const isLastActivity = selectedActivityIndex >= activities.length - 1;
            if (isLastActivity) {
                // Last activity done → show level-completed congrats
                setJustFinishedActivityIndex(selectedActivityIndex);
                setShowCongrats(true);
            } else {
                // Not the last activity → silently advance to next activity
                const nextIndex = selectedActivityIndex + 1;
                setSelectedActivityIndex(nextIndex);
                runtime.engineState.setCurrentActivity(nextIndex);
                runtime.engineState.setCurrentScreen(0);
                runtime.screenLifecycle.reset();
                runtime.screenLifecycle.load();
                runtime.screenLifecycle.start();
                refreshScreen();
            }
        }
    }, [isScreenCompleted, runtime, refreshScreen, currentActivity, selectedActivityIndex, activities]);

    const handlePrevious = useCallback(() => {
        const currentScreenIdx = runtime.getCurrentScreenIndex();

        if (currentScreenIdx > 0) {
            // Go back within the same activity
            setIsScreenCompleted(false);
            runtime.engineState.setCurrentScreen(currentScreenIdx - 1);
            runtime.screenLifecycle.reset();
            runtime.screenLifecycle.load();
            runtime.screenLifecycle.start();
            refreshScreen();
        } else if (selectedActivityIndex > 0) {
            // On first screen of this activity → jump back to the previous activity's last screen
            const prevActivityIndex = selectedActivityIndex - 1;
            const prevActivity = activities[prevActivityIndex];
            const lastScreenIdx = (prevActivity?.screens?.length || 1) - 1;

            setIsScreenCompleted(true); // previous screen was already completed
            setSelectedActivityIndex(prevActivityIndex);
            runtime.engineState.setCurrentActivity(prevActivityIndex);
            runtime.engineState.setCurrentScreen(lastScreenIdx);
            runtime.screenLifecycle.reset();
            runtime.screenLifecycle.load();
            runtime.screenLifecycle.start();
            refreshScreen();
        }
        // If already on very first screen of first activity, do nothing
    }, [runtime, refreshScreen, selectedActivityIndex, activities]);

    if (loading || !screen) {
        return <LoadingScreen />;
    }

    // Override progress structure to display only active activity screens count
    const customProgress = {
        ...progress,
        currentScreen: (runtime.getCurrentScreenIndex() ?? 0) + 1,
        totalScreens: activityScreens.length
    };

    const Renderer = registry.getRenderer("screen");
    const theme = pickThemeForScreen(screen, customProgress.currentScreen).vars;
    const gradeBand = parseGradeBand(runtime.getExperience()?.grade);

    // Congratulatory overlay — only shown when the entire level (last activity) is completed
    if (justFinishedActivityIndex !== null && showCongrats) {
        return (
            <div className="scene-backdrop congrats-backdrop">
                <div className="activity-complete-overlay">
                    <div className="activity-complete-board" role="dialog" aria-modal="true" aria-labelledby="activity-complete-title">
                        <div className="activity-complete-confetti" aria-hidden="true">• ✦ •</div>
                        <img
                            className="activity-complete-medal"
                            src="/star.png"
                            alt=""
                            aria-hidden="true"
                        />
                        <h2 id="activity-complete-title">Well Done!</h2>
                        <p>
                            You've successfully completed the level!
                        </p>
                        <div className="activity-complete-star" aria-hidden="true">★</div>
                        <button
                            className="activity-complete-button"
                            onClick={() => {
                                setShowCongrats(false);
                                setJustFinishedActivityIndex(null);
                                if (onExit) onExit();
                            }}
                        >
                            Continue Learning <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <RuntimeShell
            runtime={runtime}
            progress={customProgress}
            canGoNext={isScreenCompleted}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onExit={onExit}
            theme={theme}
            gradeBand={gradeBand}
        >
            <Renderer
                screen={screen}
                onComplete={handleComplete}
                activityScreens={activityScreens}
                currentScreenIndex={customProgress.currentScreen - 1}
                isExperienceType={isExperienceType}
            />
        </RuntimeShell>
    );
}

export default RuntimePlayer;
