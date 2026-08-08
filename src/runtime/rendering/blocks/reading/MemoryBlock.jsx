import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import badgeMemoryUrl from "../../../samples/assets/images/badge_memory.png";
import memoryOwlUrl from "../../../samples/assets/images/memory_owl.png";
import memoryThoughtUrl from "../../../samples/assets/images/memory_thought.png";

function MemoryBlock({ block }) {
    const { pairs = [] } = block.content;
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);
    const completion = useScreenCompletion();

    useEffect(() => {
        initialize();
    }, []);

    function initialize() {
        const deck = [];
        pairs.forEach(pair => {
            deck.push({
                pairId: pair.id,
                text: pair.left,
                flipped: false,
                matched: false
            });
            deck.push({
                pairId: pair.id,
                text: pair.right,
                flipped: false,
                matched: false
            });
        });
        deck.sort(() => Math.random() - 0.5);
        setCards(deck);
    }

    function flipCard(index) {
        if (
            cards[index].matched ||
            cards[index].flipped ||
            selected.length === 2
        ) return;

        const updated = [...cards];
        updated[index].flipped = true;
        setCards(updated);

        const picks = [...selected, index];
        setSelected(picks);

        if (picks.length === 2) {
            checkMatch(updated, picks);
        }
    }

    function checkMatch(updatedCards, picks) {
        const first = updatedCards[picks[0]];
        const second = updatedCards[picks[1]];

        if (first.pairId === second.pairId) {
            first.matched = true;
            second.matched = true;
            setCards([...updatedCards]);
            setSelected([]);

            // Report completion if all matched
            const allMatched = updatedCards.every(c => c.matched);
            if (allMatched) {
                completion?.reportAnswered(block.id);
            }
        } else {
            setTimeout(() => {
                first.flipped = false;
                second.flipped = false;
                setCards([...updatedCards]);
                setSelected([]);
            }, 1000);
        }
    }

    return (
        <BlockCard type="memory">
            <div className="elab-block-two-column memory-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <img src={badgeMemoryUrl} className="elab-header-badge-img" alt="Badge" />
                        <div className="elab-header-content">
                            <div className="elab-title-row">
                                <h3 className="elab-custom-title-purple">MEMORY GAME</h3>
                                <span className="elab-header-stars">⭐✨</span>
                            </div>
                            <p className="elab-custom-subtitle">Find the matching pairs</p>
                        </div>
                    </div>

                    {/* Game Grid Container */}
                    <div className="elab-memory-container-box">
                        <div className="elab-memory-grid">
                            {cards.map((card, index) => {
                                const isFlippedOrMatched = card.flipped || card.matched;
                                const colorClass = `color-${index % 4}`;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => flipCard(index)}
                                        className={`elab-memory-card-custom ${isFlippedOrMatched ? `is-front ${colorClass}` : "is-back"}`}
                                    >
                                        {isFlippedOrMatched ? (
                                            <span className="elab-memory-card-text">{card.text}</span>
                                        ) : (
                                            <span className="elab-memory-card-q">?</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side Illustration */}
                <div className="elab-memory-illustration-container">
                    <img src={memoryThoughtUrl} className="elab-memory-thought" alt="Thought" />
                    <img src={memoryOwlUrl} className="elab-memory-owl" alt="Owl" />
                </div>
            </div>
        </BlockCard>
    );
}

export default MemoryBlock;
