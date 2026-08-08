import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";

// Import cutouts
import badgeFlashcardUrl from "../../../samples/assets/images/badge_flashcard.png";
import flashcardBoyUrl from "../../../samples/assets/images/flashcard_boy.png";
import flashcardCardsStackUrl from "../../../samples/assets/images/flashcard_cards_stack.png";
import flashcardAbcBubbleUrl from "../../../samples/assets/images/flashcard_abc_bubble.png";
import flashcardBooksBlocksUrl from "../../../samples/assets/images/flashcard_books_blocks.png";
import flashcardPencilUrl from "../../../samples/assets/images/flashcard_pencil.png";
import flashcardOpenBookUrl from "../../../samples/assets/images/flashcard_open_book.png";
import flashcardBalloonUrl from "../../../samples/assets/images/flashcard_balloon.png";

function FlashcardBlock({ block }) {
    const { cards = [] } = block.content;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!cards.length) {
        return (
            <BlockCard type="flashcard">
                <div className="elab-custom-header">
                    <img src={badgeFlashcardUrl} className="elab-header-badge-img" alt="Badge" />
                    <h3 className="elab-custom-title">Flashcards</h3>
                </div>
                <p className="elab-plain-text">No flashcards available.</p>
            </BlockCard>
        );
    }

    const currentCard = cards[currentIndex];

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
            <div className="elab-flashcard-block-container">
                {/* Header Row */}
                <div className="elab-custom-header flashcard-header">
                    <div className="elab-header-left-side">
                        <img src={badgeFlashcardUrl} className="elab-header-badge-img" alt="Badge" />
                        <div className="elab-header-content">
                            <div className="elab-title-row">
                                <span className="elab-flashcards-title-badge">FLASHCARDS</span>
                                <span className="elab-header-stars">⭐✨</span>
                            </div>
                            <p className="elab-custom-subtitle">Tap the card to flip it</p>
                        </div>
                    </div>
                    <div className="elab-header-right-side">
                        <span className="elab-learn-badge">LEARN</span>
                        <img src={flashcardBalloonUrl} className="elab-header-balloon-pink" alt="Balloon" />
                    </div>
                </div>

                {/* Flip Card Scene (Occupies the full width of block) */}
                <div className="elab-flashcard-scene-wrapper">
                    <div className="elab-flashcard-scene">
                        <div
                            className={`elab-flashcard ${flipped ? "is-flipped" : ""}`}
                            onClick={() => setFlipped(!flipped)}
                        >
                            {/* Front Face */}
                            <div className="elab-flashcard-face front">
                                <span className="elab-flashcard-branch">🌿</span>
                                <div className="elab-flashcard-left-content">
                                    <span className="elab-flashcard-text">{currentCard.front}</span>
                                </div>
                                <div className="elab-flashcard-decorations">
                                    <span className="elab-flashcard-stars-top">✨</span>
                                    <img src={flashcardAbcBubbleUrl} className="elab-flashcard-abc-bubble" alt="ABC" />
                                    <img src={flashcardBoyUrl} className="elab-flashcard-boy-chibi" alt="Boy" />
                                    <img src={flashcardBooksBlocksUrl} className="elab-flashcard-books-blocks" alt="Books Blocks" />
                                </div>
                            </div>

                            {/* Back Face */}
                            <div className="elab-flashcard-face back">
                                <span className="elab-flashcard-branch">🌿</span>
                                <div className="elab-flashcard-left-content">
                                    <span className="elab-flashcard-text">{currentCard.back}</span>
                                </div>
                                <div className="elab-flashcard-decorations">
                                    <span className="elab-flashcard-stars-top">✨</span>
                                    <img src={flashcardAbcBubbleUrl} className="elab-flashcard-abc-bubble" alt="ABC" />
                                    <img src={flashcardBoyUrl} className="elab-flashcard-boy-chibi" alt="Boy" />
                                    <img src={flashcardBooksBlocksUrl} className="elab-flashcard-books-blocks" alt="Books Blocks" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="elab-flashcard-nav-container">
                    {/* Left Decorations */}
                    <img src={flashcardOpenBookUrl} className="elab-nav-decor-book" alt="Book decoration" />
                    <img src={flashcardPencilUrl} className="elab-nav-decor-pencil" alt="Pencil decoration" />

                    {/* Nav Elements */}
                    <div className="elab-flashcard-nav-controls">
                        <button className="elab-flashcard-nav-btn prev" onClick={previousCard}>
                            ◀ Previous
                        </button>
                        <div className="elab-flashcard-counter-badge">
                            <img src={flashcardCardsStackUrl} className="elab-counter-icon" alt="Stack" />
                            <span className="elab-counter-text">{currentIndex + 1} / {cards.length}</span>
                        </div>
                        <button className="elab-flashcard-nav-btn next" onClick={nextCard}>
                            Next ▶
                        </button>
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default FlashcardBlock;
