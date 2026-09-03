import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// A palette of distinct, vibrant pair colours (background / border / text)
const PAIR_COLORS = [
    { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" }, // blue
    { bg: "#dcfce7", border: "#22c55e", text: "#14532d" }, // green
    { bg: "#fef9c3", border: "#eab308", text: "#713f12" }, // yellow
    { bg: "#fce7f3", border: "#ec4899", text: "#831843" }, // pink
    { bg: "#ede9fe", border: "#8b5cf6", text: "#3b0764" }, // purple
    { bg: "#ffedd5", border: "#f97316", text: "#7c2d12" }, // orange
    { bg: "#e0f2fe", border: "#0ea5e9", text: "#0c4a6e" }, // sky
    { bg: "#d1fae5", border: "#10b981", text: "#064e3b" }, // emerald
];

function shuffleIndices(n) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
}

function MatchBlock({ block }) {

    const { leftItems = [], rightItems = [], question } = block.content;

    const completion = useScreenCompletion();

    const [rightOrder] = useState(() => shuffleIndices(rightItems.length));

    const [selectedLeft, setSelectedLeft] = useState(null);

    // matched: Map<pairIndex, colorIndex>
    const [matchColors, setMatchColors] = useState(() => new Map());

    const [wrongRight, setWrongRight] = useState(null);

    // Keep a counter so each new match gets the next colour in sequence
    const [colorCounter, setColorCounter] = useState(0);

    const total = Math.min(leftItems.length, rightItems.length);
    const allMatched = total > 0 && matchColors.size === total;

    useEffect(() => {
        if (allMatched) completion?.reportAnswered(block.id);
    }, [allMatched]);

    function chooseLeft(index) {
        if (matchColors.has(index)) return;
        setSelectedLeft(index === selectedLeft ? null : index);
    }

    function chooseRight(rightIdx) {
        if (selectedLeft === null) return;

        const originalIndex = rightOrder[rightIdx];

        if (matchColors.has(originalIndex)) return;

        if (originalIndex === selectedLeft) {
            // Correct pair — assign the next colour
            const colorIndex = colorCounter % PAIR_COLORS.length;
            setMatchColors(prev => new Map(prev).set(selectedLeft, colorIndex));
            setColorCounter(prev => prev + 1);
            setSelectedLeft(null);
        } else {
            // Wrong pair
            setWrongRight(rightIdx);
            setTimeout(() => setWrongRight(null), 400);
        }
    }

    // Helper: inline styles for a matched pair with a specific colour
    function matchedStyle(pairIndex) {
        if (!matchColors.has(pairIndex)) return {};
        const c = PAIR_COLORS[matchColors.get(pairIndex)];
        return {
            background: c.bg,
            borderColor: c.border,
            color: c.text,
            fontWeight: 700,
        };
    }

    return (

        <BlockCard type="match">

            {/* Purple board heading */}
            <div className="grammar-header" style={{ marginBottom: "12px" }}>
                <div className="grammar-title-banner writing">MATCH THE FOLLOWING</div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 16px 0" }}>
                {question || "Tap an item on the left, then its match on the right"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* LEFT column */}
                <div className="elab-chip-row" style={{ flexDirection: "column", gap: "10px" }}>
                    {leftItems.map((item, index) => {
                        const isMatched = matchColors.has(index);
                        const isSelected = selectedLeft === index;
                        return (
                            <button
                                key={index}
                                onClick={() => chooseLeft(index)}
                                disabled={isMatched}
                                className={`elab-option${isSelected ? " is-selected" : ""}`}
                                style={isMatched ? matchedStyle(index) : {}}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* RIGHT column (shuffled) */}
                <div className="elab-chip-row" style={{ flexDirection: "column", gap: "10px" }}>
                    {rightOrder.map((originalIndex, rightIdx) => {
                        const isMatched = matchColors.has(originalIndex);
                        const isWrong = wrongRight === rightIdx;
                        return (
                            <button
                                key={rightIdx}
                                onClick={() => chooseRight(rightIdx)}
                                disabled={isMatched}
                                className={`elab-option${isWrong ? " is-incorrect" : ""}`}
                                style={isMatched ? matchedStyle(originalIndex) : {}}
                            >
                                {rightItems[originalIndex]}
                            </button>
                        );
                    })}
                </div>

            </div>

            {allMatched && (
                <div className="elab-feedback success" style={{ marginTop: "16px" }}>
                    ✅ All matched!
                </div>
            )}

        </BlockCard>

    );

}

export default MatchBlock;
