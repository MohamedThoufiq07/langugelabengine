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

    // Reset selected activity if experience changes
    useEffect(() => {
        setSelectedActivityIndex(null);
    }, [experience, runtime, refreshScreen]);

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
            if (!isAssessment) {
                setSelectedActivityIndex(null);
            }
        }
    }, [runtime, refreshScreen, currentActivity, selectedActivityIndex, isAssessment]);

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

        // Define the 6 dashboard cards mapping to fit perfectly like the mockup
        const cardPositions = [
            // Row 1
            { posIndex: 0, actIndex: 0, defaultTitle: "Listening", defaultSubtitle: "Listen. Understand. Improve.", defaultIllustration: "/3dfc5703294eb1ec38bf1b2afde30da893c1b400.png", hasProfile: false },
            { posIndex: 1, actIndex: 1, defaultTitle: "Speaking", defaultSubtitle: "Speak. Express. Connect.", defaultIllustration: "/sPEAKING.png", hasProfile: true },
            { posIndex: 2, actIndex: 2, defaultTitle: "Reading", defaultSubtitle: "Read. Comprehend. Succeed.", defaultIllustration: "/5ce2ee6baefb3f8c42110328981242edef93f177.png", hasProfile: true },
            // Row 2
            { posIndex: 5, actIndex: 5, defaultTitle: "Phonetics", defaultSubtitle: "Practice Pronunciation.", defaultIllustration: "/4da2dc9fd036c3940a5309f0f0b4786a93bf248f.png", hasProfile: true },
            { posIndex: 4, actIndex: 4, defaultTitle: "Grammar", defaultSubtitle: "Learn. Practice. Perfect.", defaultIllustration: "/ef83dde95cc4d81c7c5ee74b692f345825b599b1.png", hasProfile: true },
            { posIndex: 3, actIndex: 3, defaultTitle: "Writing", defaultSubtitle: "Write. Compose. Create.", defaultIllustration: "/c593c17824ede845777c22f0a95859e94e1f49b0 (1).png", hasProfile: true }
        ];

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
                justifyContent: "center",
                padding: "2rem",
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: "'Poppins', 'Inter', sans-serif"
            }}>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "320px 320px 320px",
                    gridTemplateRows: "220px 220px",
                    columnGap: "60px",
                    rowGap: "50px",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: "1140px",
                    position: "relative",
                    boxSizing: "border-box"
                }}>
                    {cardPositions.map((card) => {
                        const act = activities[card.actIndex];
                        const title = act?.title || card.defaultTitle;
                        const illustration = card.defaultIllustration;
                        
                        // Check locked state based on activity index
                        const isUnlocked = card.actIndex === 0 || completedActivities.includes(card.actIndex - 1);
                        const isCompleted = completedActivities.includes(card.actIndex);
                        
                        // Define subtitles dynamically based on locks
                        let subtitle = card.defaultSubtitle;
                        if (!isUnlocked) {
                            const prevAct = activities[card.actIndex - 1];
                            subtitle = `Complete ${prevAct?.title || "previous"} to Unlock`;
                        }

                        // Determine grid placement (3-column layout)
                        let row, col;
                        if (card.posIndex === 0) { row = 1; col = 1; }
                        else if (card.posIndex === 1) { row = 1; col = 2; }
                        else if (card.posIndex === 2) { row = 1; col = 3; }
                        else if (card.posIndex === 3) { row = 2; col = 3; }
                        else if (card.posIndex === 4) { row = 2; col = 2; }
                        else if (card.posIndex === 5) { row = 2; col = 1; }

                        return (
                            <div key={card.posIndex} style={{
                                gridRow: row,
                                gridColumn: col,
                                position: "relative",
                                zIndex: 1
                            }}>
                                <button
                                    disabled={!isUnlocked}
                                    onClick={() => {
                                        if (isUnlocked && card.actIndex < activities.length) {
                                            runtime.engineState.setCurrentActivity(card.actIndex);
                                            runtime.engineState.setCurrentScreen(0);
                                            refreshScreen();
                                            setSelectedActivityIndex(card.actIndex);
                                        }
                                    }}
                                    style={{
                                        position: "relative",
                                        width: "320px",
                                        height: "220px",
                                        backgroundImage: "url('/summer bg card.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "20px 22px 25px 22px",
                                        boxSizing: "border-box",
                                        border: "none",
                                        backgroundColor: "transparent",
                                        cursor: isUnlocked && card.actIndex < activities.length ? "pointer" : "default",
                                        transform: isUnlocked ? "scale(1)" : "scale(0.96)",
                                        transition: "all 0.2s ease",
                                        textAlign: "left",
                                        outline: "none"
                                    }}
                                >
                                    {/* Left Image */}
                                    <div style={{
                                        width: "42%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        paddingLeft: "15px",
                                        boxSizing: "border-box"
                                    }}>
                                        <img 
                                            src={illustration} 
                                            alt={title} 
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "85%",
                                                objectFit: "contain",
                                                filter: isUnlocked ? "none" : "grayscale(80%) contrast(80%) brightness(80%)"
                                            }} 
                                        />
                                    </div>

                                    {/* Right Info */}
                                    <div style={{
                                        width: "58%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingLeft: "5px",
                                        boxSizing: "border-box",
                                        textAlign: "center"
                                    }}>
                                        <h3 style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: 900,
                                            fontSize: "1.45rem",
                                            color: "#7e401b",
                                            margin: "0 0 2px 0",
                                            textTransform: "capitalize",
                                            textShadow: "0 1px 1px rgba(255,255,255,0.6)"
                                        }}>
                                            {title}
                                        </h3>
                                        <p style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "0.68rem",
                                            fontWeight: 700,
                                            color: isUnlocked ? "#9e653f" : "#a88a75",
                                            margin: "0 0 10px 0",
                                            lineHeight: "1.2",
                                            minHeight: "28px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            {subtitle}
                                        </p>
                                        
                                        {/* Button */}
                                        {isUnlocked ? (
                                            isCompleted ? (
                                                <div style={{
                                                    backgroundImage: "url('/b4c6e517cceac63ee91086eb50eaca7e9dd93bcd.png')",
                                                    backgroundSize: "100% 100%",
                                                    width: "125px",
                                                    height: "36px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#ffffff",
                                                    fontWeight: 800,
                                                    fontSize: "0.76rem",
                                                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                                    textTransform: "uppercase"
                                                }}>
                                                    COMPLETED ✓
                                                </div>
                                            ) : (
                                                <div style={{
                                                    backgroundImage: "url('/b4c6e517cceac63ee91086eb50eaca7e9dd93bcd.png')",
                                                    backgroundSize: "100% 100%",
                                                    width: "115px",
                                                    height: "36px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#ffffff",
                                                    fontWeight: 800,
                                                    fontSize: "0.8rem",
                                                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                                    cursor: "pointer"
                                                }}>
                                                    Start Now
                                                </div>
                                            )
                                        ) : (
                                            <div style={{
                                                backgroundImage: "url('/locked board.png')",
                                                backgroundSize: "100% 100%",
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition: "center",
                                                borderRadius: "10px",
                                                width: "115px",
                                                height: "36px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#ffffff",
                                                fontWeight: 800,
                                                fontSize: "0.78rem",
                                                textTransform: "uppercase",
                                                border: "none",
                                                textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                                            }}>
                                                LOCKED
                                            </div>
                                        )}
                                    </div>
                                </button>
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
                isExperienceType={isExperienceType}
            />
        </RuntimeShell>
    );
}

export default RuntimePlayer;