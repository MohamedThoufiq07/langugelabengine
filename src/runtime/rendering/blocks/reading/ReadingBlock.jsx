import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import badgeReadingUrl from "../../../../assets/images/badge_reading.png";
import readingGirlUrl from "../../../../assets/images/reading_girl.png";
import readingBalloonUrl from "../../../../assets/images/reading_balloon.png";
import readingThoughtUrl from "../../../../assets/images/reading_thought.png";
import readingBooksUrl from "../../../../assets/images/reading_books.png";

function ReadingBlock({ block }) {
    const { title, passage, question } = block.content;
    const [passageText, setPassageText] = useState(passage || "");
    const [confirmed, setConfirmed] = useState(false);
    const completion = useScreenCompletion();

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
                            <h3 className="elab-custom-title">{title || "THE FOX AND LIONS"}</h3>
                            <div className="elab-subtitle-row">
                                <span className="elab-custom-subtitle">{question || "Read the passage carefully"}</span>
                                <span className="elab-header-stars">✨</span>
                                <img src={readingBalloonUrl} className="elab-header-balloon" alt="Balloon" />
                            </div>
                        </div>
                    </div>

                    {/* Passage Box */}
                    <div className="elab-reading-passage-box">
                        <textarea
                            className="elab-reading-passage-text-input"
                            value={passageText}
                            onChange={(e) => setPassageText(e.target.value)}
                            placeholder="Type or edit the passage here..."
                        />
                    </div>

                    {/* Button */}
                    <button
                        className={`elab-reading-confirm-btn ${confirmed ? "is-confirmed" : ""}`}
                        disabled={confirmed}
                        onClick={handleConfirm}
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
