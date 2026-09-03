import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeFactCheckUrl from "../../../../assets/images/badge_fact_check.png";
import boyReadingUrl from "../../../../assets/images/grammar_boy_reading.png";
import iconCheckUrl from "../../../../assets/images/grammar_icon_check.png";
import iconCrossUrl from "../../../../assets/images/grammar_icon_cross.png";

function TrueFalseBlock({ block }) {
    const completion = useScreenCompletion();
    
    // Support statements array from the JSON schema
    const statements = block.content.statements || [];
    
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

    function handleSelect(index, value) {
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

        // If all statements on this card are answered, report it as complete to the runtime player
        const allAnswered = items.every((_, i) => newAnswers[i] !== undefined && newAnswers[i] !== null);
        if (allAnswered) {
            completion?.reportAnswered(block.id);
        }
    }

    return (
        <BlockCard type="true_false" className="elab-fact-check-card">
            <div className="elab-grammar-card-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Purple board heading */}
                <div className="grammar-header" style={{ marginBottom: "-12px" }}>
                    <div className="grammar-title-banner writing">FACT CHECK</div>
                </div>

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
                                    >
                                        <img src={iconCheckUrl} className="elab-tf-btn-icon" alt="Check" />
                                        <span className="elab-tf-btn-text">TRUE</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleSelect(idx, false)}
                                        className={`elab-tf-btn false-btn ${currentSelection === false ? "is-selected" : ""}`}
                                    >
                                        <img src={iconCrossUrl} className="elab-tf-btn-icon" alt="Cross" />
                                        <span className="elab-tf-btn-text">FALSE</span>
                                    </button>
                                </div>
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
