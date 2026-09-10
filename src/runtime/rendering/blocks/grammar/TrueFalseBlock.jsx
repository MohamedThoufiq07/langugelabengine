import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import HintLadderComponent from "../../services/HintLadder";

import badgeFactCheckUrl from "../../../../assets/images/badge_fact_check.png";
import boyReadingUrl from "../../../../assets/images/grammar_boy_reading.png";
import iconCheckUrl from "../../../../assets/images/grammar_icon_check.png";
import iconCrossUrl from "../../../../assets/images/grammar_icon_cross.png";

function TrueFalseBlock({ block }) {
    const completion = useScreenCompletion();
    
    // Support statements array from the JSON schema
    const statements = block.content.statements || [];
    const explanation = block.content.explanation || "";
    const hints = block.content.hints || {
        replay: "Think about the statement again carefully",
        visualClue: "Focus on the key details in the question",
        sentenceStarter: "The statement is...",
        modelAnswer: "This statement is correct/incorrect because..."
    };
    
    // Legacy support for single question
    const items = statements.length > 0 ? statements : [
        {
            question: block.content.question || "Is the statement true?",
            correctAnswer: block.content.correctAnswer !== undefined ? block.content.correctAnswer : true
        }
    ];

    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    // Initial state: map indexes to selected true/false values
    const [answers, setAnswers] = useState(savedAnswer || {});

    // For assessment mode or retry feedback
    const [submitted, setSubmitted] = useState(!!savedAnswer && Object.keys(savedAnswer).length > 0);
    
    // Feedback tracking
    const [correctness, setCorrectness] = useState({}); // Track which answers are correct
    const [feedback, setFeedback] = useState({});
    
    // Hint ladder integration
    const [attemptedIndices, setAttemptedIndices] = useState(new Set());
    const [currentAttempt, setCurrentAttempt] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [currentHint, setCurrentHint] = useState(null);
    const [hintIndex, setHintIndex] = useState(null);
    
    const isAssessment = window.__isAssessment;

    useEffect(() => {
        const allAnswered = items.every((_, i) => answers[i] !== undefined && answers[i] !== null);
        if (allAnswered) {
            completion?.reportAnswered(block.id);
        }
    }, [answers, items, completion]);

    function handleSelect(index, value) {
        // Check if answer is correct
        const isCorrect = value === items[index].correctAnswer;
        
        // Toggle answer if clicked again, or set new value
        const newAnswers = { ...answers };
        if (newAnswers[index] === value) {
            delete newAnswers[index];
        } else {
            newAnswers[index] = value;
        }
        setAnswers(newAnswers);

        // Save progress to player
        completion?.saveAnswer?.(block.id, newAnswers);

        // Update correctness tracking
        setCorrectness(prev => ({
            ...prev,
            [index]: isCorrect
        }));

        // Set feedback message
        setFeedback(prev => ({
            ...prev,
            [index]: isCorrect ? "✓ Correct!" : "✗ Incorrect"
        }));

        // Hint ladder tracking (non-assessment mode only)
        if (!isAssessment && !isCorrect) {
            const newAttempts = new Set(attemptedIndices);
            newAttempts.add(index);
            setAttemptedIndices(newAttempts);
            setCurrentAttempt(prev => prev + 1);
            setHintIndex(index);
            setShowHint(true);
        }

        // If all statements on this card are answered, report it as complete to the runtime player
        const allAnswered = items.every((_, i) => newAnswers[i] !== undefined && newAnswers[i] !== null);
        if (allAnswered) {
            completion?.reportAnswered(block.id);
        }
    }

    function handleRequestHint(hint) {
        setCurrentHint(hint);
        setShowHint(true);
    }

    return (
        <BlockCard type="true_false" className="elab-fact-check-card">
            <div className="elab-grammar-card-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Header with badge and title */}
                <BlockHeader
                    type="true_false"
                    title="FACT CHECK"
                    subtitle="Determine if each statement is true or false"
                />

                {/* Hint Ladder (non-assessment mode only) */}
                {!isAssessment && currentAttempt > 0 && (
                    <HintLadderComponent
                        currentAttempt={currentAttempt}
                        onRequestHint={handleRequestHint}
                        canUseHint={currentAttempt < 4}
                        hints={hints}
                    />
                )}

                {/* Current Hint Display */}
                {currentHint && showHint && (
                    <div className="hint-display" style={{ 
                        background: "#FFF7ED", 
                        border: "2px solid #FB923C",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        marginBottom: "12px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div>
                                <div style={{ fontWeight: "600", color: "#92400E", marginBottom: "4px" }}>
                                    {currentHint.label}
                                </div>
                                <div style={{ color: "#B45309", fontSize: "14px" }}>
                                    {currentHint.content || "Try again and think about the statement carefully."}
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowHint(false)}
                                style={{ 
                                    background: "none", 
                                    border: "none", 
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    color: "#B45309"
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Explanation (if provided) */}
                {explanation && (
                    <div style={{
                        background: "#F0F9FF",
                        border: "1px solid #BAE6FD",
                        borderRadius: "6px",
                        padding: "12px 14px",
                        fontSize: "14px",
                        color: "#0C4A6E"
                    }}>
                        <strong>ℹ️ Explanation:</strong> {explanation}
                    </div>
                )}

                {/* Statements List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                    {items.map((stmt, idx) => {
                        const currentSelection = answers[idx];

                        return (
                            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: idx < items.length - 1 ? "1px dashed #e2e8f0" : "none", paddingBottom: idx < items.length - 1 ? "16px" : "0" }}>
                                <p style={{ fontSize: "18px", fontWeight: "600", color: "#374151", margin: 0 }}>
                                    {stmt.question}
                                </p>
                                
                                {/* True/False Buttons Row */}
                                <div className="elab-fact-check-options-row" style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                                    <button
                                        onClick={() => handleSelect(idx, true)}
                                        className={`elab-tf-btn true-btn ${currentSelection === true ? "is-selected" : ""}`}
                                        style={{
                                            borderColor: correctness[idx] === true ? "#22c55e" : correctness[idx] === false && currentSelection === true ? "#ef4444" : undefined,
                                            backgroundColor: correctness[idx] === true && currentSelection === true ? "#dcfce7" : correctness[idx] === false && currentSelection === true ? "#fee2e2" : undefined
                                        }}
                                    >
                                        <img src={iconCheckUrl} className="elab-tf-btn-icon" alt="Check" />
                                        <span className="elab-tf-btn-text">TRUE</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleSelect(idx, false)}
                                        className={`elab-tf-btn false-btn ${currentSelection === false ? "is-selected" : ""}`}
                                        style={{
                                            borderColor: correctness[idx] === true ? "#22c55e" : correctness[idx] === false && currentSelection === false ? "#ef4444" : undefined,
                                            backgroundColor: correctness[idx] === true && currentSelection === false ? "#dcfce7" : correctness[idx] === false && currentSelection === false ? "#fee2e2" : undefined
                                        }}
                                    >
                                        <img src={iconCrossUrl} className="elab-tf-btn-icon" alt="Cross" />
                                        <span className="elab-tf-btn-text">FALSE</span>
                                    </button>
                                </div>

                                {/* Feedback Message */}
                                {feedback[idx] && (
                                    <div style={{
                                        marginTop: "8px",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        backgroundColor: correctness[idx] ? "#dcfce7" : "#fee2e2",
                                        color: correctness[idx] ? "#15803d" : "#dc2626",
                                        border: `1px solid ${correctness[idx] ? "#22c55e" : "#ef4444"}`
                                    }}>
                                        {feedback[idx]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right side Illustration */}
            <div className="elab-grammar-illustration">
                <img src={boyReadingUrl} className="elab-boy-reading-img" alt="Boy Reading" />
            </div>
        </BlockCard>
    );
}

export default TrueFalseBlock;
