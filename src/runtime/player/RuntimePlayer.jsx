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
        setSelectedActivityIndex(null);
        window.location.reload();
    }, [runtime]);

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
        if (!runtime.canNavigateNext()) return;

        const currentScreenIdx = runtime.getCurrentScreenIndex();
        if (currentActivity && currentScreenIdx < currentActivity.screens.length - 1) {
            runtime.engineState.setCurrentScreen(currentScreenIdx + 1);
            runtime.screenLifecycle.reset();
            runtime.screenLifecycle.load();
            runtime.screenLifecycle.start();
            refreshScreen();
        } else {
            // Completed current activity module
            setJustFinishedActivityIndex(selectedActivityIndex);
            setShowCongrats(true);
            setSelectedActivityIndex(null);
        }
    }, [runtime, refreshScreen, currentActivity, selectedActivityIndex]);

    const handlePrevious = useCallback(() => {
        const currentScreenIdx = runtime.getCurrentScreenIndex();
        if (currentScreenIdx > 0) {
            runtime.engineState.setCurrentScreen(currentScreenIdx - 1);
            runtime.screenLifecycle.reset();
            runtime.screenLifecycle.load();
            runtime.screenLifecycle.start();
            refreshScreen();
        }
    }, [runtime, refreshScreen]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (selectedActivityIndex === null) {
        const activities = experience?.activities || [];
        const completedActivities = runtime.engineState.getProgress().completedActivities || [];

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
                padding: "5rem 2rem 2rem 2rem",
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: "'Poppins', 'Inter', sans-serif"
            }}>
                <div style={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "2rem"
                }}>
                    <h1 style={{
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        marginBottom: "0.25rem",
                        textShadow: "0 2px 8px rgba(0, 0, 0, 0.4)"
                    }}>
                        Explore, Practice & Level Up Your Skills
                    </h1>
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    width: "100%",
                    maxWidth: "1280px",
                    boxSizing: "border-box"
                }}>
                    {activities.map((act, index) => {
                        const skills = act.skills || [];
                        const skillName = skills[0] || "general";
                        const isFirst = index === 0;
                        const isUnlocked = isFirst || completedActivities.includes(index - 1);

                        // Card illustrations from public folder
                        const illustrationMap = {
                            listening: "/listening card.png",
                            speaking: "/speaker.png",
                            reading: "/reading.png",
                            writing: "/writing.png",
                            grammar: "/grammer.png",
                            grammer: "/grammer.png",
                            phonetics: "/phonetics.png"
                        };
                        const illustration = illustrationMap[skillName.toLowerCase()] || "/reading.png";

                        // Styled active accents
                        const activeAccents = {
                            listening: { glow: "rgba(59, 130, 246, 0.8)", border: "#3b82f6", subtitle: "Listen. Understand. Improve.", cardBg: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)" },
                            speaking: { glow: "rgba(168, 85, 247, 0.8)", border: "#a855f7", subtitle: "Speak. Express. Connect.", cardBg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)" },
                            reading: { glow: "rgba(34, 197, 94, 0.8)", border: "#22c55e", subtitle: "Read. Comprehend. Succeed.", cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" },
                            writing: { glow: "rgba(249, 115, 22, 0.8)", border: "#f97316", subtitle: "Write. Compose. Create.", cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)" },
                            grammar: { glow: "rgba(236, 72, 153, 0.8)", border: "#ec4899", subtitle: "Learn. Practice. Perfect.", cardBg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)" }
                        };
                        const accent = activeAccents[skillName.toLowerCase()] || { glow: "rgba(100, 116, 139, 0.8)", border: "#64748b", subtitle: "Learn & Grow.", cardBg: "#ffffff" };

                        return (
                            <div key={act.id || index} style={{ display: "flex", alignItems: "center" }}>
                                <button
                                    disabled={!isUnlocked}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            runtime.engineState.setCurrentActivity(index);
                                            runtime.engineState.setCurrentScreen(0);
                                            refreshScreen();
                                            setSelectedActivityIndex(index);
                                        }
                                    }}
                                    style={{
                                        background: accent.cardBg,
                                        border: isUnlocked ? `3px solid ${accent.border}` : "3px solid transparent",
                                        borderRadius: "20px",
                                        width: "240px",
                                        height: "176px",
                                        cursor: isUnlocked ? "pointer" : "default",
                                        boxShadow: isUnlocked
                                            ? `0 0 20px ${accent.glow}, 0 6px 20px rgba(0, 0, 0, 0.15)`
                                            : "0 6px 16px rgba(0, 0, 0, 0.08)",
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                        overflow: "hidden",
                                        opacity: isUnlocked ? 1 : 0.8,
                                        transform: isUnlocked ? "scale(1.02)" : "scale(0.95)",
                                        padding: 0
                                    }}
                                >
                                    {/* Cover Background Illustration (Always Colorful) */}
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: `url('${illustration}')`,
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        opacity: isUnlocked ? 1 : 0.65,
                                        transition: "all 0.3s ease",
                                        zIndex: 1
                                    }} />

                                    {/* Content Overlay (placed on top of background) */}
                                    <div style={{
                                        position: "relative",
                                        zIndex: 2,
                                        height: "100%",
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.75rem 1rem",
                                        boxSizing: "border-box",
                                        textAlign: "center"
                                    }}>
                                         {/* Card Header Title (Right Aligned to avoid overlapping top-left illustration icons) */}
                                         <h3 style={{
                                             fontSize: "1.25rem",
                                             fontWeight: 800,
                                             color: isUnlocked ? "#1e293b" : "#475569",
                                             margin: "0",
                                             textTransform: "capitalize",
                                             textShadow: "0 1px 2px rgba(255,255,255,0.9)",
                                             alignSelf: "flex-end",
                                             textAlign: "right",
                                             width: "100%",
                                             paddingRight: "0.25rem"
                                         }}>
                                             {act.title || skillName}
                                         </h3>

                                        {/* Spacer to align content around the center illustration */}
                                        <div style={{ flex: 1 }} />

                                        {/* Dynamic content area depending on lock state */}
                                        {isUnlocked ? (
                                            completedActivities.includes(index) ? (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.25rem" }}>
                                                    <style>{`
                                                        @keyframes pulseTick {
                                                            0% { transform: scale(1); box-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
                                                            50% { transform: scale(1.1); box-shadow: 0 0 16px rgba(34, 197, 94, 0.8); }
                                                            100% { transform: scale(1); box-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
                                                        }
                                                    `}</style>
                                                    <p style={{
                                                        fontSize: "0.75rem",
                                                        color: "#15803d",
                                                        margin: "0",
                                                        fontWeight: 800,
                                                        lineHeight: 1.2,
                                                        textShadow: "0 1px 2px rgba(255,255,255,0.9)"
                                                    }}>
                                                        Completed
                                                    </p>
                                                    <div style={{
                                                        background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                                                        color: "#ffffff",
                                                        width: "28px",
                                                        height: "28px",
                                                        borderRadius: "50%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.9rem",
                                                        fontWeight: "bold",
                                                        boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)",
                                                        animation: "pulseTick 2s infinite ease-in-out"
                                                    }}>
                                                        ✓
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.4rem" }}>
                                                    <p style={{
                                                        fontSize: "0.72rem",
                                                        color: "#334155",
                                                        margin: "0",
                                                        fontWeight: 700,
                                                        lineHeight: 1.2,
                                                        textShadow: "0 1px 2px rgba(255,255,255,0.9)"
                                                    }}>
                                                        {accent.subtitle}
                                                    </p>
                                                    <div style={{
                                                        background: `linear-gradient(135deg, ${accent.border} 0%, #1e40af 100%)`,
                                                        color: "#ffffff",
                                                        padding: "6px 14px",
                                                        borderRadius: "15px",
                                                        fontWeight: 700,
                                                        fontSize: "0.75rem",
                                                        boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        Start Now <span style={{ fontSize: "0.85rem" }}>➔</span>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.3rem" }}>
                                                <div style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    background: "rgba(255, 255, 255, 0.9)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
                                                }}>
                                                    <span style={{ fontSize: "0.9rem" }}>🔒</span>
                                                </div>
                                                <p style={{
                                                    fontSize: "0.68rem",
                                                    color: "#475569",
                                                    margin: "0",
                                                    fontWeight: 700,
                                                    lineHeight: 1.2,
                                                    maxWidth: "95%",
                                                    textShadow: "0 1px 2px rgba(255,255,255,0.9)"
                                                }}>
                                                    Complete {activities[index - 1]?.title || "previous"} to Unlock
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </button>
                                {/* Horizontal Arrow Connector with flowing flow-line animation */}
                                {index < activities.length - 1 && (
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "36px",
                                        position: "relative",
                                        height: "24px"
                                    }}>
                                        <style>{`
                                            @keyframes arrowFlowLine {
                                                0% {
                                                    transform: translateX(-8px);
                                                    opacity: 0.15;
                                                }
                                                50% {
                                                    opacity: 1;
                                                    text-shadow: 0 0 10px currentColor;
                                                }
                                                100% {
                                                    transform: translateX(8px);
                                                    opacity: 0.15;
                                                }
                                            }
                                        `}</style>
                                        {/* Background base gray arrow */}
                                        <span style={{
                                            fontSize: "1.6rem",
                                            fontWeight: 900,
                                            color: "rgba(255, 255, 255, 0.4)",
                                            position: "absolute",
                                            userSelect: "none"
                                        }}>
                                            ➔
                                        </span>
                                        {/* Glowing flowing arrow if this card is completed */}
                                        {completedActivities.includes(index) && (
                                            <span style={{
                                                fontSize: "1.6rem",
                                                fontWeight: 900,
                                                color: accent.border,
                                                position: "absolute",
                                                animation: "arrowFlowLine 1.6s infinite linear",
                                                userSelect: "none"
                                            }}>
                                                ➔
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* Congratulatory pop popper overlay modal when any single activity is completed */}
                {justFinishedActivityIndex !== null && showCongrats && (
                    <div style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.75)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 99999,
                        fontFamily: "'Poppins', 'Inter', sans-serif"
                    }}>
                        <div style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                            padding: "3rem 2rem",
                            borderRadius: "32px",
                            maxWidth: "440px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                            border: "3px solid #22c55e",
                            position: "relative",
                            overflow: "hidden",
                            animation: "congratsPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}>
                            <style>{`
                                @keyframes congratsPop {
                                    0% { transform: scale(0.85); opacity: 0; }
                                    100% { transform: scale(1); opacity: 1; }
                                }
                                @keyframes popperWiggle {
                                    0%, 100% { transform: rotate(0deg) scale(1); }
                                    50% { transform: rotate(8deg) scale(1.15); }
                                }
                                @keyframes confettiParticle {
                                    0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
                                    100% { transform: translate(var(--tx), var(--ty)) scale(0.4) rotate(var(--tr)); opacity: 0; }
                                }
                            `}</style>

                            {/* Render Confetti Particles */}
                            {Array.from({ length: 50 }).map((_, i) => {
                                const angle = Math.random() * Math.PI * 2;
                                const dist = 60 + Math.random() * 180;
                                const tx = Math.cos(angle) * dist;
                                const ty = Math.sin(angle) * dist - (20 + Math.random() * 50);
                                const tr = Math.random() * 360;
                                const delay = Math.random() * 0.4;
                                const colors = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#a29bfe", "#ff6b81", "#ffffff"];
                                const color = colors[Math.floor(Math.random() * colors.length)];
                                const size = 6 + Math.random() * 8;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            width: `${size}px`,
                                            height: `${size}px`,
                                            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                                            background: color,
                                            pointerEvents: "none",
                                            zIndex: 1,
                                            animation: `confettiParticle 1.6s ${delay}s infinite linear`,
                                            "--tx": `${tx}px`,
                                            "--ty": `${ty}px`,
                                            "--tr": `${tr}deg`
                                        }}
                                    />
                                );
                            })}

                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div style={{
                                    fontSize: "4.5rem",
                                    marginBottom: "1rem",
                                    animation: "popperWiggle 1.5s infinite ease-in-out",
                                    display: "inline-block"
                                }}>
                                    🎉
                                </div>
                                <h2 style={{
                                    fontSize: "2.1rem",
                                    fontWeight: 900,
                                    color: "#15803d",
                                    margin: "0 0 0.5rem 0",
                                    lineHeight: 1.2
                                }}>
                                    Good Job!
                                </h2>
                                <p style={{
                                    fontSize: "1.1rem",
                                    color: "#334155",
                                    fontWeight: 700,
                                    margin: "0 0 2rem 0",
                                    lineHeight: 1.4
                                }}>
                                    You've successfully completed the {activities[justFinishedActivityIndex]?.title || "activity"} module! 🥳
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                                    <button
                                        onClick={() => {
                                            setShowCongrats(false);
                                            setJustFinishedActivityIndex(null);
                                        }}
                                        style={{
                                            background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                                            color: "#ffffff",
                                            border: "none",
                                            padding: "12px 28px",
                                            borderRadius: "999px",
                                            fontSize: "1rem",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            boxShadow: "0 8px 16px -4px rgba(34, 197, 94, 0.4)",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                                    >
                                        Continue Learning ➔
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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