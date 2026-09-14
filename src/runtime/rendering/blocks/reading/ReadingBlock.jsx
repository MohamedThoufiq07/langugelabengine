import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import badgeReadingUrl from "../../../../assets/images/badge_reading.png";
import readingGirlUrl from "../../../../assets/images/reading_girl.png";
import readingBalloonUrl from "../../../../assets/images/reading_balloon.png";
import readingThoughtUrl from "../../../../assets/images/reading_thought.png";
import readingBooksUrl from "../../../../assets/images/reading_books.png";

function ReadingBlock({ block }) {
    const content = block?.content || {};
    const passagesList = Array.isArray(content.passages) ? content.passages : [];
    const activePassage = passagesList[0] || {};

    const title = content.title || activePassage.title || activePassage.passageTitle || "";
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
            <div className="elab-block-two-column reading-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <img src={badgeReadingUrl} className="elab-header-badge-img" alt="Badge" />
                        <div className="elab-header-content">
                            <h3 className="elab-custom-title" style={{ fontFamily }}>
                                {title ? title : "READING PASSAGE"}
                            </h3>
                            <div className="elab-subtitle-row">
                                <span className="elab-custom-subtitle">
                                    {question ? `Question: ${question}` : "Read the passage carefully"}
                                </span>
                                <span className="elab-header-stars">✨</span>
                                <img src={readingBalloonUrl} className="elab-header-balloon" alt="Balloon" />
                            </div>
                        </div>
                    </div>

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
                        style={{ marginTop: "16px" }}
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
        </BlockCard>
    );
}

export default ReadingBlock;
