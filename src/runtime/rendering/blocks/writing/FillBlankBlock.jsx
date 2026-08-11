import { useState, useMemo } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgePencil from "../../../samples/assets/images/grammar_badge_pencil.png";
import grammarGirlReading from "../../../samples/assets/images/grammar_girl_reading_new.png";

function FillBlankBlock({ block }) {
    const { sentence, text, question } = block.content;
    const completion = useScreenCompletion();

    const rawSentence = sentence || text || block.content.items?.[0]?.text || "";

    // Parse sentence like "The quick brown [fox] jumps over the lazy [dog]."
    // into parts: ["The quick brown ", { expected: "fox" }, " jumps over the lazy ", { expected: "dog" }, "."]
    const parts = useMemo(() => {
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
    }, [rawSentence]);

    const [answers, setAnswers] = useState({});

    function handleInlineChange(blankIndex, value) {
        const newAnswers = { ...answers, [blankIndex]: value };
        setAnswers(newAnswers);

        // Check if all blanks have some text entered to report answered
        const blanksCount = parts.filter(p => p.type === "blank").length;
        const enteredCount = Object.values(newAnswers).filter(val => val.trim().length > 0).length;
        if (enteredCount === blanksCount) {
            completion?.reportAnswered(block.id);
        }
    }

    const isAssessment = window.__isAssessment;

    return (
        <BlockCard type="fill_blank">
            <div className="grammar-custom-card-content reverse">
                <div className="grammar-custom-illustration">
                    <img src={grammarGirlReading} alt="Fill in the Blank Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    <div className="grammar-header">
                        <img src={grammarBadgePencil} className="grammar-badge" alt="Pencil Badge" />
                        <div className="grammar-title-banner fill-blank">FILL IN THE BLANK</div>
                    </div>

                    <h4 className="grammar-subtitle">
                        {question || "Complete the sentence by filling in the blanks."}
                    </h4>

                    {rawSentence && (
                        <div 
                            className="elab-inline-fill-sentence" 
                            style={{ 
                                fontSize: "19px", 
                                lineHeight: "2.2", 
                                color: "#334155", 
                                display: "flex", 
                                flexWrap: "wrap", 
                                alignItems: "center", 
                                gap: "8px",
                                marginTop: "1rem",
                                padding: "16px 20px",
                                background: "#fafafa",
                                borderRadius: "12px",
                                border: "1px solid #f0f0f0"
                            }}
                        >
                            {parts.map((part, i) => {
                                if (part.type === "text") {
                                    return <span key={i} style={{ fontWeight: 500 }}>{part.content}</span>;
                                } else {
                                    return (
                                        <input
                                            key={i}
                                            type="text"
                                            value={answers[part.index] || ""}
                                            onChange={(e) => handleInlineChange(part.index, e.target.value)}
                                            placeholder=""
                                            style={{
                                                border: "none",
                                                borderBottom: "2px solid #0f766e",
                                                background: "#f0fdf4",
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
                                                e.target.style.background = "#e6f9f5";
                                                e.target.style.borderBottomColor = "#0d9488";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.background = "#f0fdf4";
                                                e.target.style.borderBottomColor = "#0f766e";
                                            }}
                                        />
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        </BlockCard>
    );
}

export default FillBlankBlock;
