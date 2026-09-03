import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeSentenceFixerUrl from "../../../../assets/images/badge_sentence_fixer.png";
import boyWritingUrl from "../../../../assets/images/grammar_boy_writing.png";

function GrammarCorrectionBlock({ block }) {
    const completion = useScreenCompletion();

    // Support both:
    //   content.pairs = [{ incorrectSentence, correctedSentence }, ...]  ← multi-item (JSON format)
    //   content.incorrectSentence / content.correctedSentence             ← legacy single item
    const rawPairs = block.content?.pairs;
    const pairs =
        rawPairs && rawPairs.length > 0
            ? rawPairs
            : [
                  {
                      incorrectSentence: block.content?.incorrectSentence || "",
                      correctedSentence: block.content?.correctedSentence || "",
                  },
              ];

    const [answers, setAnswers] = useState(() =>
        pairs.map(() => ({ value: "", submitted: false, correct: null }))
    );

    function handleChange(index, value) {
        setAnswers((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], value };
            return next;
        });
    }

    function handleCheck(index) {
        const pair = pairs[index];
        const userAnswer = answers[index].value.trim().toLowerCase();
        const correct =
            pair.correctedSentence &&
            userAnswer === pair.correctedSentence.trim().toLowerCase();

        setAnswers((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], submitted: true, correct };
            return next;
        });

        // Check if all pairs are now answered (any submission counts)
        const allSubmitted = answers.every((a, i) =>
            i === index ? true : a.submitted
        );
        if (allSubmitted) {
            completion?.reportAnswered(block.id);
        }
    }

    return (
        <BlockCard type="grammar_correction" className="elab-sentence-fixer-card">
            <div className="elab-grammar-card-content">
                <div className="grammar-header" style={{ marginBottom: "8px" }}>
                    <div className="grammar-title-banner writing">SENTENCE FIXER</div>
                </div>

                {/* All pairs */}
                {pairs.map((pair, index) => {
                    const state = answers[index];
                    return (
                        <div
                            key={index}
                            style={{
                                background: "#fffbeb",
                                border: "1.5px solid #fde68a",
                                borderRadius: "12px",
                                padding: "12px 14px",
                                marginBottom: "12px",
                            }}
                        >
                            {/* Incorrect sentence shown in a red-tinted box */}
                            <div
                                className="elab-incorrect-sentence-box"
                                style={{
                                    background: "#fee2e2",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    fontSize: "0.88rem",
                                    color: "#991b1b",
                                    fontWeight: 600,
                                    marginBottom: "8px",
                                }}
                            >
                                ❌ {pair.incorrectSentence || <em style={{ opacity: 0.5 }}>No sentence provided</em>}
                            </div>

                            {/* Answer input */}
                            <div className="elab-grammar-input-container" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span className="elab-grammar-input-icon">✏️</span>
                                <input
                                    className="elab-grammar-input-field"
                                    value={state.value}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    placeholder="Type the corrected sentence..."
                                    disabled={state.submitted && state.correct}
                                    style={{ flex: 1 }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && state.value.trim()) {
                                            handleCheck(index);
                                        }
                                    }}
                                />
                                {!state.submitted && (
                                    <button
                                        onClick={() => handleCheck(index)}
                                        disabled={!state.value.trim()}
                                        style={{
                                            background: "#7c3aed",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            cursor: state.value.trim() ? "pointer" : "not-allowed",
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            opacity: state.value.trim() ? 1 : 0.5,
                                        }}
                                    >
                                        Check
                                    </button>
                                )}
                            </div>

                            {/* Feedback */}
                            {state.submitted && !window.__isAssessment && (
                                <div
                                    style={{
                                        marginTop: "8px",
                                        padding: "6px 10px",
                                        borderRadius: "8px",
                                        fontSize: "0.82rem",
                                        fontWeight: 600,
                                        background: state.correct ? "#dcfce7" : "#fee2e2",
                                        color: state.correct ? "#15803d" : "#b91c1c",
                                    }}
                                >
                                    {state.correct
                                        ? "✅ Correct!"
                                        : `❌ Not quite. Correct: "${pair.correctedSentence}"`}
                                </div>
                            )}
                            {state.submitted && window.__isAssessment && (
                                <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#64748b" }}>
                                    ✔ Submitted
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right side Illustration */}
            <div className="elab-grammar-illustration">
                <img src={boyWritingUrl} className="elab-boy-writing-img" alt="Boy Writing" />
            </div>
        </BlockCard>
    );
}

export default GrammarCorrectionBlock;
