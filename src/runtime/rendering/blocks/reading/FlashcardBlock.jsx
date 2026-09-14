import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { resolveMediaUrl } from "../../services/MediaResolver";

function FlashcardBlock({ block }) {
    const { 
        cards = [], 
        title = "Flashcards",
        instruction = "Tap the card to flip it"
    } = block.content;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!cards.length) {
        return (
            <BlockCard type="flashcard">
                <BlockHeader
                    type="flashcard"
                    title={title}
                    subtitle={instruction}
                />
                <p className="elab-plain-text">No flashcards available.</p>
            </BlockCard>
        );
    }

    const currentCard = cards[currentIndex];
    const cardImg = resolveMediaUrl(currentCard.image || currentCard.imageUrl || currentCard.frontImage || currentCard.src || currentCard);
    const cardBackImg = resolveMediaUrl(currentCard.backImage || currentCard.back_image) || cardImg;

    function nextCard() {
        setFlipped(false);
        setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    }

    function previousCard() {
        setFlipped(false);
        setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    }

    return (
        <BlockCard type="flashcard">
            <div className="elab-flashcard-block-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Standard Block Header matching season design system */}
                <BlockHeader
                    type="flashcard"
                    title={title}
                    subtitle={instruction}
                />

                {/* Clean White Flashcard Flip Container */}
                <div style={{ perspective: "1000px", width: "100%", height: "240px" }}>
                    <div
                        onClick={() => setFlipped(!flipped)}
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            borderRadius: "1.25rem",
                            cursor: "pointer",
                            transformStyle: "preserve-3d",
                            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
                        }}
                    >
                        {/* Front Face - Pure Text Only (No Image on Front) */}
                        <div
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                borderRadius: "1.25rem",
                                backgroundColor: "#ffffff",
                                border: "2px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1.5rem"
                            }}
                        >
                            <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                {currentCard.front}
                            </span>
                        </div>

                        {/* Back Face - Display Image & Back Content Only After Flip */}
                        <div
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                                borderRadius: "1.25rem",
                                backgroundColor: "#ffffff",
                                border: "2px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1.5rem",
                                gap: "0.75rem"
                            }}
                        >
                            {cardBackImg && (
                                <img
                                    src={cardBackImg}
                                    alt={currentCard.back || "Flashcard Back"}
                                    style={{ maxHeight: "130px", maxWidth: "85%", objectFit: "contain" }}
                                />
                            )}
                            {currentCard.back && (
                                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                    {currentCard.back}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clean Navigation Controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
                    <button
                        type="button"
                        onClick={previousCard}
                        style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "9999px",
                            backgroundColor: "#ffffff",
                            border: "2px solid #cbd5e1",
                            color: "#334155",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
                        }}
                    >
                        ◀ Previous
                    </button>

                    <div style={{
                        padding: "0.4rem 1rem",
                        borderRadius: "9999px",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.9rem"
                    }}>
                        {currentIndex + 1} / {cards.length}
                    </div>

                    <button
                        type="button"
                        onClick={nextCard}
                        style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "9999px",
                            backgroundColor: "#22c55e",
                            border: "none",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)"
                        }}
                    >
                        Next ▶
                    </button>
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default FlashcardBlock;
