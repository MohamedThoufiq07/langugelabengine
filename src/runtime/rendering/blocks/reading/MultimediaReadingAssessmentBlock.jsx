import { useState, useRef } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import { resolveMediaUrl } from "../../services/MediaResolver";

function MultimediaReadingAssessmentBlock({ block }) {
    const {
        mediaType = "video",
        mediaUrl,
        posterUrl,
        videoUrl,
        audioUrl,
        image,
        imageUrl,
        documentUrl,
        scenario,
        title = "Multimedia Reading Assessment",
        instruction = scenario || "Watch/Listen to the media carefully. Interactive questions will appear when media completes or pauses at target seconds.",
        questions = []
    } = block.content || {};

    const rawMedia = mediaUrl || videoUrl || audioUrl || documentUrl || image || imageUrl;
    const resolvedMedia = resolveMediaUrl(rawMedia || videoUrl || audioUrl);
    const resolvedPoster = resolveMediaUrl(posterUrl);

    // Determine actual media rendering type based on content fields
    const isVideo = (mediaType === "video" || (!!videoUrl && videoUrl.trim().length > 0) || (typeof rawMedia === "string" && (rawMedia.endsWith(".mp4") || rawMedia.endsWith(".webm") || rawMedia.endsWith(".mov"))));
    const isAudio = !isVideo && (mediaType === "audio" || mediaType === "multimedia" || !!audioUrl || (typeof rawMedia === "string" && (rawMedia.endsWith(".mp3") || rawMedia.endsWith(".wav") || rawMedia.endsWith(".aac") || rawMedia.endsWith(".ogg"))));

    const mediaRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [mediaEnded, setMediaEnded] = useState(false);

    // Answers tracking: qId -> answer (string for fill_blank, number/string for mcq)
    const [answers, setAnswers] = useState({});
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [blankInputs, setBlankInputs] = useState({});
    const [activePauseQuestion, setActivePauseQuestion] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [showExplanations, setShowExplanations] = useState({});

    const completion = useScreenCompletion();
    const isAssessment = !!window.__isAssessment;

    // Helper to get unique question ID
    const getQId = (q, idx) => q.id || `q-${idx}`;

    // Helper to extract target seconds from question JSON (supports pauseAt, pause_at, pauseTimeSeconds, etc.)
    const getTargetSeconds = (q) => {
        const sec = q.pauseAt ?? q.pause_at ?? q.pauseTimeSeconds ?? q.pauseTime ?? q.targetSeconds ?? q.triggerTime ?? q.pause_time ?? q.target_seconds ?? q.targetTime ?? q.target_time;
        if (sec !== undefined && sec !== null && sec !== "") {
            const parsed = parseFloat(sec);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    };

    // Monitor timeupdate on video/audio player to trigger pause at targeted seconds
    const handleTimeUpdate = () => {
        if (!mediaRef.current) return;
        const time = mediaRef.current.currentTime;
        setCurrentTime(time);

        // Find any unanswered question that matches the current target time
        questions.forEach((q, idx) => {
            const qId = getQId(q, idx);
            const targetSec = getTargetSeconds(q);

            if (targetSec !== null && targetSec > 0 && !answeredQuestions.has(qId)) {
                // Trigger pause when currentTime reaches or passes targetSec (window of 2.5s)
                if (time >= targetSec && time <= targetSec + 2.5) {
                    if (!mediaRef.current.paused) {
                        mediaRef.current.pause();
                    }
                    setActivePauseQuestion(q);
                }
            }
        });
    };

    const handleMediaEnded = () => {
        setMediaEnded(true);
    };

    // Handle MCQ Selection & Auto-Resume
    const handleMcqSelect = (q, idx, optIdx) => {
        const qId = getQId(q, idx);
        if (submitted && isAssessment) return;

        setAnswers(prev => ({ ...prev, [qId]: optIdx }));
        const nextAnswered = new Set(answeredQuestions);
        nextAnswered.add(qId);
        setAnsweredQuestions(nextAnswered);

        // Clear active question popup and resume video playback!
        if (activePauseQuestion && (activePauseQuestion.id === q.id || activePauseQuestion === q)) {
            setActivePauseQuestion(null);
            setTimeout(() => {
                if (mediaRef.current) {
                    mediaRef.current.play().catch(() => {});
                }
            }, 300);
        }

        if (nextAnswered.size >= questions.length && questions.length > 0) {
            completion?.reportAnswered?.(block.id);
        }
    };

    // Handle Fill-in-the-blanks Submission & Auto-Resume
    const handleFillBlankSubmit = (q, idx) => {
        const qId = getQId(q, idx);
        const inputVal = (blankInputs[qId] || "").trim();
        if (!inputVal) return;

        setAnswers(prev => ({ ...prev, [qId]: inputVal }));
        const nextAnswered = new Set(answeredQuestions);
        nextAnswered.add(qId);
        setAnsweredQuestions(nextAnswered);

        // Clear active question popup and resume video playback!
        if (activePauseQuestion && (activePauseQuestion.id === q.id || activePauseQuestion === q)) {
            setActivePauseQuestion(null);
            setTimeout(() => {
                if (mediaRef.current) {
                    mediaRef.current.play().catch(() => {});
                }
            }, 300);
        }

        if (nextAnswered.size >= questions.length && questions.length > 0) {
            completion?.reportAnswered?.(block.id);
        }
    };

    const toggleExplanation = (qId) => {
        setShowExplanations(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const hasPlayableMedia = (isVideo && !!resolvedMedia) || (isAudio && !!resolvedMedia);

    // Questions to display below player:
    // 1. If question is already answered: keep visible.
    // 2. If media has ended or there is no playable media: show all questions.
    // 3. If question has targetSec > 0: show when triggered (isActive).
    // 4. Otherwise (for audio / video before end): keep hidden until media ends.
    const visibleQuestions = questions.filter((q, idx) => {
        const qId = getQId(q, idx);
        const targetSec = getTargetSeconds(q);
        const isAnswered = answeredQuestions.has(qId);
        const isActive = activePauseQuestion && (activePauseQuestion.id === q.id || activePauseQuestion === q);

        if (isAnswered) return true;
        if (!hasPlayableMedia || mediaEnded) return true;

        if (targetSec !== null && targetSec > 0) {
            return isActive;
        }

        return false;
    });

    return (
        <BlockCard type="multimedia_reading_assessment">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                <BlockHeader
                    type="multimedia_reading_assessment"
                    title={title}
                    subtitle={instruction}
                />

                {/* 1. MEDIA PLAYER (VIDEO / AUDIO / POSTER) */}
                <div style={{
                    width: "100%",
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    border: isAudio ? "2px solid rgba(255, 255, 255, 0.5)" : "2px solid #cbd5e1",
                    backgroundColor: isAudio ? "transparent" : "#0f172a",
                    boxShadow: isAudio ? "0 10px 30px rgba(168, 85, 247, 0.25)" : "0 6px 18px rgba(0,0,0,0.12)",
                    position: "relative",
                    transition: "all 0.3s ease"
                }}>
                    {isVideo ? (
                        resolvedMedia ? (
                            <video
                                ref={mediaRef}
                                controls
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleMediaEnded}
                                poster={resolvedPoster || undefined}
                                controlsList="nodownload"
                                style={{ width: "100%", maxHeight: "380px", display: "block", objectFit: "contain", backgroundColor: "#000000" }}
                                src={resolvedMedia}
                            />
                        ) : (
                            <div style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>
                                🎬 Video Player (No media URL provided)
                            </div>
                        )
                    ) : isAudio ? (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1.25rem",
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%)",
                            padding: "2rem 1.5rem",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Decorative ambient glow circles */}
                            <div style={{
                                position: "absolute",
                                top: "-40px",
                                right: "-40px",
                                width: "130px",
                                height: "130px",
                                borderRadius: "50%",
                                background: "rgba(255, 255, 255, 0.18)",
                                pointerEvents: "none"
                            }} />
                            <div style={{
                                position: "absolute",
                                bottom: "-30px",
                                left: "-30px",
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                background: "rgba(255, 255, 255, 0.12)",
                                pointerEvents: "none"
                            }} />

                            {/* Frosted Glass Badge */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                backgroundColor: "rgba(255, 255, 255, 0.22)",
                                backdropFilter: "blur(10px)",
                                padding: "0.55rem 1.35rem",
                                borderRadius: "30px",
                                color: "#ffffff",
                                fontWeight: 800,
                                fontSize: "1.05rem",
                                fontFamily: "'Poppins', sans-serif",
                                textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                                border: "1px solid rgba(255, 255, 255, 0.35)"
                            }}>
                                <span style={{ fontSize: "1.4rem" }}>🎧</span>
                                <span>Interactive Audio Player</span>
                            </div>

                            {/* White Pill Audio Player Wrapper */}
                            {resolvedMedia ? (
                                <div style={{
                                    width: "100%",
                                    maxWidth: "520px",
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "35px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                                    border: "2px solid rgba(255, 255, 255, 0.8)"
                                }}>
                                    <audio
                                        ref={mediaRef}
                                        controls
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleMediaEnded}
                                        controlsList="nodownload"
                                        src={resolvedMedia}
                                        style={{ width: "100%", height: "42px" }}
                                    />
                                </div>
                            ) : (
                                <div style={{ color: "#ffffff", fontWeight: 700 }}>No audio source provided</div>
                            )}
                        </div>
                    ) : (
                        resolvedPoster || resolvedMedia ? (
                            <div style={{ width: "100%", backgroundColor: "#ffffff", padding: "0.5rem" }}>
                                <img
                                    src={resolvedPoster || resolvedMedia}
                                    alt="Poster"
                                    style={{ width: "100%", maxHeight: "380px", objectFit: "contain", borderRadius: "0.75rem", display: "block", margin: "0 auto" }}
                                />
                            </div>
                        ) : (
                            <div style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>
                                📁 Multimedia Player (No media URL provided)
                            </div>
                        )
                    )}
                </div>

                {/* 2. TRIGGERED / TARGETED QUESTIONS BELOW THE VIDEO */}
                {visibleQuestions.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                Interactive Questions ({answeredQuestions.size} / {questions.length} Completed)
                            </div>
                        </div>

                        {visibleQuestions.map((q) => {
                            const idx = questions.indexOf(q);
                            const qId = getQId(q, idx);
                            const isAnswered = answeredQuestions.has(qId);
                            const isActivePause = activePauseQuestion && (activePauseQuestion.id === q.id || activePauseQuestion === q);
                            const qMode = (q.mode || q.questionMode || q.type || "").toLowerCase();
                            const isFillInBlank = qMode.includes("fill") || qMode.includes("blank") || !!q.targetCorrectBlankAnswer || !!q.targetAnswer;

                            const qText = q.questionText || q.question || q.prompt || `Question #${idx + 1}`;
                            const userAns = answers[qId];
                            const targetBlankAns = q.targetCorrectBlankAnswer || q.targetAnswer || q.correctAnswer;

                            return (
                                <div
                                    key={qId}
                                    style={{
                                        backgroundColor: isActivePause ? "#fffbe6" : "#ffffff",
                                        borderRadius: "1rem",
                                        border: isActivePause ? "2.5px solid #f59e0b" : isAnswered ? "2px solid #22c55e" : "1.5px solid #cbd5e1",
                                        padding: "1.25rem",
                                        boxShadow: isActivePause ? "0 4px 18px rgba(245, 158, 11, 0.25)" : "0 4px 12px rgba(0,0,0,0.04)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                                        <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                            Question #{idx + 1}: {qText}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                            {isAnswered && (
                                                <span style={{ fontSize: "0.78rem", fontWeight: 800, padding: "4px 10px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#15803d" }}>
                                                    ✓ Answered
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* FILL IN THE BLANKS MODE */}
                                    {isFillInBlank ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                                                <input
                                                    type="text"
                                                    placeholder="Type your answer here..."
                                                    value={blankInputs[qId] ?? (answers[qId] || "")}
                                                    onChange={(e) => setBlankInputs({ ...blankInputs, [qId]: e.target.value })}
                                                    disabled={submitted && isAssessment}
                                                    style={{
                                                        flex: "1",
                                                        minWidth: "220px",
                                                        padding: "0.75rem 1rem",
                                                        borderRadius: "0.6rem",
                                                        border: isAnswered ? "2px solid #22c55e" : "2px solid #cbd5e1",
                                                        fontSize: "1rem",
                                                        fontWeight: 600,
                                                        outline: "none"
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFillBlankSubmit(q, idx)}
                                                    disabled={submitted && isAssessment}
                                                    style={{
                                                        padding: "0.75rem 1.5rem",
                                                        borderRadius: "0.6rem",
                                                        backgroundColor: isAnswered ? "#16a34a" : "#2563eb",
                                                        color: "#ffffff",
                                                        border: "none",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        boxShadow: "0 2px 8px rgba(37,99,235,0.2)"
                                                    }}
                                                >
                                                    {isAnswered ? "Submit Answer" : "Submit Answer"}
                                                </button>
                                            </div>

                                            {submitted && targetBlankAns && (
                                                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: (String(userAns || "").toLowerCase().trim() === String(targetBlankAns).toLowerCase().trim()) ? "#15803d" : "#b91c1c" }}>
                                                    Target Correct Blank Answer: <span style={{ textDecoration: "underline" }}>{targetBlankAns}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* MULTIPLE CHOICE MCQ MODE */
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                                            {(q.options || []).map((opt, optIdx) => {
                                                const optText = typeof opt === "string" ? opt : (opt.text || opt.label || `Option ${optIdx + 1}`);
                                                const optImage = typeof opt === "object" ? resolveMediaUrl(opt.imageUrl || opt.image) : null;
                                                const isSelected = userAns === optIdx;
                                                const isRightOption = optIdx === q.correctAnswerIndex;

                                                let optionBg = "#ffffff";
                                                let optionBorder = "2px solid #cbd5e1";
                                                let optionColor = "#1e293b";

                                                if (isSelected) {
                                                    optionBg = "#eff6ff";
                                                    optionBorder = "2px solid #3b82f6";
                                                    optionColor = "#1d4ed8";
                                                }

                                                if (submitted) {
                                                    if (isRightOption) {
                                                        optionBg = "#f0fdf4";
                                                        optionBorder = "2px solid #22c55e";
                                                        optionColor = "#15803d";
                                                    } else if (isSelected && !isRightOption) {
                                                        optionBg = "#fef2f2";
                                                        optionBorder = "2px solid #ef4444";
                                                        optionColor = "#b91c1c";
                                                    }
                                                }

                                                const letterLabel = String.fromCharCode(65 + optIdx);

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() => handleMcqSelect(q, idx, optIdx)}
                                                        disabled={submitted && isAssessment}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.75rem",
                                                            padding: "0.85rem 1rem",
                                                            borderRadius: "0.75rem",
                                                            backgroundColor: optionBg,
                                                            border: optionBorder,
                                                            color: optionColor,
                                                            fontSize: "0.95rem",
                                                            fontWeight: 600,
                                                            textAlign: "left",
                                                            cursor: (submitted && isAssessment) ? "default" : "pointer",
                                                            transition: "all 0.15s ease"
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: "28px",
                                                            height: "28px",
                                                            borderRadius: "50%",
                                                            backgroundColor: isSelected ? (submitted ? (isRightOption ? "#22c55e" : "#ef4444") : "#3b82f6") : "#f1f5f9",
                                                            color: isSelected ? "#ffffff" : "#475569",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 800,
                                                            fontSize: "0.85rem",
                                                            flexShrink: 0
                                                        }}>
                                                            {letterLabel}
                                                        </span>
                                                        <span style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                                                            {optImage && (
                                                                <img src={optImage} alt={optText} style={{ height: "48px", width: "auto", borderRadius: "0.4rem" }} />
                                                            )}
                                                            {optText}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Feedback / Explanation */}
                                    {submitted && q.explanation && (
                                        <div style={{ marginTop: "0.25rem" }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleExplanation(qId)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#2563eb",
                                                    fontWeight: 700,
                                                    fontSize: "0.85rem",
                                                    cursor: "pointer",
                                                    padding: 0
                                                }}
                                            >
                                                {showExplanations[qId] ? "💡 Hide Explanation" : "💡 View Explanation"}
                                            </button>
                                            {showExplanations[qId] && (
                                                <div style={{
                                                    marginTop: "0.5rem",
                                                    padding: "0.75rem 1rem",
                                                    borderRadius: "0.5rem",
                                                    backgroundColor: "#f0f9ff",
                                                    border: "1px solid #bae6fd",
                                                    color: "#0369a1",
                                                    fontSize: "0.9rem"
                                                }}>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div style={{ marginBottom: "20px" }} />
        </BlockCard>
    );
}

export default MultimediaReadingAssessmentBlock;
