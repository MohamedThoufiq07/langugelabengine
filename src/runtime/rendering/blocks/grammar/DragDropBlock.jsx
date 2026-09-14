import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import HintLadderComponent from "../../services/HintLadder";
import { resolveMediaUrl } from "../../services/MediaResolver";

import badgeWordsConnectUrl from "../../../../assets/images/badge_words_connect.png";
import girlPuzzleUrl from "../../../../assets/images/grammar_girl_puzzle.png";

function DragDropBlock({ block }) {
    const { 
        draggableItems = [], 
        dropZones = [], 
        pairs = [], 
        question,
        hints = {
            replay: "Look at the items and zones again carefully",
            visualClue: "Focus on the relationship between words and their destinations",
            sentenceStarter: "Think: 'This word belongs with...'",
            modelAnswer: "Match words based on grammar, meaning, or context"
        }
    } = block.content;
    
    const completion = useScreenCompletion();

    // Map pairs format to local items if defined, preserving image meta
    let finalDraggable = [...draggableItems];
    let finalZones = [...dropZones];
    if (pairs && pairs.length > 0) {
        finalDraggable = pairs.map(p => {
            const rawText = typeof p === "object" ? p.source : p;
            const imgSrc = typeof p === "object" ? resolveMediaUrl(p.sourceImage || p.source_image || p.image || p.imageUrl || p) : resolveMediaUrl(p);
            return {
                text: rawText,
                image: imgSrc
            };
        });
        finalZones = pairs.map(p => {
            const rawText = typeof p === "object" ? p.target : p;
            const imgSrc = typeof p === "object" ? resolveMediaUrl(p.targetImage || p.target_image || p) : null;
            return {
                text: rawText,
                image: imgSrc
            };
        });
    } else {
        finalDraggable = finalDraggable.map(item => {
            if (typeof item === "object" && item !== null) {
                return {
                    text: item.text || item.label || item.source || "",
                    image: resolveMediaUrl(item)
                };
            }
            return { text: String(item), image: resolveMediaUrl(item) };
        });
        finalZones = finalZones.map(zone => {
            if (typeof zone === "object" && zone !== null) {
                return {
                    text: zone.text || zone.label || zone.target || "",
                    image: resolveMediaUrl(zone)
                };
            }
            return { text: String(zone), image: null };
        });
    }

    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const [selectedItem, setSelectedItem] = useState(null);
    const [placed, setPlaced] = useState(savedAnswer || {});
    const [wrongZone, setWrongZone] = useState(null);
    const [currentAttempt, setCurrentAttempt] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [currentHint, setCurrentHint] = useState(null);

    const placedItemIndices = new Set(Object.values(placed));
    const placedCount = Object.keys(placed).length;
    const total = Math.min(finalDraggable.length, finalZones.length);
    const allPlaced = total === 0 || placedCount >= total;

    const isAssessment = window.__isAssessment;

    useEffect(() => {
        if (allPlaced) {
            completion?.reportAnswered(block.id);
        }
    }, [allPlaced, placed]);

    function chooseItem(index) {
        if (placedItemIndices.has(index)) return;
        setSelectedItem(index === selectedItem ? null : index);
    }

    function handleWrongZone() {
        if (!isAssessment && currentAttempt < 4) {
            setCurrentAttempt(prev => prev + 1);
            setShowHint(true);
        }
    }

    function handleRequestHint(hint) {
        setCurrentHint(hint);
        setShowHint(true);
    }

    function handleRemovePlaced(zoneIndex, e) {
        if (e) e.stopPropagation();
        setPlaced(prev => {
            const next = { ...prev };
            delete next[zoneIndex];
            completion?.saveAnswer?.(block.id, next);
            return next;
        });
        setSelectedItem(null);
    }

    function chooseZone(zoneIndex) {
        // If zone is already filled, clicking it removes/undoes the placed item
        if (placed[zoneIndex] !== undefined) {
            handleRemovePlaced(zoneIndex);
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
            handleWrongZone();
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
                <BlockHeader
                    type="quiz"
                    title="WORDS CONNECT"
                    subtitle={question || "Drag the correct items to their destinations."}
                />

                {!isAssessment && currentAttempt > 0 && (
                    <HintLadderComponent
                        currentAttempt={currentAttempt}
                        onRequestHint={handleRequestHint}
                        canUseHint={currentAttempt < 4}
                        hints={hints}
                    />
                )}

                {currentHint && showHint && (
                    <div className="hint-display">
                        <div className="hint-header">
                            <span className="hint-title">💡 {currentHint.label}</span>
                            <button 
                                className="hint-close"
                                onClick={() => setShowHint(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="hint-body">
                            {currentHint.content}
                        </div>
                    </div>
                )}
                
                {/* Draggable items (chips) */}
                <div className="elab-drag-chips-row">
                    {finalDraggable.map((itemObj, index) => (
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
                            style={{ cursor: "grab", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            {itemObj.image && (
                                <img
                                    src={itemObj.image}
                                    alt={itemObj.text}
                                    style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px" }}
                                />
                            )}
                            <span>{itemObj.text}</span>
                        </button>
                    ))}
                </div>

                {/* Drop zones */}
                <div className="elab-drop-zones-row">
                    {finalZones.map((zoneObj, zoneIndex) => {
                        const itemIndex = placed[zoneIndex];
                        const filled = itemIndex !== undefined;
                        const placedObj = filled ? finalDraggable[itemIndex] : null;
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
                                <div className="elab-drop-zone-dest">
                                    {zoneObj.image && (
                                        <img
                                            src={zoneObj.image}
                                            alt={zoneObj.text}
                                            style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px", display: "block", margin: "0 auto 0.25rem auto" }}
                                        />
                                    )}
                                    <span>{zoneObj.text}</span>
                                </div>
                                <div className={`elab-drop-zone-target-box ${filled ? "is-filled" : ""} ${wrongZone === zoneIndex ? "is-wrong" : ""}`}>
                                    {filled ? (
                                        <button 
                                            type="button"
                                            onClick={(e) => handleRemovePlaced(zoneIndex, e)}
                                            className="elab-drag-chip" 
                                            style={{ cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                                            title="Click to remove / undo"
                                        >
                                            {placedObj?.image && (
                                                <img
                                                    src={placedObj.image}
                                                    alt={placedObj.text}
                                                    style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "4px" }}
                                                />
                                            )}
                                            <span>{placedObj?.text}</span>
                                        </button>
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
