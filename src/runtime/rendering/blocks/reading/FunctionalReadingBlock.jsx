import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import { resolveMediaUrl } from "../../services/MediaResolver";

// Fuzzy string matching for text answers (case-insensitive, whitespace-tolerant)
function fuzzyMatch(userInput, expectedAnswer, tolerance = 0.8) {
    if (!userInput || !expectedAnswer) return false;
    const clean = (str) => String(str).toLowerCase().trim().replace(/\s+/g, " ");
    const user = clean(userInput);
    const expected = clean(expectedAnswer);
    
    if (user === expected) return true;
    
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
        documentType = "poster",
        title = "Read The Document",
        documentImage,
        documentUrl,
        image,
        imageUrl,
        scenario,
        instructions = scenario || "Read the document and answer the questions",
        questions = [],
        fuzzyMatching = true
    } = block.content;

    const rawDocImage = documentImage || documentUrl || image || imageUrl;
    const resolvedDocumentImage = resolveMediaUrl(rawDocImage);

    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [correctness, setCorrectness] = useState({});
    const [feedback, setFeedback] = useState({});
    const completion = useScreenCompletion();

    function handleAnswerChange(questionId, value) {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
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

    function validateAnswer(question, userAnswer) {
        const expected = question.targetAnswer || question.expectedAnswer || question.correctAnswer || question.target || "";
        const isCorrect = fuzzyMatching
            ? fuzzyMatch(userAnswer, expected)
            : String(userAnswer || "").toLowerCase().trim() === String(expected || "").toLowerCase().trim();
        
        return {
            isCorrect,
            message: isCorrect 
                ? "✓ Correct!" 
                : (expected ? `Expected: "${expected}" or similar` : "✓ Submitted")
        };
    }

    function handleSubmit() {
        const allAnswered = questions.every(q => answers[q.id || `q-${questions.indexOf(q)}`] && String(answers[q.id || `q-${questions.indexOf(q)}`]).trim().length > 0);
        if (!allAnswered) return;

        const isAssessment = window.__isAssessment;
        const newCorrectness = {};
        const newFeedback = {};
        let allCorrect = true;

        questions.forEach((question, idx) => {
            const qId = question.id || `q-${idx}`;
            const userAnswer = answers[qId];
            const validation = validateAnswer(question, userAnswer);
            newCorrectness[qId] = validation.isCorrect;
            newFeedback[qId] = isAssessment ? "" : validation.message;
            if (!validation.isCorrect) allCorrect = false;
        });

        if (!isAssessment) {
            setCorrectness(newCorrectness);
            setFeedback(newFeedback);
        }

        if (allCorrect || isAssessment) {
            setSubmitted(true);
            const answerData = {};
            questions.forEach((question, idx) => {
                const qId = question.id || `q-${idx}`;
                answerData[qId] = {
                    type: "text",
                    answer: answers[qId],
                    correct: newCorrectness[qId]
                };
            });
            completion?.saveAnswer?.(block.id, answerData);
            completion?.reportAnswered(block.id);
        }
    }

    const getDocumentTypeLabel = () => {
        const labels = {
            poster: "Poster",
            ticket: "Ticket",
            notice: "Notice Board",
            flyer: "Flyer",
            menu: "Menu",
            form: "Form"
        };
        const docLabel = labels[documentType.toLowerCase()] || documentType;
        return docLabel.charAt(0).toUpperCase() + docLabel.slice(1);
    };

    return (
        <BlockCard type="functional_reading">
            <div className="elab-functional-reading-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem", marginBottom: "2rem" }}>
                <BlockHeader
                    type="functional_reading"
                    title={title}
                    subtitle={getDocumentTypeLabel()}
                />

                {/* Main Document Image Box */}
                {resolvedDocumentImage && (
                    <div style={{
                        width: "100%",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        border: "2px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                        padding: "0.5rem"
                    }}>
                        <img
                            src={resolvedDocumentImage}
                            alt={title}
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                maxHeight: "360px",
                                objectFit: "contain",
                                borderRadius: "0.75rem",
                                margin: "0 auto"
                            }}
                        />
                    </div>
                )}

                {/* Questions Section - ALWAYS text input box ("Write answer here...") matching CMS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "1rem", border: "1.5px solid #e2e8f0" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                        {instructions}
                    </div>

                    {questions.map((question, idx) => {
                        const qId = question.id || `q-${idx}`;

                        return (
                            <div key={qId} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#334155", fontFamily: "'Poppins', sans-serif" }}>
                                    {idx + 1}. {question.question || question.text || question.prompt}
                                </div>

                                {/* Text Input Field ("Write answer here...") matching CMS exactly */}
                                <input
                                    type="text"
                                    placeholder="Write answer here..."
                                    value={answers[qId] || ""}
                                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                    disabled={submitted}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "0.75rem",
                                        border: correctness[qId] === true ? "2px solid #22c55e" : (correctness[qId] === false ? "2px solid #ef4444" : "1.5px solid #cbd5e1"),
                                        backgroundColor: "#ffffff",
                                        fontSize: "0.95rem",
                                        color: "#1e293b",
                                        outline: "none",
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                />

                                {feedback[qId] && (
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: correctness[qId] ? "#16a34a" : "#dc2626" }}>
                                        {feedback[qId]}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Submit / Check answers button */}
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!questions.every(q => answers[q.id || `q-${questions.indexOf(q)}`] && String(answers[q.id || `q-${questions.indexOf(q)}`]).trim().length > 0)}
                            style={{
                                marginTop: "0.5rem",
                                alignSelf: "flex-start",
                                padding: "0.6rem 1.5rem",
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "#ffffff",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                                opacity: questions.every(q => answers[q.id || `q-${questions.indexOf(q)}`] && String(answers[q.id || `q-${questions.indexOf(q)}`]).trim().length > 0) ? 1 : 0.5
                            }}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <div style={{ color: window.__isAssessment ? "#2563eb" : "#16a34a", fontWeight: 800, fontSize: "1rem" }}>
                            {window.__isAssessment ? "🎉 Your answer has been submitted!" : "🎉 Great job! Correct!"}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default FunctionalReadingBlock;
