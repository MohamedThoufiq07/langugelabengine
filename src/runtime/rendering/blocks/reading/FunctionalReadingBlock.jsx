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

function DocumentView({ documentType, resolvedDocumentImage, title, blockContent }) {
    const {
        documentText = blockContent?.text || blockContent?.content || "",
        documentHtml = blockContent?.html || "",
        emailData = blockContent?.email || {},
        receiptData = blockContent?.receipt || {},
        scheduleData = blockContent?.schedule || [],
        menuData = blockContent?.menu || [],
        noticeData = blockContent?.notice || {}
    } = blockContent || {};

    const type = (documentType || "poster").toLowerCase();

    // If image exists, render image as primary document view
    if (resolvedDocumentImage) {
        return (
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
        );
    }

    // Stylized document layout views when image is not present
    if (type === "email") {
        return (
            <div style={{ borderRadius: "1rem", border: "2px solid #cbd5e1", backgroundColor: "#ffffff", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ backgroundColor: "#f1f5f9", padding: "0.85rem 1.25rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#334155" }}>
                    <div><strong>From:</strong> {emailData.from || "sender@example.com"}</div>
                    <div><strong>To:</strong> {emailData.to || "student@example.com"}</div>
                    <div><strong>Subject:</strong> {emailData.subject || title}</div>
                </div>
                <div style={{ padding: "1.25rem", fontSize: "0.95rem", lineHeight: "1.6", color: "#1e293b", whiteSpace: "pre-line" }}>
                    {emailData.body || documentText || "No email body text available."}
                </div>
            </div>
        );
    }

    if (type === "receipt") {
        return (
            <div style={{ maxWidth: "360px", margin: "0 auto", borderRadius: "0.75rem", border: "2px dashed #94a3b8", backgroundColor: "#fffbeb", padding: "1.25rem", fontFamily: "monospace", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem" }}>
                    🧾 {receiptData.storeName || title || "RECEIPT"}
                </div>
                {Array.isArray(receiptData.items) ? (
                    receiptData.items.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", margin: "0.35rem 0" }}>
                            <span>{it.name || it.item}</span>
                            <span>{it.price}</span>
                        </div>
                    ))
                ) : (
                    <div style={{ whiteSpace: "pre-line", fontSize: "0.9rem" }}>{documentText || "Item 1: $5.00\nTotal: $5.00"}</div>
                )}
                {receiptData.total && (
                    <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "0.5rem", marginTop: "0.5rem", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                        <span>TOTAL:</span>
                        <span>{receiptData.total}</span>
                    </div>
                )}
            </div>
        );
    }

    if (type === "schedule") {
        return (
            <div style={{ borderRadius: "1rem", border: "2px solid #cbd5e1", overflow: "hidden", backgroundColor: "#ffffff" }}>
                <div style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "0.75rem 1.25rem", fontWeight: 800, fontSize: "1rem" }}>
                    📅 {title || "Schedule Overview"}
                </div>
                {Array.isArray(scheduleData) && scheduleData.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                                <th style={{ padding: "0.6rem 1rem", textAlign: "left" }}>Time</th>
                                <th style={{ padding: "0.6rem 1rem", textAlign: "left" }}>Activity / Event</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleData.map((s, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "0.6rem 1rem", fontWeight: 700, color: "#2563eb" }}>{s.time}</td>
                                    <td style={{ padding: "0.6rem 1rem", color: "#334155" }}>{s.activity || s.event}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: "1.25rem", whiteSpace: "pre-line", fontSize: "0.95rem" }}>{documentText}</div>
                )}
            </div>
        );
    }

    if (type === "menu") {
        return (
            <div style={{ borderRadius: "1rem", border: "2px solid #f59e0b", backgroundColor: "#fffdf5", padding: "1.25rem" }}>
                <div style={{ textAlign: "center", color: "#b45309", fontWeight: 800, fontSize: "1.2rem", marginBottom: "1rem", borderBottom: "2px solid #fde68a", paddingBottom: "0.5rem" }}>
                    🍽️ {title || "Menu"}
                </div>
                <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", lineHeight: "1.6", color: "#451a03" }}>
                    {documentText || "No menu text provided."}
                </div>
            </div>
        );
    }

    if (type === "notice") {
        return (
            <div style={{ borderRadius: "1rem", border: "2px solid #ef4444", backgroundColor: "#fef2f2", padding: "1.25rem", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)" }}>
                <div style={{ color: "#991b1b", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    📢 NOTICE: {title}
                </div>
                <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", color: "#7f1d1d", lineHeight: "1.6" }}>
                    {documentText || "Please pay attention to the notice information."}
                </div>
            </div>
        );
    }

    // Default Poster / Text Card view
    return (
        <div style={{ borderRadius: "1rem", border: "2px solid #cbd5e1", backgroundColor: "#f8fafc", padding: "1.25rem" }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b", marginBottom: "0.5rem" }}>
                📄 {title}
            </div>
            <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", lineHeight: "1.6", color: "#334155" }}>
                {documentText || "Read the passage details carefully to answer the questions."}
            </div>
        </div>
    );
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
            form: "Form",
            receipt: "Receipt",
            email: "Email",
            schedule: "Schedule",
            text: "Document Text"
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

                {/* Main Document View Box */}
                <DocumentView
                    documentType={documentType}
                    resolvedDocumentImage={resolvedDocumentImage}
                    title={title}
                    blockContent={block.content}
                />

                {/* Questions Section */}
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
