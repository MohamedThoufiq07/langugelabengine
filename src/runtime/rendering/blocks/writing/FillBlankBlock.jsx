import { useState, useMemo, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgePencil from "../../../../assets/images/grammar_badge_pencil.png";
import grammarGirlReading from "../../../../assets/images/grammar_girl_reading_new.png";

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

    function handleInlineChange(sentenceId, blankIndex, value) {
        const key = `${sentenceId}-${blankIndex}`;
        const newAnswers = { ...answers, [key]: value };
        setAnswers(newAnswers);
        completion?.saveAnswer?.(block.id, newAnswers);

        // Check if all blanks have some text entered to report answered
        let totalBlanks = 0;
        items.forEach(item => {
            const parsed = parseSentence(item.text);
            totalBlanks += parsed.filter(p => p.type === "blank").length;
        });

        const enteredCount = Object.values(newAnswers).filter(val => val.trim().length > 0).length;
        if (enteredCount === totalBlanks) {
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
                        <div className="elab-block-title" style={{ display: "inline-flex", background: "url('/purple board.png') no-repeat", backgroundSize: "100% 100%", padding: "10px 32px", color: "#ffffff", height: "52px", alignItems: "center", justifyContent: "center" }}>
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
                                            return (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    value={answers[key] || ""}
                                                    onChange={(e) => handleInlineChange(item.id, part.index, e.target.value)}
                                                    placeholder=""
                                                    style={{
                                                        border: "none",
                                                        borderBottom: "2px solid #0f766e",
                                                        background: "transparent",
                                                        textAlign: "center",
                                                        width: `${Math.max(part.expected.length * 14 + 10, 80)}px`,
                                                        fontSize: "17px",
                                                        fontWeight: "bold",
                                                        color: "#0f766e",
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
                                                        e.target.style.background = "transparent";
                                                        e.target.style.borderBottomColor = "#0f766e";
                                                    }}
                                                />
                                            );
                                        }
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default FillBlankBlock;
