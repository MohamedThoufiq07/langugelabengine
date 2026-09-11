import { useState, useMemo, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgePencil from "../../../../assets/images/grammar_badge_pencil.png";
import grammarGirlReading from "../../../../assets/images/grammar_girl_reading_new.png";

// Fuzzy string matching for fill-in-the-blank answers
function fuzzyMatch(userInput, expectedAnswer, tolerance = 0.85) {
    const clean = (str) => str.toLowerCase().trim().replace(/\s+/g, " ");
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

function FillBlankBlock({ block }) {
    const { sentence, text, question } = block.content;
    const completion = useScreenCompletion();
    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const items = block.content.items || [];

    // Helper function to parse sentences like "The quick brown [fox] jumps over the lazy [dog]."
    function parseSentence(rawSentence) {
        const result = [];
        let lastIndex = 0;
        const regex = /\[([^\]]+)\]/g;
        let match;
        let index = 0;
        while ((match = regex.exec(rawSentence)) !== null) {
            if (match.index > lastIndex) {
                result.push({ type: "text", content: rawSentence.substring(lastIndex, match.index) });
            }
            result.push({ type: "blank", expected: match[1], index: index++ });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < rawSentence.length) {
            result.push({ type: "text", content: rawSentence.substring(lastIndex) });
        }
        return result;
    }

    const [answers, setAnswers] = useState(savedAnswer || {});
    const [correctness, setCorrectness] = useState({});
    const [feedback, setFeedback] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let totalBlanks = 0;
        items.forEach(item => {
            const parsed = parseSentence(item.text);
            totalBlanks += parsed.filter(p => p.type === "blank").length;
        });

        if (totalBlanks === 0) {
            completion?.reportAnswered(block.id);
            return;
        }

        const enteredCount = Object.values(answers).filter(val => typeof val === "string" && val.trim().length > 0).length;
        if (enteredCount >= totalBlanks) {
            completion?.reportAnswered(block.id);
        }
    }, [answers, items]);

    function handleInlineChange(sentenceId, blankIndex, value) {
        const key = `${sentenceId}-${blankIndex}`;
        const newAnswers = { ...answers, [key]: value };
        setAnswers(newAnswers);
        completion?.saveAnswer?.(block.id, newAnswers);
        
        // Clear feedback for this blank when user changes it
        setCorrectness(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setFeedback(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    function handleCheckAnswers() {
        let totalBlanks = 0;
        let correctCount = 0;
        const newCorrectness = {};
        const newFeedback = {};

        items.forEach((item) => {
            const parsed = parseSentence(item.text);
            parsed.forEach(part => {
                if (part.type === "blank") {
                    const key = `${item.id}-${part.index}`;
                    const userAnswer = answers[key] || "";
                    const isCorrect = fuzzyMatch(userAnswer, part.expected);
                    
                    newCorrectness[key] = isCorrect;
                    newFeedback[key] = isCorrect ? "✓" : "✗";
                    
                    if (isCorrect) correctCount++;
                    totalBlanks++;
                }
            });
        });

        setCorrectness(newCorrectness);
        setFeedback(newFeedback);

        // Only mark submitted if all blanks are correct
        if (correctCount === totalBlanks && totalBlanks > 0) {
            setSubmitted(true);
            completion?.saveAnswer?.(block.id, { ...answers, correct: true, totalCorrect: correctCount, total: totalBlanks });
            completion?.reportAnswered(block.id);
        }
    }

    return (
        <BlockCard type="fill_blank">
            <div className="grammar-custom-card-content reverse">
                <div className="grammar-custom-illustration">
                    <img src={grammarGirlReading} alt="Fill in the Blank Illustration" />
                </div>

                <div className="grammar-custom-interactive" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "12px", paddingTop: "12px" }}>
                    <div className="grammar-header" style={{ marginBottom: "8px" }}>
                        <div className="elab-block-title" style={{ display: "inline-flex", background: "var(--theme-heading-board, url('/purple board.png')) no-repeat", backgroundSize: "100% 100%", width: "fit-content", padding: "10px 32px", color: "#ffffff", height: "52px", alignItems: "center", justifyContent: "center" }}>
                            FILL IN THE BLANK
                        </div>
                    </div>

                    <h4 className="grammar-subtitle">
                        {question || "Complete the sentence by filling in the blanks."}
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                        {items.map((item, idx) => {
                            const parsedParts = parseSentence(item.text);
                            return (
                                <div 
                                    key={item.id}
                                    className="elab-inline-fill-sentence" 
                                    style={{ 
                                        fontSize: "19px", 
                                        lineHeight: "2.2", 
                                        color: "#334155", 
                                        display: "flex", 
                                        flexWrap: "wrap", 
                                        alignItems: "center", 
                                        gap: "8px",
                                        padding: "8px 0px",
                                        background: "transparent",
                                        border: "none"
                                    }}
                                >
                                    <span style={{ fontWeight: "bold", marginRight: "8px", color: "#4f46e5" }}>{idx + 1}.</span>
                                    {parsedParts.map((part, i) => {
                                        if (part.type === "text") {
                                            return <span key={i} style={{ fontWeight: 500 }}>{part.content}</span>;
                                        } else {
                                            const key = `${item.id}-${part.index}`;
                                            const isCorrect = correctness[key];
                                            return (
                                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                    <input
                                                        type="text"
                                                        value={answers[key] || ""}
                                                        onChange={(e) => handleInlineChange(item.id, part.index, e.target.value)}
                                                        placeholder=""
                                                        style={{
                                                            border: "none",
                                                            borderBottom: isCorrect === true ? "3px solid #22c55e" : isCorrect === false ? "3px solid #ef4444" : "2px solid #0f766e",
                                                            background: isCorrect === true ? "rgba(34, 197, 94, 0.1)" : isCorrect === false ? "rgba(239, 68, 68, 0.1)" : "transparent",
                                                            textAlign: "center",
                                                            width: `${Math.max(part.expected.length * 14 + 10, 80)}px`,
                                                            fontSize: "17px",
                                                            fontWeight: "bold",
                                                            color: isCorrect === true ? "#15803d" : isCorrect === false ? "#dc2626" : "#0f766e",
                                                            padding: "4px 8px",
                                                            outline: "none",
                                                            borderRadius: "4px",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.background = "rgba(15, 118, 110, 0.08)";
                                                            e.target.style.borderBottomColor = "#0d9488";
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.background = isCorrect === true ? "rgba(34, 197, 94, 0.1)" : isCorrect === false ? "rgba(239, 68, 68, 0.1)" : "transparent";
                                                            e.target.style.borderBottomColor = isCorrect === true ? "#22c55e" : isCorrect === false ? "#ef4444" : "#0f766e";
                                                        }}
                                                        disabled={submitted}
                                                    />
                                                    {feedback[key] && (
                                                        <span style={{ fontSize: "12px", fontWeight: "700", color: feedback[key] === "✓" ? "#15803d" : "#dc2626" }}>
                                                            {feedback[key]}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Check Answers Button */}
                    {!submitted && (
                        <button
                            onClick={handleCheckAnswers}
                            style={{
                                marginTop: "16px",
                                padding: "10px 24px",
                                backgroundColor: "#4f46e5",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#4338ca"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#4f46e5"}
                        >
                            Check Answers
                        </button>
                    )}

                    {/* Success Message */}
                    {submitted && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px 16px",
                            backgroundColor: "#dcfce7",
                            border: "2px solid #22c55e",
                            borderRadius: "6px",
                            color: "#15803d",
                            fontWeight: "600",
                            textAlign: "center"
                        }}>
                            🎉 All answers are correct!
                        </div>
                    )}
                </div>
            </div>
        </BlockCard>
    );
}

export default FillBlankBlock;
