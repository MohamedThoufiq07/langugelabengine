import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeUrl from "../../../../assets/images/badge_reading.png";

// Fuzzy string matching for text answers (case-insensitive, whitespace-tolerant)
function fuzzyMatch(userInput, expectedAnswer, tolerance = 0.8) {
    const clean = (str) => str.toLowerCase().trim().replace(/\s+/g, " ");
    const user = clean(userInput);
    const expected = clean(expectedAnswer);
    
    if (user === expected) return true;
    
    // Calculate Levenshtein distance
    const maxLen = Math.max(user.length, expected.length);
    if (maxLen === 0) return true;
    
    const distance = levenshteinDistance(user, expected);
    const similarity = 1 - (distance / maxLen);
    return similarity >= tolerance;
}

function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function FunctionalReadingBlock({ block }) {
    const {
        documentType = "poster", // poster, ticket, notice, flyer, menu, form
        title = "Read the Document",
        documentImage,
        documentUrl,
        instructions = "Read and answer the following questions",
        sections = [],
        questions = [],
        fuzzyMatching = true  // Use fuzzy matching for text answers
    } = block.content;
    const resolvedDocumentImage = documentImage || documentUrl;

    const [expandedSection, setExpandedSection] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [correctness, setCorrectness] = useState({}); // Track which answers are correct
    const [feedback, setFeedback] = useState({});
    const completion = useScreenCompletion();

    function handleAnswerChange(questionId, value) {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
        // Clear feedback for this question when user changes answer
        setFeedback(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
        setCorrectness(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    }

    /**
     * Validate a single answer based on question type
     * Returns { isCorrect: boolean, message: string }
     */
    function validateAnswer(question, userAnswer) {
        const qType = question.type?.toLowerCase() || "text";
        
        // MCQ/Multiple Choice
        if (qType === "mcq" || qType === "multiple_choice") {
            const correctIdx = question.correctAnswerIndex ?? question.correctAnswer;
            const correctOption = question.options?.[correctIdx];
            const isCorrect = userAnswer === correctOption;
            return {
                isCorrect,
                message: isCorrect ? "✓ Correct!" : "✗ Incorrect. Try again."
            };
        }
        
        // True/False
        if (qType === "true_false" || qType === "boolean") {
            const correct = question.correctAnswer;
            const userValue = userAnswer === "true" || userAnswer === true;
            const isCorrect = userValue === correct;
            return {
                isCorrect,
                message: isCorrect ? "✓ Correct!" : "✗ Incorrect. Try again."
            };
        }
        
        // Text Answer (default)
        const expected = question.expectedAnswer || question.correctAnswer || "";
        const isCorrect = fuzzyMatching
            ? fuzzyMatch(userAnswer, expected)
            : userAnswer.toLowerCase().trim() === expected.toLowerCase().trim();
        
        return {
            isCorrect,
            message: isCorrect 
                ? "✓ Correct!" 
                : `Expected: "${expected}" or similar`
        };
    }

    function handleSubmit() {
        const allAnswered = questions.every(q => answers[q.id]);
        if (!allAnswered) return;

        // Validate all answers
        const newCorrectness = {};
        const newFeedback = {};
        let allCorrect = true;

        questions.forEach(question => {
            const userAnswer = answers[question.id];
            const validation = validateAnswer(question, userAnswer);
            newCorrectness[question.id] = validation.isCorrect;
            newFeedback[question.id] = validation.message;
            if (!validation.isCorrect) allCorrect = false;
        });

        setCorrectness(newCorrectness);
        setFeedback(newFeedback);

        // Only mark submitted if all answers are correct (per spec requirement)
        if (allCorrect) {
            setSubmitted(true);
            
            // Prepare answer data with correctness info
            const answerData = {};
            questions.forEach(question => {
                answerData[question.id] = {
                    type: question.type || "text",
                    answer: answers[question.id],
                    correct: newCorrectness[question.id]
                };
            });

            completion?.saveAnswer?.(block.id, answerData);
            completion?.reportAnswered(block.id);
        }
    }

    const getDocumentTypeLabel = () => {
        const labels = {
            poster: "📰 Poster",
            ticket: "🎫 Ticket",
            notice: "📌 Notice Board",
            flyer: "📄 Flyer",
            menu: "🍽️ Menu",
            form: "📋 Form"
        };
        return labels[documentType] || "Document";
    };

    return (
        <BlockCard type="functional_reading">
            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="functional_reading"
                        title={title}
                        subtitle={getDocumentTypeLabel()}
                    />

                    {resolvedDocumentImage && (
                        <div className="functional-document-container">
                            <img
                                src={resolvedDocumentImage}
                                alt={title}
                                className="functional-document-image"
                            />
                        </div>
                    )}

                    {sections.length > 0 && (
                        <div className="functional-sections">
                            <h4 className="functional-subtitle">Document Sections</h4>
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="functional-section-item"
                                >
                                    <button
                                        className="functional-section-header"
                                        onClick={() =>
                                            setExpandedSection(
                                                expandedSection === idx ? null : idx
                                            )
                                        }
                                    >
                                        <span className="section-title">
                                            {section.title}
                                        </span>
                                        <span className="section-toggle">
                                            {expandedSection === idx ? "▼" : "▶"}
                                        </span>
                                    </button>
                                    {expandedSection === idx && (
                                        <div className="functional-section-content">
                                            <p>{section.content}</p>
                                            {section.details && (
                                                <ul className="section-details">
                                                    {section.details.map((detail, i) => (
                                                        <li key={i}>{detail}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="elab-block-content-side">
                    <div className="functional-questions-section">
                        <h4 className="functional-questions-title">
                            {instructions}
                        </h4>

                        {questions.map((question, idx) => (
                            <div
                                key={question.id || idx}
                                className="functional-question-item"
                                style={{
                                    borderLeft: correctness[question.id] === true 
                                        ? "4px solid #22c55e" 
                                        : correctness[question.id] === false
                                        ? "4px solid #ef4444"
                                        : "4px solid #e2e8f0",
                                    paddingLeft: "12px",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <label className="question-label">
                                    <span className="question-number">
                                        {idx + 1}.
                                    </span>
                                    <span className="question-text">
                                        {question.text || question.question}
                                    </span>
                                </label>

                                {(question.type === "multiple_choice" || question.type === "mcq") ? (
                                    <div className="question-options">
                                        {(question.options || []).map((option, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className="option-label"
                                                style={{
                                                    opacity: submitted ? 0.7 : 1,
                                                    backgroundColor: correctness[question.id] === true && answers[question.id] === option
                                                        ? "#dcfce7"
                                                        : correctness[question.id] === false && answers[question.id] === option
                                                        ? "#fee2e2"
                                                        : "transparent"
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={question.id || `q-${idx}`}
                                                    value={option}
                                                    checked={
                                                        answers[question.id || `q-${idx}`] ===
                                                        option
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            question.id || `q-${idx}`,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={submitted}
                                                />
                                                {typeof option === "object" ? (option.text || option.label) : option}
                                            </label>
                                        ))}
                                    </div>
                                ) : question.type === "true_false" || question.type === "boolean" ? (
                                    <div className="question-true-false">
                                        {[true, false].map((value) => (
                                            <label key={value} className="tf-label">
                                                <input
                                                    type="radio"
                                                    name={question.id || `q-${idx}`}
                                                    value={value}
                                                    checked={answers[question.id] === String(value) || answers[question.id] === value}
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            e.target.value === "true"
                                                        )
                                                    }
                                                    disabled={submitted}
                                                />
                                                <span style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    backgroundColor: answers[question.id] === value
                                                        ? correctness[question.id] === true && value === question.correctAnswer
                                                            ? "#dcfce7"
                                                            : correctness[question.id] === false
                                                            ? "#fee2e2"
                                                            : "#e0e7ff"
                                                        : "#f3f4f6",
                                                    cursor: submitted ? "not-allowed" : "pointer"
                                                }}>
                                                    {value ? "TRUE" : "FALSE"}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="question-input"
                                        placeholder="Enter your answer"
                                        value={answers[question.id] || ""}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        disabled={submitted}
                                        style={{
                                            borderColor: correctness[question.id] === true
                                                ? "#22c55e"
                                                : correctness[question.id] === false
                                                ? "#ef4444"
                                                : "#e5e7eb"
                                        }}
                                    />
                                )}

                                {/* Show feedback message */}
                                {feedback[question.id] && (
                                    <div style={{
                                        marginTop: "8px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: correctness[question.id] ? "#15803d" : "#dc2626"
                                    }}>
                                        {feedback[question.id]}
                                    </div>
                                )}
                            </div>
                        ))}

                        {!submitted ? (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    className="functional-submit-btn"
                                    disabled={
                                        !questions.every(q => answers[q.id])
                                    }
                                    style={{
                                        opacity: questions.every(q => answers[q.id]) ? 1 : 0.5,
                                        cursor: questions.every(q => answers[q.id]) ? "pointer" : "not-allowed"
                                    }}
                                >
                                    Check Answers
                                </button>
                                
                                {/* Show error message if user tried submitting with wrong answers */}
                                {Object.keys(feedback).length > 0 && !submitted && (
                                    <div style={{
                                        marginTop: "12px",
                                        padding: "12px",
                                        backgroundColor: "#fee2e2",
                                        border: "1px solid #fca5a5",
                                        borderRadius: "6px",
                                        color: "#991b1b",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>
                                        ❌ Some answers are incorrect. Please review and try again.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="elab-submission-success" style={{
                                backgroundColor: "#dcfce7",
                                border: "2px solid #22c55e",
                                borderRadius: "8px",
                                padding: "16px",
                                textAlign: "center"
                            }}>
                                <div className="elab-success-icon" style={{ fontSize: "32px", marginBottom: "8px" }}>
                                    🎉
                                </div>
                                <p style={{ color: "#15803d", fontWeight: "600", margin: 0 }}>
                                    All answers correct! Excellent work!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default FunctionalReadingBlock;
