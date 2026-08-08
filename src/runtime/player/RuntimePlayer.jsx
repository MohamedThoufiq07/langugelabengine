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

function RuntimePlayer({

    runtime,

    onExit

}) {

    const registry = useMemo(

        () => new RendererRegistry(),

        []

    );

    const [loading, setLoading] = useState(true);

    const [, setRefreshKey] = useState(0);

    const [screen, setScreen] = useState(null);

    useEffect(() => {

        setScreen(

            runtime.getCurrentScreen()

        );

        setLoading(false);

    }, [runtime]);

    const refreshScreen = useCallback(() => {

        setScreen(

            runtime.getCurrentScreen()

        );

    }, [runtime]);

    const handleComplete = useCallback((result = {}) => {

        runtime.completeCurrentScreen(result);

        setRefreshKey(prev => prev + 1);

        refreshScreen();

    }, [runtime, refreshScreen]);



    const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);

    const progress = runtime.getProgress();
    const experience = runtime.getExperience();

    // Reset selected activity if experience changes
    useEffect(() => {
        setSelectedActivityIndex(null);
    }, [experience]);

    const handleExitToMenu = useCallback(() => {
        setSelectedActivityIndex(null);
    }, []);

    // Get current activity screens
    const currentActivity = useMemo(() => {
        if (selectedActivityIndex === null) return null;
        return experience?.activities?.[selectedActivityIndex] || null;
    }, [experience, selectedActivityIndex]);

    const activityScreens = useMemo(() => {
        return currentActivity?.screens || [];
    }, [currentActivity]);

    // Override navigation hooks to keep within current activity
    const handleNext = useCallback(() => {
        const currentScreenIdx = runtime.getCurrentScreenIndex();
        if (currentActivity && currentScreenIdx < currentActivity.screens.length - 1) {
            runtime.engineState.setCurrentScreen(currentScreenIdx + 1);
            refreshScreen();
        } else {
            // Completed current activity module
            setSelectedActivityIndex(null);
        }
    }, [runtime, refreshScreen, currentActivity]);

    const handlePrevious = useCallback(() => {
        const currentScreenIdx = runtime.getCurrentScreenIndex();
        if (currentScreenIdx > 0) {
            runtime.engineState.setCurrentScreen(currentScreenIdx - 1);
            refreshScreen();
        }
    }, [runtime, refreshScreen]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (selectedActivityIndex === null) {
        const activities = experience?.activities || [];
        return (
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/bg1.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "3rem 2rem 6rem 2rem",
                boxSizing: "border-box",
                overflowY: "scroll",
                fontFamily: "Inter, sans-serif"
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: "960px",
                    textAlign: "center",
                    marginBottom: "2.5rem"
                }}>
                    <h1 style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "0.5rem"
                    }}>
                        {experience?.title || "Welcome to your English Lesson"}
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
                        Select a module below to start learning.
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1.5rem",
                    width: "100%",
                    maxWidth: "960px"
                }}>
                    {activities.map((act, index) => {
                        const skills = act.skills || [];
                        const skillName = skills[0] || "general";

                        // Map skills to beautiful colored backgrounds/icons to match the screenshot
                        const themeMap = {
                            listening: { bg: "#eef2ff", text: "#1e40af", pillBg: "#dbeafe", icon: "🎧", accent: "#3b82f6" },
                            speaking: { bg: "#faf5ff", text: "#6b21a8", pillBg: "#f3e8ff", icon: "🗣️", accent: "#a855f7" },
                            reading: { bg: "#f0fdf4", text: "#166534", pillBg: "#dcfce7", icon: "📖", accent: "#22c55e" },
                            writing: { bg: "#fff7ed", text: "#c2410c", pillBg: "#ffedd5", icon: "✏️", accent: "#f97316" },
                            grammar: { bg: "#fdf2f8", text: "#9d174d", pillBg: "#fce7f3", icon: "🧠", accent: "#ec4899" },
                            phonetics: { bg: "#f0fdfa", text: "#0f766e", pillBg: "#ccfbf1", icon: "🎙️", accent: "#14b8a6" }
                        };
                        const config = themeMap[skillName.toLowerCase()] || { bg: "#f8fafc", text: "#334155", pillBg: "#e2e8f0", icon: "⭐", accent: "#64748b" };

                        return (
                            <button
                                key={act.id || index}
                                onClick={() => {
                                    runtime.engineState.setCurrentActivity(index);
                                    runtime.engineState.setCurrentScreen(0);
                                    refreshScreen();
                                    setSelectedActivityIndex(index);
                                }}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "24px",
                                    padding: "8.5rem 1.5rem 1.5rem 1.5rem",
                                    aspectRatio: "320 / 235",
                                    width: "100%",
                                    maxWidth: "320px",
                                    height: "235px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-start",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)";
                                    e.currentTarget.style.borderColor = config.accent;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                }}
                            >
                                {/* Background Illustrations to match the user's screenshots */}
                                {skillName.toLowerCase() === "listening" && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: "url('/listening card.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        zIndex: 1,
                                        opacity: 0.95
                                    }} />
                                )}

                                {skillName.toLowerCase() === "speaking" && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: "url('/speaker.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        zIndex: 1,
                                        opacity: 0.95
                                    }} />
                                )}

                                {skillName.toLowerCase() === "reading" && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: "url('/reading.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        zIndex: 1,
                                        opacity: 0.95
                                    }} />
                                )}

                                {skillName.toLowerCase() === "writing" && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: "url('/writing.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        zIndex: 1,
                                        opacity: 0.95
                                    }} />
                                )}

                                {/* Group top elements to stack together at the top of the card */}
                                <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: 2, marginBottom: "0" }}>
                                    <h3 style={{
                                        fontSize: "1.45rem",
                                        fontWeight: 800,
                                        color: "#0f172a",
                                        margin: "0 0 0.15rem 0"
                                    }}>
                                        {act.title || "Module"}
                                    </h3>
                                    <p style={{
                                        fontSize: "0.9rem",
                                        color: "#64748b",
                                        margin: "0",
                                        lineHeight: 1.4,
                                        maxWidth: "60%"
                                    }}>
                                        {act.description || "Start practicing now"}
                                    </p>
                                </div>
                                 {/* Screen button container has been removed */}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!screen) {
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

    return (
        <RuntimeShell
            runtime={runtime}
            progress={customProgress}
            canGoNext={runtime.canNavigateNext()}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onExit={handleExitToMenu}
            theme={theme}
            gradeBand={gradeBand}
        >
            <Renderer
                screen={screen}
                onComplete={handleComplete}
                activityScreens={activityScreens}
                currentScreenIndex={customProgress.currentScreen - 1}
            />
        </RuntimeShell>
    );
}

export default RuntimePlayer;