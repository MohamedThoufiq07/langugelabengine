import { useState, useRef } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function AudioMysteryBlock({ block }) {
    const {
        title = "Audio Mystery",
        question = "What is being described?",
        instructions = "Listen to the audio clues and guess what is being described",
        // JSON uses "clues" array with {audio, duration, description}
        clues = [],
        // Legacy fallback
        audioClues = [],
        hints = {},
        // JSON uses "options" array (strings or {label, image})
        options = [],
        // Legacy fallback
        answerOptions = [],
        correctAnswer = 0,
        revealImage = null,
        revealText = null,
    } = block.content;

    // Normalize: prefer clues over audioClues
    const allClues = clues.length > 0 ? clues : audioClues;
    // Normalize: prefer options over answerOptions
    const allOptions = options.length > 0 ? options : answerOptions;

    // correctAnswer may be an index (number) or a string label
    const correctLabel = typeof correctAnswer === "number"
        ? (allOptions[correctAnswer] ?? "")
        : correctAnswer;

    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [textAnswer, setTextAnswer] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const audioRef = useRef(null);
    const completion = useScreenCompletion();

    const currentClue = allClues[currentClueIndex] || null;
    const hint = hints?.visualClue || hints?.replay || "";

    function handlePlayClue() {
        if (!currentClue?.audio) return;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(currentClue.audio);
        audioRef.current.play();
        setPlaying(true);
        audioRef.current.onended = () => setPlaying(false);
    }

    function handleNextClue() {
        if (currentClueIndex < allClues.length - 1) {
            setCurrentClueIndex(i => i + 1);
            setPlaying(false);
        }
    }

    function handleSubmit() {
        const userAns = allOptions.length > 0 ? selectedOption : textAnswer;
        const correct = allOptions.length > 0
            ? userAns === correctLabel
            : userAns?.toLowerCase().trim() === String(correctLabel).toLowerCase().trim();

        setIsCorrect(correct);
        setRevealed(true);

        completion?.saveAnswer?.(block.id, {
            userAnswer: userAns,
            correctAnswer: correctLabel,
            isCorrect: correct,
        });
        if (correct) completion?.reportAnswered(block.id);
    }

    function handleSkip() {
        setRevealed(true);
        setIsCorrect(false);
        completion?.saveAnswer?.(block.id, {
            userAnswer: "skipped",
            correctAnswer: correctLabel,
            isCorrect: false,
            skipped: true,
        });
    }

    const hasOptions = allOptions.length > 0;
    const canSubmit = hasOptions ? selectedOption !== null : textAnswer.trim().length > 0;

    return (
        <BlockCard type="audio_mystery">
            {/* Purple board header */}
            <BlockHeader
                type="audio_mystery"
                title={title}
            />

            {/* Question title */}
            <div style={{
                color: "#c0392b",
                fontWeight: 800,
                fontSize: "1.2rem",
                marginBottom: "1rem",
                marginTop: "0.5rem",
            }}>
                {question}
            </div>

            {/* PLAY CLUE button */}
            <button
                onClick={handlePlayClue}
                disabled={!currentClue?.audio}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    width: "100%",
                    padding: "0.85rem 1.5rem",
                    background: playing
                        ? "linear-gradient(90deg, #e67e22 0%, #f39c12 100%)"
                        : "linear-gradient(90deg, #e67e22 0%, #f39c12 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: currentClue?.audio ? "pointer" : "not-allowed",
                    opacity: currentClue?.audio ? 1 : 0.5,
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                    boxShadow: "0 4px 16px rgba(230,126,34,0.35)",
                    transition: "opacity 0.2s",
                }}
            >
                <span style={{ fontSize: "1.2rem" }}>🔊</span>
                {playing
                    ? `PLAYING CLUE ${currentClueIndex + 1}...`
                    : `PLAY CLUE ${currentClueIndex + 1}${currentClue?.duration ? ` (${currentClue.duration}s ${currentClue.description || "Audio"})` : ""}`}
            </button>

            {/* Hint row */}
            {hint && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid #fde68a",
                    borderRadius: "0.6rem",
                    padding: "0.6rem 1rem",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                    color: "#78350f",
                }}>
                    <span>💡</span>
                    <span><strong>Hint:</strong> {hint}</span>
                </div>
            )}

            {/* Multi-clue nav */}
            {allClues.length > 1 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    {allClues.map((clue, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCurrentClueIndex(idx); setPlaying(false); }}
                            style={{
                                padding: "0.35rem 0.85rem",
                                borderRadius: "2rem",
                                border: "2px solid",
                                borderColor: currentClueIndex === idx ? "#e67e22" : "#fed7aa",
                                background: currentClueIndex === idx ? "#fff7ed" : "transparent",
                                color: currentClueIndex === idx ? "#c2410c" : "#92400e",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontSize: "0.85rem",
                            }}
                        >
                            Clue {idx + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Reveal area */}
            {!revealed ? (
                <>
                    {/* MCQ options */}
                    {hasOptions && (
                        <>
                            <div style={{
                                fontSize: "0.9rem",
                                color: "#78350f",
                                marginBottom: "0.65rem",
                                fontWeight: 600,
                            }}>
                                Select the correct answer:
                            </div>
                            <div style={{
                                display: "flex",
                                gap: "1rem",
                                flexWrap: "wrap",
                                marginBottom: "1.25rem",
                            }}>
                                {allOptions.map((opt, idx) => {
                                    const label = typeof opt === "object" ? opt.label : opt;
                                    const image = typeof opt === "object" ? opt.image : null;
                                    const isSelected = selectedOption === label;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedOption(label)}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "0.4rem",
                                                padding: "0.75rem 1.2rem",
                                                border: "2.5px solid",
                                                borderColor: isSelected ? "#e67e22" : "rgba(255,255,255,0.7)",
                                                borderRadius: "0.85rem",
                                                background: isSelected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                                                cursor: "pointer",
                                                minWidth: "90px",
                                                boxShadow: isSelected ? "0 0 0 3px rgba(230,126,34,0.25)" : "none",
                                                transition: "all 0.15s",
                                                color: isSelected ? "#c2410c" : "#374151",
                                                fontWeight: isSelected ? 800 : 600,
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {image && (
                                                <img
                                                    src={image}
                                                    alt={label}
                                                    style={{
                                                        width: "72px",
                                                        height: "60px",
                                                        objectFit: "contain",
                                                        borderRadius: "0.5rem",
                                                    }}
                                                />
                                            )}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Text input fallback */}
                    {!hasOptions && (
                        <input
                            type="text"
                            placeholder="Type your answer..."
                            value={textAnswer}
                            onChange={e => setTextAnswer(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                borderRadius: "0.75rem",
                                border: "2px solid #fed7aa",
                                background: "rgba(255,255,255,0.7)",
                                fontSize: "0.95rem",
                                marginBottom: "1rem",
                                boxSizing: "border-box",
                                outline: "none",
                            }}
                        />
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSkip}
                            style={{
                                padding: "0.6rem 1.2rem",
                                borderRadius: "0.6rem",
                                border: "2px solid #fed7aa",
                                background: "transparent",
                                color: "#92400e",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontSize: "0.9rem",
                            }}
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                                padding: "0.65rem 1.75rem",
                                borderRadius: "0.6rem",
                                border: "none",
                                background: canSubmit
                                    ? "linear-gradient(90deg, #e67e22 0%, #f39c12 100%)"
                                    : "#fed7aa",
                                color: "#fff",
                                fontWeight: 800,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                fontSize: "0.95rem",
                                letterSpacing: "0.04em",
                                boxShadow: canSubmit ? "0 4px 12px rgba(230,126,34,0.3)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            SUBMIT GUESS →
                        </button>
                    </div>
                </>
            ) : (
                /* Result panel */
                <div style={{
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "1rem",
                    padding: "1.25rem 1.5rem",
                    border: "2px solid",
                    borderColor: isCorrect ? "#86efac" : "#fca5a5",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: isCorrect ? "#15803d" : "#dc2626",
                        marginBottom: "0.75rem",
                    }}>
                        {isCorrect ? "🎉 Correct!" : "✗ Not Quite"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem" }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <span style={{ color: "#6b7280", minWidth: "110px" }}>Your Answer:</span>
                            <span style={{ fontWeight: 700 }}>{selectedOption || textAnswer || "Skipped"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <span style={{ color: "#6b7280", minWidth: "110px" }}>Correct Answer:</span>
                            <span style={{ fontWeight: 700, color: "#15803d" }}>{String(correctLabel)}</span>
                        </div>
                    </div>
                    {revealImage && (
                        <img src={revealImage} alt="Reveal" style={{ marginTop: "1rem", maxWidth: "100%", borderRadius: "0.75rem" }} />
                    )}
                    {revealText && (
                        <p style={{ marginTop: "0.75rem", color: "#374151" }}>{revealText}</p>
                    )}
                </div>
            )}
        </BlockCard>
    );
}

export default AudioMysteryBlock;
