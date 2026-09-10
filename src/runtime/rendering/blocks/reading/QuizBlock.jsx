import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

const CONFETTI_EMOJI = ["🎉", "⭐", "✨"];

function QuizBlock({ block }) {

    const content = block?.content || {};

    // Check if sub-questions array exists (e.g. content.questions[0])
    const firstQ = (Array.isArray(content.questions) && content.questions.length > 0)
        ? content.questions[0]
        : null;

    // Get question text: prioritize firstQ.question, then content.question, then content.quiz_question
    let question = "Enter question text here...";
    if (firstQ?.question && firstQ.question !== "Enter question text here...") {
        question = firstQ.question;
    } else if (content.question && content.question !== "Enter question text here...") {
        question = content.question;
    } else if (content.quiz_question && content.quiz_question !== "Enter question text here...") {
        question = content.quiz_question;
    } else if (firstQ?.question) {
        question = firstQ.question;
    } else if (content.question) {
        question = content.question;
    } else if (content.quiz_question) {
        question = content.quiz_question;
    }

    // Get options array
    let rawOptions = [];
    if (firstQ?.options && Array.isArray(firstQ.options) && firstQ.options.some(o => typeof o === "string" ? o.trim() : o?.text?.trim())) {
        rawOptions = firstQ.options;
    } else if (Array.isArray(content.options) && content.options.some(o => typeof o === "string" ? o.trim() : o?.text?.trim())) {
        rawOptions = content.options;
    } else if (Array.isArray(content.quiz_options) && content.quiz_options.some(o => typeof o === "string" ? o.trim() : o?.text?.trim())) {
        rawOptions = content.quiz_options;
    } else if (firstQ?.options && Array.isArray(firstQ.options)) {
        rawOptions = firstQ.options;
    } else if (Array.isArray(content.options)) {
        rawOptions = content.options;
    } else if (Array.isArray(content.quiz_options)) {
        rawOptions = content.quiz_options;
    }

    const options = rawOptions.map(opt => {
        if (typeof opt === "string") return { text: opt };
        if (opt && typeof opt === "object") return { text: opt.text || "" };
        return { text: String(opt || "") };
    });

    const correctAnswerIndex = firstQ?.correctAnswerIndex ?? content.correctAnswerIndex ?? content.quiz_correct_index ?? 0;
    const audio = content.audio;
    const audioFirst = content.audioFirst || false;


    const completion = useScreenCompletion();
    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const [selected, setSelected] = useState(() => {
        if (savedAnswer != null) {
            return typeof savedAnswer === "object" ? savedAnswer.selectedIndex : savedAnswer;
        }
        return null;
    });

    const [confetti, setConfetti] = useState([]);
    const [audioPlayed, setAudioPlayed] = useState(false);
    const [useAudioMode, setUseAudioMode] = useState(audioFirst);
    const [feedback, setFeedback] = useState(""); // Add feedback message

    // Pre-report answered state ONLY if there is an actual saved answer loaded on mount
    useEffect(() => {
        if (savedAnswer != null) {
            completion?.reportAnswered(block.id);
        }
    }, [savedAnswer]);

    function handleSelect(index) {

        if (selected !== null && !window.__isAssessment) return;

        setSelected(index);
        completion?.saveAnswer?.(block.id, { 
            selectedIndex: index,
            audioFirst: useAudioMode
        });

        completion?.reportAnswered(block.id);

        // Set feedback message (non-assessment mode only)
        if (!window.__isAssessment) {
            if (index === correctAnswerIndex) {
                setFeedback("✓ Correct! Excellent!");
            } else {
                setFeedback("✗ Incorrect. Try again!");
            }
        }

        if (!window.__isAssessment && index === correctAnswerIndex) {

            const pieces = Array.from({ length: 6 }).map((_, i) => ({
                id: `${Date.now()}-${i}`,
                emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
                left: 10 + Math.random() * 80,
                fly: `translate(${(Math.random() - 0.5) * 80}px, ${-60 - Math.random() * 40}px)`
            }));

            setConfetti(pieces);

            setTimeout(() => setConfetti([]), 700);

        }

    }

    const isAssessment = window.__isAssessment;

    return (

        <BlockCard type="quiz" className="custom-quiz-card">

            {confetti.map(p => (
                <span
                    key={p.id}
                    className="elab-confetti-piece"
                    style={{ left: `${p.left}%`, top: 0, "--fly-to": p.fly }}
                >
                    {p.emoji}
                </span>
            ))}

            <div className="quiz-main-layout">
                {/* Left Side: Header & Options */}
                <div className="quiz-left-column">
                    <div className="quiz-custom-header">
                        <div className="quiz-header-top-row">
                            <img 
                                src="/quiz images/quiz question mark icon.png" 
                                alt="?" 
                                className="quiz-header-icon"
                            />
                            <span className="quiz-custom-badge">Quiz</span>
                        </div>
                        <h3 className="quiz-question-text">{question}</h3>
                    </div>

                    {audio && (
                        <div className="quiz-audio-section">
                            <div className="elab-media-frame">
                                <audio 
                                    src={audio} 
                                    controls 
                                    className="elab-media-player"
                                    onPlay={() => setAudioPlayed(true)}
                                />
                            </div>
                            {useAudioMode && (
                                <div className="audio-first-toggle">
                                    <label className="toggle-label">
                                        <input 
                                            type="checkbox" 
                                            checked={useAudioMode}
                                            onChange={(e) => setUseAudioMode(e.target.checked)}
                                            className="toggle-input"
                                        />
                                        <span className="toggle-text">Audio-First Mode</span>
                                    </label>
                                    {!audioPlayed && (
                                        <small className="audio-reminder">Listen first before answering</small>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="quiz-options-container">
                        {options.map((option, index) => {

                            const isSelected = selected === index;
                            const isCorrect = !isAssessment && selected !== null && index === correctAnswerIndex;
                            const isIncorrect = !isAssessment && isSelected && index !== correctAnswerIndex;

                            return (

                                <button
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    disabled={!isAssessment && selected !== null}
                                    className={`quiz-custom-option ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isIncorrect ? "is-incorrect" : ""}`}
                                >
                                    <span className="quiz-option-badge">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="quiz-option-text">
                                        {option.text}
                                    </span>
                                </button>

                            );

                        })}
                    </div>

                    {/* Feedback Message */}
                    {feedback && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px 14px",
                            borderRadius: "6px",
                            fontSize: "16px",
                            fontWeight: "600",
                            backgroundColor: feedback.includes("✓") ? "#dcfce7" : "#fee2e2",
                            color: feedback.includes("✓") ? "#15803d" : "#dc2626",
                            border: `2px solid ${feedback.includes("✓") ? "#22c55e" : "#ef4444"}`,
                            textAlign: "center",
                            animation: "slideIn 0.3s ease-out"
                        }}>
                            {feedback}
                        </div>
                    )}
                </div>

                {/* Right Side: Illustration */}
                <div className="quiz-right-column">
                    <img 
                        src="/quiz images/quiz right side image.png" 
                        alt="Quiz Illustration" 
                        className="quiz-illustration"
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default QuizBlock;
