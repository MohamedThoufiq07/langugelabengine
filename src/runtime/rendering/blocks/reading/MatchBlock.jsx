import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function shuffleIndices(n) {

    const idx = Array.from({ length: n }, (_, i) => i);

    for (let i = idx.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [idx[i], idx[j]] = [idx[j], idx[i]];

    }

    return idx;

}

function MatchBlock({ block }) {

    const { leftItems = [], rightItems = [] } = block.content;

    const completion = useScreenCompletion();

    const [rightOrder] = useState(() => shuffleIndices(rightItems.length));

    const [selectedLeft, setSelectedLeft] = useState(null);

    const [matched, setMatched] = useState(() => new Set());

    const [wrongRight, setWrongRight] = useState(null);

    const total = Math.min(leftItems.length, rightItems.length);

    const allMatched = total > 0 && matched.size === total;

    useEffect(() => {

        if (allMatched) completion?.reportAnswered(block.id);

    }, [allMatched]);

    function chooseLeft(index) {

        if (matched.has(index)) return;

        setSelectedLeft(index === selectedLeft ? null : index);

    }

    function chooseRight(rightIdx) {

        if (selectedLeft === null) return;

        const originalIndex = rightOrder[rightIdx];

        if (matched.has(originalIndex)) return;

        if (originalIndex === selectedLeft) {

            setMatched(prev => new Set(prev).add(selectedLeft));

            setSelectedLeft(null);

        } else {

            setWrongRight(rightIdx);

            setTimeout(() => setWrongRight(null), 400);

        }

    }

    return (

        <BlockCard type="match">

            <BlockHeader

                type="match"

                title="Match the Following"

                subtitle="Tap an item on the left, then its match on the right"

            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                <div className="elab-chip-row" style={{ flexDirection: "column" }}>

                    {leftItems.map((item, index) => (

                        <button

                            key={index}

                            onClick={() => chooseLeft(index)}

                            disabled={matched.has(index)}

                            className={`elab-option ${selectedLeft === index ? "is-selected" : ""} ${matched.has(index) ? "is-correct" : ""}`}

                        >

                            {item}

                        </button>

                    ))}

                </div>

                <div className="elab-chip-row" style={{ flexDirection: "column" }}>

                    {rightOrder.map((originalIndex, rightIdx) => {

                        const isMatched = matched.has(originalIndex);

                        return (

                            <button

                                key={rightIdx}

                                onClick={() => chooseRight(rightIdx)}

                                disabled={isMatched}

                                className={`elab-option ${isMatched ? "is-correct" : ""} ${wrongRight === rightIdx ? "is-incorrect" : ""}`}

                            >

                                {rightItems[originalIndex]}

                            </button>

                        );

                    })}

                </div>

            </div>

            {allMatched && (

                <div className="elab-feedback success">✅ All matched!</div>

            )}

        </BlockCard>

    );

}

export default MatchBlock;
