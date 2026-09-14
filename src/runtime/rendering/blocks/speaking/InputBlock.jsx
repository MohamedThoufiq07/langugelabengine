import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import shortAnswerBadge from "../../../../assets/images/speaking_short_answer_badge.png";
import girlWritingImg from "/short answer right side girl image.png";

function InputBlock({ block }) {

    const { question, placeholder } = block.content;

    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const completion = useScreenCompletion();

    function handleChange(e) {
        setAnswer(e.target.value);
        if (submitted) {
            setSubmitted(false);
        }
    }

    function handleSubmit() {
        if (answer.trim().length === 0) return;
        setSubmitted(true);
        completion?.reportAnswered(block.id);
    }

    return (
        <BlockCard type="input">
            <div className="speaking-custom-card-content">
                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle input">
                            <img src={shortAnswerBadge} className="speaking-badge-img" alt="Short Answer" />
                        </div>
                        <div className="speaking-badge-tag input">
                            SHORT ANSWER
                        </div>
                    </div>

                    {question && (
                        <p className="elab-block-subtitle" style={{ margin: "0.25rem 0", color: "#475569", fontWeight: 600 }}>
                            {question}
                        </p>
                    )}

                    <textarea
                        className="speaking-custom-textarea"
                        value={answer}
                        onChange={handleChange}
                        placeholder={placeholder || "Type your answer here..."}
                        rows={2}
                        disabled={submitted}
                    />

                    <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={answer.trim().length === 0 || submitted}
                            style={{
                                background: submitted ? "#94a3b8" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.75rem",
                                padding: "0.55rem 1.4rem",
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                cursor: (answer.trim().length === 0 || submitted) ? "not-allowed" : "pointer",
                                boxShadow: submitted ? "none" : "0 4px 12px rgba(37, 99, 235, 0.25)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {submitted ? "Submitted ✓" : "Submit"}
                        </button>

                        {submitted && (
                            <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                ✅ Answer submitted successfully!
                            </span>
                        )}
                    </div>
                </div>

                <div className="speaking-custom-illustration">
                    <img 
                        src={girlWritingImg} 
                        alt="Short Answer Illustration" 
                    />
                </div>
            </div>
        </BlockCard>
    );

}

export default InputBlock;

