import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { resolveMediaUrl } from "../../services/MediaResolver";

function SingleSquareCard({ card, index, cardWidth }) {
    const [flipped, setFlipped] = useState(false);

    const frontText = card.front || card.word || card.title || card.text || (typeof card === "string" ? card : `Card ${index + 1}`);
    const backText = card.back || card.definition || card.translation || card.meaning || frontText;
    
    const cardImg = resolveMediaUrl(card.image || card.imageUrl || card.frontImage || card.src || (typeof card === "object" ? card : null));
    const cardBackImg = resolveMediaUrl(card.backImage || card.back_image) || cardImg;

    return (
        <div style={{ perspective: "1000px", width: cardWidth || "240px", height: "280px", flexShrink: 0 }}>
            <div
                onClick={() => setFlipped(!flipped)}
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "1.5rem",
                    cursor: "pointer",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)"
                }}
            >
                {/* Front Face: Clean white card with centered Front Text */}
                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        borderRadius: "1.5rem",
                        backgroundColor: "#ffffff",
                        border: "2.5px solid #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1.5rem 1rem",
                        boxSizing: "border-box"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", flex: 1 }}>
                        <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e293b", fontFamily: "'Poppins', sans-serif", textAlign: "center" }}>
                            {frontText}
                        </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", fontFamily: "'Poppins', sans-serif" }}>
                        Click to flip
                    </span>
                </div>

                {/* Back Face: Prominent Top Image spanning near borders, Text displayed directly below, Click to flip at bottom */}
                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderRadius: "1.5rem",
                        backgroundColor: "#ffffff",
                        border: "2.5px solid #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem 0.5rem 0.85rem 0.5rem",
                        boxSizing: "border-box",
                        overflow: "hidden"
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%", flex: 1, justifyContent: "flex-start" }}>
                        {/* Top Prominent Image near borders */}
                        {cardBackImg && (
                            <img
                                src={cardBackImg}
                                alt={backText}
                                style={{
                                    height: "150px",
                                    width: "100%",
                                    objectFit: "cover",
                                    borderRadius: "1.1rem",
                                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        )}
                        {/* Text directly below the image */}
                        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1e293b", fontFamily: "'Poppins', sans-serif", textAlign: "center", wordBreak: "break-word", marginTop: "0.35rem", padding: "0 0.5rem" }}>
                            {backText}
                        </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", fontFamily: "'Poppins', sans-serif" }}>
                        Click to flip
                    </span>
                </div>
            </div>
        </div>
    );
}

function FlashcardBlock({ block }) {
    const { 
        cards = [], 
        title = "Flashcards",
        instruction = "Tap the card to flip it"
    } = block.content;

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

    // Determine card width based on total cards: 2 cards get wider side-by-side corners
    const isTwoCards = cards.length === 2;
    const cardWidth = isTwoCards ? "280px" : "240px";

    return (
        <BlockCard type="flashcard">
            <div className="elab-flashcard-block-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem", marginBottom: "2rem" }}>
                {/* Standard Block Header */}
                <BlockHeader
                    type="flashcard"
                    title={title}
                    subtitle={instruction}
                />

                {/* Cards Container - Side by side layout */}
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isTwoCards ? "2.5rem" : "1.5rem",
                    width: "100%",
                    padding: "0.75rem 0"
                }}>
                    {cards.map((card, index) => (
                        <SingleSquareCard key={index} card={card} index={index} cardWidth={cardWidth} />
                    ))}
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default FlashcardBlock;
