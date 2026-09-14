import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import readingGirlUrl from "../../../../assets/images/reading_girl.png";
import readingThoughtUrl from "../../../../assets/images/reading_thought.png";
import readingBooksUrl from "../../../../assets/images/reading_books.png";

function ReadingBlock({ block }) {
    const content = block?.content || {};
    const passagesList = Array.isArray(content.passages) ? content.passages : [];
    const activePassage = passagesList[0] || {};

    const rawPassage = content.passage || activePassage.passage || activePassage.content || "";
    const question = content.question || activePassage.question || activePassage.followUpQuestion || "";

    const styles = block?.styles || {};
    const fontFamily = styles.fontFamily || "inherit";
    const fontSize = styles.fontSize || "1.05rem";
    const textColor = styles.color || styles.textColor || "#334155";

    const [passageText, setPassageText] = useState(rawPassage);
    const [confirmed, setConfirmed] = useState(false);
    const completion = useScreenCompletion();

    useEffect(() => {
        setPassageText(rawPassage);
    }, [rawPassage]);

    function handleConfirm() {
        setConfirmed(true);
        completion?.reportAnswered(block.id);
    }

    return (
        <BlockCard type="reading_passage">
            <div className="elab-block-two-column reading-custom" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                <div className="elab-block-interactive-side">
                    {/* Standard Season Theme Header */}
                    <BlockHeader
                        type="reading_passage"
                        title="READING PASSAGE"
                        subtitle={question ? `Question: ${question}` : "Read the passage carefully"}
                    />

                    {/* Passage Box */}
                    <div className="elab-reading-passage-box" style={{ padding: "16px", borderRadius: "12px", background: "#ffffff", border: "1.5px solid #cbd5e1", marginTop: "12px" }}>
                        <div
                            style={{
                                fontFamily: fontFamily,
                                fontSize: fontSize,
                                color: textColor,
                                lineHeight: 1.7,
                                whiteSpace: "pre-wrap",
                                minHeight: "70px"
                            }}
                        >
                            {passageText || "(No passage content provided)"}
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        className={`elab-reading-confirm-btn ${confirmed ? "is-confirmed" : ""}`}
                        disabled={confirmed}
                        onClick={handleConfirm}
                        style={{ marginTop: "16px", marginBottom: "28px" }}
                    >
                        <div className="elab-reading-confirm-left">
                            <span className="elab-reading-check-circle">✔</span>
                            <span className="elab-reading-btn-text">
                                {confirmed ? "Marked as read" : "I've finished reading"}
                            </span>
                        </div>
                        <span className="elab-reading-book-icon">📖</span>
                    </button>
                </div>

                {/* Right Side Illustration */}
                <div className="elab-reading-illustration-container">
                    <img src={readingThoughtUrl} className="elab-reading-thought" alt="Thought" />
                    <img src={readingGirlUrl} className="elab-reading-girl" alt="Reading Girl" />
                    <img src={readingBooksUrl} className="elab-reading-books" alt="Books" />
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default ReadingBlock;
