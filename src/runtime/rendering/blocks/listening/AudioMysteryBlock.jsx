import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeUrl from "../../../../assets/images/badge_reading.png";

function AudioMysteryBlock({ block }) {
    const {
        title = "Audio Mystery",
        instructions = "Listen to the audio clues and guess what is being described",
        audioClues = [], // Array of {audio, clueNumber, hint}
        revealImage = null,
        revealText = null,
        correctAnswer = "",
        answerOptions = []
    } = block.content;

    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [revealedClues, setRevealedClues] = useState(new Set([0]));
    const completion = useScreenCompletion();

    function handlePlayClue(index) {
        setCurrentClueIndex(index);
        setRevealedClues(prev => new Set([...prev, index]));
    }

    function handleRevealClue() {
        if (currentClueIndex < audioClues.length - 1) {
            handlePlayClue(currentClueIndex + 1);
        }
    }

    function handleSubmitAnswer() {
        const correct = userAnswer.toLowerCase().trim() ===
            correctAnswer.toLowerCase().trim();
        setIsCorrect(correct);
        setRevealed(true);

        completion?.saveAnswer?.(block.id, {
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: correct,
            cluesUsed: revealedClues.size
        });

        if (correct) {
            completion?.reportAnswered(block.id);
        }
    }

    function handleSkip() {
        setRevealed(true);
        setIsCorrect(false);

        completion?.saveAnswer?.(block.id, {
            userAnswer: userAnswer || "skipped",
            correctAnswer: correctAnswer,
            isCorrect: false,
            cluesUsed: revealedClues.size,
            skipped: true
        });
    }

    const currentClue = audioClues[currentClueIndex];
    const progress = Math.round((revealedClues.size / audioClues.length) * 100);

    return (
        <BlockCard type="audio_mystery">
            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="audio_mystery"
                        title={title}
                        subtitle={instructions}
                    />

                    <div className="audio-mystery-progress">
                        <span className="progress-text">
                            Clues Revealed: {revealedClues.size} / {audioClues.length}
                        </span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="audio-mystery-player">
                        <div className="mystery-clue-display">
                            <div className="clue-number">
                                Clue #{currentClueIndex + 1}
                            </div>

                            {currentClue && (
                                <>
                                    <div className="elab-media-frame">
                                        <audio
                                            src={currentClue.audio}
                                            controls
                                            autoPlay
                                            className="elab-media-player"
                                        />
                                    </div>

                                    {currentClue.hint && (
                                        <div className="mystery-hint">
                                            <strong>💡 Hint:</strong>{" "}
                                            {currentClue.hint}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {!revealed && (
                            <div className="mystery-controls">
                                {currentClueIndex < audioClues.length - 1 && (
                                    <button
                                        onClick={handleRevealClue}
                                        className="elab-btn elab-btn-secondary"
                                    >
                                        Reveal Next Clue
                                    </button>
                                )}
                                {currentClueIndex === audioClues.length - 1 && (
                                    <div className="mystery-all-clues">
                                        ✓ All clues revealed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="audio-mystery-clue-list">
                        <h5>Clues:</h5>
                        <div className="clue-grid">
                            {audioClues.map((clue, idx) => (
                                <button
                                    key={idx}
                                    className={`clue-badge ${revealedClues.has(idx) ? "revealed" : ""} ${currentClueIndex === idx ? "active" : ""}`}
                                    onClick={() => handlePlayClue(idx)}
                                    disabled={!revealedClues.has(idx)}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="elab-block-content-side">
                    {!revealed ? (
                        <div className="mystery-answer-section">
                            <h4>What is it?</h4>

                            {answerOptions.length > 0 ? (
                                <div className="mystery-options">
                                    {answerOptions.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className="mystery-option-label"
                                        >
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={option}
                                                checked={userAnswer === option}
                                                onChange={(e) =>
                                                    setUserAnswer(e.target.value)
                                                }
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="mystery-answer-input"
                                    placeholder="Enter your answer..."
                                    value={userAnswer}
                                    onChange={(e) =>
                                        setUserAnswer(e.target.value)
                                    }
                                />
                            )}

                            <div className="mystery-action-buttons">
                                <button
                                    onClick={handleSubmitAnswer}
                                    className="elab-submit-btn"
                                    disabled={!userAnswer}
                                >
                                    Submit Answer
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="elab-skip-btn"
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mystery-result">
                            <div
                                className={`result-header ${isCorrect ? "correct" : "incorrect"}`}
                            >
                                {isCorrect ? "🎉 Correct!" : "❌ Not Quite"}
                            </div>

                            <div className="result-details">
                                <div className="result-item">
                                    <span className="result-label">
                                        Your Answer:
                                    </span>
                                    <span className="result-value">
                                        {userAnswer || "Skipped"}
                                    </span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">
                                        Correct Answer:
                                    </span>
                                    <span className="result-value">
                                        {correctAnswer}
                                    </span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">
                                        Clues Used:
                                    </span>
                                    <span className="result-value">
                                        {revealedClues.size} / {audioClues.length}
                                    </span>
                                </div>
                            </div>

                            {revealImage && (
                                <div className="mystery-reveal-image">
                                    <img
                                        src={revealImage}
                                        alt="Mystery Reveal"
                                    />
                                </div>
                            )}

                            {revealText && (
                                <div className="mystery-reveal-text">
                                    {revealText}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </BlockCard>
    );
}

export default AudioMysteryBlock;
