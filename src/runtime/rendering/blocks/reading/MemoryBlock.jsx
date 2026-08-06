import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function MemoryBlock({ block }) {

    const { pairs = [] } = block.content;

    const [cards, setCards] = useState([]);

    const [selected, setSelected] = useState([]);

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

        }

        else {

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

            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="memory"
                        title="Memory Game"
                        subtitle="Find the matching pairs"
                    />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 12
                        }}
                    >
                        {cards.map((card, index) => (
                            <button
                                key={index}
                                onClick={() => flipCard(index)}
                                className={`elab-grid-cell ${card.matched ? "is-matched" : ""}`}
                                style={{
                                    height: 72,
                                    fontSize: "14px"
                                }}
                            >
                                {card.flipped || card.matched ? card.text : "?"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="elab-block-illustration-side">
                    <img 
                        src="/assets/reading para and memory game.jpeg" 
                        alt="Memory Game Illustration" 
                        className="elab-block-illustration-image elab-crop-memory"
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default MemoryBlock;
