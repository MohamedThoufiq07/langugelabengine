import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeWordsConnectUrl from "../../../../assets/images/badge_words_connect.png";
import girlPuzzleUrl from "../../../../assets/images/grammar_girl_puzzle.png";

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

    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const [selectedItem, setSelectedItem] = useState(null);
    const [placed, setPlaced] = useState(savedAnswer || {});
    const [wrongZone, setWrongZone] = useState(null);

    const placedItemIndices = new Set(Object.values(placed));
    const total = Math.min(finalDraggable.length, finalZones.length);
    const allPlaced = total > 0 && placedItemIndices.size === total;

    const isAssessment = window.__isAssessment;

    useEffect(() => {
        if (allPlaced) completion?.reportAnswered(block.id);
    }, [allPlaced]);

    useEffect(() => {
        if (savedAnswer) {
            const placedItemIndices = new Set(Object.values(savedAnswer));
            const total = Math.min(finalDraggable.length, finalZones.length);
            const allPlaced = total > 0 && placedItemIndices.size === total;
            if (allPlaced) {
                completion?.reportAnswered(block.id);
            }
        }
    }, [savedAnswer, finalDraggable, finalZones]);

    function chooseItem(index) {
        if (placedItemIndices.has(index)) return;
        setSelectedItem(index === selectedItem ? null : index);
    }

    function chooseZone(zoneIndex) {
        if (placed[zoneIndex] !== undefined) {
            setPlaced(prev => {
                const next = { ...prev };
                delete next[zoneIndex];
                completion?.saveAnswer?.(block.id, next);
                return next;
            });
            return;
        }
        if (selectedItem === null) return;

        if (isAssessment || selectedItem === zoneIndex) {
            setPlaced(prev => {
                const next = { ...prev, [zoneIndex]: selectedItem };
                completion?.saveAnswer?.(block.id, next);
                return next;
            });
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
                            draggable="true"
                            onDragStart={(e) => {
                                setSelectedItem(index);
                                e.dataTransfer.setData("text/plain", index);
                            }}
                            disabled={placedItemIndices.has(index)}
                            className={`elab-drag-chip ${selectedItem === index ? "is-selected" : ""} ${placedItemIndices.has(index) ? "is-placed" : ""}`}
                            style={{ cursor: "grab" }}
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
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const draggedIndexStr = e.dataTransfer.getData("text/plain");
                                    if (draggedIndexStr !== "") {
                                        const draggedIndex = parseInt(draggedIndexStr, 10);
                                        if (placed[zoneIndex] === undefined) {
                                            if (isAssessment || draggedIndex === zoneIndex) {
                                                setPlaced(prev => {
                                                    const next = { ...prev, [zoneIndex]: draggedIndex };
                                                    completion?.saveAnswer?.(block.id, next);
                                                    return next;
                                                });
                                                setSelectedItem(null);
                                            } else {
                                                setWrongZone(zoneIndex);
                                                setTimeout(() => setWrongZone(null), 400);
                                            }
                                        }
                                    }
                                }}
                                className="elab-drop-zone-box"
                            >
                                <div className="elab-drop-zone-dest">{zone}</div>
                                <div className={`elab-drop-zone-target-box ${filled ? "is-filled" : ""} ${wrongZone === zoneIndex ? "is-wrong" : ""}`}>
                                    {filled ? (
                                        <span 
                                            className="elab-drag-chip" 
                                            style={{ cursor: "pointer" }}
                                            title="Click to remove"
                                        >
                                            {finalDraggable[itemIndex]}
                                        </span>
                                    ) : (
                                        <span className="elab-drop-here-text">Drop here</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {allPlaced && !isAssessment && (
                    <div className="elab-feedback success">✅ Great job!</div>
                )}
            </div>
        </BlockCard>
    );
}

export default DragDropBlock;
