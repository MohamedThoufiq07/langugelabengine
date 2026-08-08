import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeWordsConnectUrl from "../../../samples/assets/images/badge_words_connect.png";
import girlPuzzleUrl from "../../../samples/assets/images/grammar_girl_puzzle.png";

function DragDropBlock({ block }) {
    const { draggableItems = [], dropZones = [], pairs = [], question } = block.content;
    const completion = useScreenCompletion();

    // Map pairs format to local items if defined
    let finalDraggable = [...draggableItems];
    let finalZones = [...dropZones];
    if (pairs && pairs.length > 0) {
        finalDraggable = pairs.map(p => p.source);
        finalZones = pairs.map(p => p.target);
    }

    const [selectedItem, setSelectedItem] = useState(null);
    const [placed, setPlaced] = useState({});
    const [wrongZone, setWrongZone] = useState(null);

    const placedItemIndices = new Set(Object.values(placed));
    const total = Math.min(finalDraggable.length, finalZones.length);
    const allPlaced = total > 0 && placedItemIndices.size === total;

    useEffect(() => {
        if (allPlaced) completion?.reportAnswered(block.id);
    }, [allPlaced]);

    function chooseItem(index) {
        if (placedItemIndices.has(index)) return;
        setSelectedItem(index === selectedItem ? null : index);
    }

    function chooseZone(zoneIndex) {
        if (selectedItem === null || placed[zoneIndex] !== undefined) return;

        if (selectedItem === zoneIndex) {
            setPlaced(prev => ({ ...prev, [zoneIndex]: selectedItem }));
            setSelectedItem(null);
        } else {
            setWrongZone(zoneIndex);
            setTimeout(() => setWrongZone(null), 400);
        }
    }

    return (
        <BlockCard type="drag_drop" className="elab-words-connect-card">
            {/* Left side Illustration */}
            <div className="elab-grammar-illustration left">
                <img src={girlPuzzleUrl} className="elab-girl-puzzle-img" alt="Girl Puzzle" />
            </div>

            <div className="elab-grammar-card-content">
                {/* Header */}
                <div className="elab-grammar-header">
                    <div className="elab-grammar-title-row">
                        <img src={badgeWordsConnectUrl} className="elab-grammar-badge" alt="Badge" />
                        <span className="elab-grammar-title orange">WORDS CONNECT</span>
                    </div>
                    <p className="elab-grammar-subtitle">{question || "Drag the correct words to their destinations."}</p>
                </div>
                
                {/* Draggable items (chips) */}
                <div className="elab-drag-chips-row">
                    {finalDraggable.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => chooseItem(index)}
                            disabled={placedItemIndices.has(index)}
                            className={`elab-drag-chip ${selectedItem === index ? "is-selected" : ""} ${placedItemIndices.has(index) ? "is-placed" : ""}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Drop zones */}
                <div className="elab-drop-zones-row">
                    {finalZones.map((zone, zoneIndex) => {
                        const itemIndex = placed[zoneIndex];
                        const filled = itemIndex !== undefined;
                        return (
                            <div
                                key={zoneIndex}
                                onClick={() => chooseZone(zoneIndex)}
                                className="elab-drop-zone-box"
                            >
                                <div className="elab-drop-zone-dest">{zone}</div>
                                <div className={`elab-drop-zone-target-box ${filled ? "is-filled" : ""} ${wrongZone === zoneIndex ? "is-wrong" : ""}`}>
                                    {filled ? (
                                        <span className="elab-drag-chip is-static">{finalDraggable[itemIndex]}</span>
                                    ) : (
                                        <span className="elab-drop-here-text">Drop here</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {allPlaced && (
                    <div className="elab-feedback success">✅ Great job!</div>
                )}
            </div>
        </BlockCard>
    );
}

export default DragDropBlock;
