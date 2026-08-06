import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function FlashcardBlock({ block }) {

    const { cards = [] } = block.content;

    const [currentIndex, setCurrentIndex] = useState(0);

    const [flipped, setFlipped] = useState(false);

    if (!cards.length) {

        return (
            <BlockCard type="flashcard">
                <BlockHeader type="flashcard" title="Flashcards" />
                <p className="elab-plain-text">No flashcards available.</p>
            </BlockCard>
        );

    }

    const currentCard = cards[currentIndex];

    function nextCard() {

        setFlipped(false);

        setCurrentIndex((prev) =>

            prev === cards.length - 1

                ? 0

                : prev + 1

        );

    }

    function previousCard() {

        setFlipped(false);

        setCurrentIndex((prev) =>

            prev === 0

                ? cards.length - 1

                : prev - 1

        );

    }

    return (

        <BlockCard type="flashcard">

            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="flashcard"
                        title="FLASHCARDS"
                        subtitle="Tap the card to flip it"
                    />

                    <div className="elab-flashcard-scene">
                        <div
                            className={`elab-flashcard ${flipped ? "is-flipped" : ""}`}
                            onClick={() => setFlipped(!flipped)}
                        >
                            <div className="elab-flashcard-face front">
                                {currentCard.front}
                            </div>
                            <div className="elab-flashcard-face back">
                                {currentCard.back}
                            </div>
                        </div>
                    </div>

                    <div className="elab-flashcard-nav">
                        <button className="elab-btn-icon secondary" onClick={previousCard}>
                            ◀ Previous
                        </button>
                        <span className="elab-flashcard-counter">
                            📖 {currentIndex + 1} / {cards.length}
                        </span>
                        <button className="elab-btn-icon" onClick={nextCard}>
                            Next ▶
                        </button>
                    </div>
                </div>

                <div className="elab-block-illustration-side">
                    <img 
                        src="/assets/flashcard.jpeg" 
                        alt="Flashcards Illustration" 
                        className="elab-block-illustration-image elab-crop-flashcard"
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default FlashcardBlock;
