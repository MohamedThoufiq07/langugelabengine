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
            const rawText = typeof p === "object" ? (p.source || p.sourceText || p.text || "") : p;
            const rawImg = typeof p === "object" ? (p.sourceImage || p.source_image || p.image || p.imageUrl) : null;
            const imgSrc = resolveMediaUrl(rawImg || p);
            return {
                text: rawText,
                image: imgSrc
            };
        });
        finalZones = pairs.map(p => {
            const rawText = typeof p === "object" ? (p.target || p.targetText || p.text || "") : p;
            const rawImg = typeof p === "object" ? (p.targetImage || p.target_image) : null;
            const imgSrc = resolveMediaUrl(rawImg);
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
                    image: resolveMediaUrl(item.sourceImage || item.source_image || item.image || item.imageUrl || item)
                };
            }
            return { text: String(item), image: resolveMediaUrl(item) };
        });
        finalZones = finalZones.map(zone => {
            if (typeof zone === "object" && zone !== null) {
                return {
                    text: zone.text || zone.label || zone.target || "",
                    image: resolveMediaUrl(zone.targetImage || zone.target_image || zone.image || zone.imageUrl || zone)
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
                <div className="elab-drag-chips-row" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
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
                            style={{
                                cursor: "grab",
                                display: "inline-flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.4rem",
                                padding: 0,
                                border: "none",
                                backgroundColor: "transparent",
                                boxShadow: "none"
                            }}
                        >
                            {itemObj.image ? (
                                <img
                                    src={itemObj.image}
                                    alt={itemObj.text || "Draggable Item"}
                                    style={{
                                        width: "150px",
                                        height: "105px",
                                        objectFit: "cover",
                                        borderRadius: "1rem",
                                        display: "block",
                                        border: selectedItem === index ? "4px solid #f59e0b" : "3px solid #ffffff",
                                        boxShadow: selectedItem === index ? "0 0 22px rgba(245, 158, 11, 0.6)" : "0 6px 18px rgba(0, 0, 0, 0.14)",
                                        transition: "all 0.2s ease"
                                    }}
                                />
                            ) : (
                                <span style={{
                                    padding: "0.65rem 1.25rem",
                                    borderRadius: "1rem",
                                    backgroundColor: selectedItem === index ? "#fffbe6" : "#ffffff",
                                    border: selectedItem === index ? "3px solid #f59e0b" : "2px solid #cbd5e1",
                                    fontWeight: 800,
                                    fontSize: "1.05rem",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                                }}>
                                    {itemObj.text}
                                </span>
                            )}
                            {itemObj.image && itemObj.text && itemObj.text.trim().length > 0 && (
                                <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>{itemObj.text}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Drop zones */}
                <div className="elab-drop-zones-row" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "flex-start", alignItems: "flex-end", marginTop: "1rem" }}>
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
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
                            >
                                <div className="elab-drop-zone-dest" style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ea580c", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {zoneObj.image && (
                                        <img
                                            src={zoneObj.image}
                                            alt={zoneObj.text || "Target Zone"}
                                            style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px" }}
                                        />
                                    )}
                                    {zoneObj.text && zoneObj.text.trim().length > 0 && (
                                        <span>{zoneObj.text}</span>
                                    )}
                                </div>
                                <div
                                    className={`elab-drop-zone-target-box ${filled ? "is-filled" : ""} ${wrongZone === zoneIndex ? "is-wrong" : ""}`}
                                    style={{
                                        minWidth: "155px",
                                        minHeight: "110px",
                                        borderRadius: "1.1rem",
                                        border: filled ? "none" : "2.5px dashed #f97316",
                                        backgroundColor: filled ? "transparent" : "rgba(255, 247, 237, 0.8)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0"
                                    }}
                                >
                                    {filled ? (
                                        <button 
                                            type="button"
                                            onClick={(e) => handleRemovePlaced(zoneIndex, e)}
                                            style={{
                                                cursor: "pointer",
                                                border: "none",
                                                backgroundColor: "transparent",
                                                padding: 0,
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                            title="Click to remove / undo"
                                        >
                                            {placedObj?.image ? (
                                                <img
                                                    src={placedObj.image}
                                                    alt={placedObj.text || "Placed Item"}
                                                    style={{
                                                        width: "150px",
                                                        height: "105px",
                                                        objectFit: "cover",
                                                        borderRadius: "1rem",
                                                        display: "block",
                                                        border: "3.5px solid #22c55e",
                                                        boxShadow: "0 6px 18px rgba(34, 197, 94, 0.3)"
                                                    }}
                                                />
                                            ) : (
                                                <span style={{
                                                    padding: "0.6rem 1.15rem",
                                                    borderRadius: "0.85rem",
                                                    backgroundColor: "#f0fdf4",
                                                    border: "2.5px solid #22c55e",
                                                    fontWeight: 800,
                                                    fontSize: "1rem",
                                                    color: "#15803d"
                                                }}>
                                                    {placedObj?.text}
                                                </span>
                                            )}
                                            {placedObj?.image && placedObj?.text && placedObj.text.trim().length > 0 && (
                                                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#15803d", marginTop: "0.25rem" }}>{placedObj.text}</span>
                                            )}
                                        </button>
                                    ) : (
                                        <span className="elab-drop-here-text" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#c2410c" }}>Drop here</span>
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
