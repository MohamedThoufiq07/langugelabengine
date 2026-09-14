import { useState, useRef } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import { resolveMediaUrl } from "../../services/MediaResolver";

function HotspotExplorerBlock({ block }) {
    const {
        image,
        imageUrl,
        baseImage,
        base_image,
        title = "Explore the Image",
        hotspots = [],
        items = [],
        targets = [],
        instruction = "Click on different areas to learn more"
    } = block.content;

    const rawImage = image || imageUrl || baseImage || base_image;
    const resolvedImage = resolveMediaUrl(rawImage);
    const targetList = hotspots.length > 0 ? hotspots : (items.length > 0 ? items : targets);

    const [activeTargetIndex, setActiveTargetIndex] = useState(null);
    const [discoveredTargets, setDiscoveredTargets] = useState(new Set());
    const completion = useScreenCompletion();
    const imageRef = useRef(null);

    function handleImageClick(e) {
        if (!imageRef.current || targetList.length === 0) return;

        const rect = imageRef.current.getBoundingClientRect();
        const clickXPx = e.clientX - rect.left;
        const clickYPx = e.clientY - rect.top;

        const clickXPercent = (clickXPx / rect.width) * 100;
        const clickYPercent = (clickYPx / rect.height) * 100;

        let matchedIndex = -1;

        matchedIndex = targetList.findIndex(t => {
            const posX = t.x !== undefined ? t.x : (t.position ? t.position.x : undefined);
            const posY = t.y !== undefined ? t.y : (t.position ? t.position.y : undefined);

            if (posX !== undefined && posY !== undefined) {
                // If coordinates are in absolute pixels (e.g. x: 101, y: 109 on a 500x300 canvas)
                if (posX > 100 || posY > 100) {
                    const dx = Math.abs(clickXPx - posX);
                    const dy = Math.abs(clickYPx - posY);
                    // Match within pixel radius bounding box or hotspot width/height
                    const hitWidth = (t.width || 80) / 2 + 30;
                    const hitHeight = (t.height || 80) / 2 + 30;
                    return dx <= hitWidth && dy <= hitHeight;
                } else {
                    // Percentage distance check with generous tolerance (~20%)
                    const dx = Math.abs(clickXPercent - posX);
                    const dy = Math.abs(clickYPercent - posY);
                    return dx <= 20 && dy <= 20;
                }
            }
            return false;
        });

        // Fallback: If target coordinates are missing or zero in CMS JSON data, reveal the next target step sequentially on click
        if (matchedIndex === -1) {
            const hasCoords = targetList.some(t => (t.x !== undefined && t.x !== 0) || (t.position && t.position.x !== 0));
            if (!hasCoords) {
                const nextUndiscovered = targetList.findIndex((_, idx) => !discoveredTargets.has(idx));
                if (nextUndiscovered !== -1) {
                    matchedIndex = nextUndiscovered;
                }
            }
        }

        if (matchedIndex !== -1) {
            setActiveTargetIndex(matchedIndex);
            setDiscoveredTargets(prev => {
                const next = new Set([...prev, matchedIndex]);
                if (next.size === targetList.length) {
                    completion?.reportAnswered(block.id);
                }
                completion?.saveAnswer?.(block.id, {
                    discoveredTargets: Array.from(next),
                    totalTargets: targetList.length
                });
                return next;
            });
        }
    }

    const activeItem = activeTargetIndex !== null ? targetList[activeTargetIndex] : null;

    return (
        <BlockCard type="hotspot_explorer">
            <div className="elab-hotspot-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", marginBottom: "2rem" }}>
                <BlockHeader
                    type="hotspot_explorer"
                    title={title}
                    subtitle={instruction}
                />

                {/* Base Background Image container */}
                <div 
                    onClick={handleImageClick}
                    style={{ 
                        position: "relative", 
                        width: "100%", 
                        borderRadius: "1rem", 
                        overflow: "hidden", 
                        border: "2px solid #e2e8f0", 
                        backgroundColor: "#f8fafc", 
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                        cursor: "pointer",
                        userSelect: "none",
                        WebkitUserSelect: "none"
                    }}
                >
                    <img
                        ref={imageRef}
                        src={resolvedImage}
                        alt={title}
                        onDragStart={(e) => e.preventDefault()}
                        style={{ 
                            width: "100%", 
                            height: "auto", 
                            display: "block", 
                            maxHeight: "360px", 
                            objectFit: "contain", 
                            margin: "0 auto",
                            userSelect: "none",
                            WebkitUserDrag: "none",
                            pointerEvents: "auto"
                        }}
                    />

                    {/* Exposed Hotspot Pin Badges directly overlaying the image once clicked/discovered */}
                    {targetList.map((target, index) => {
                        if (!discoveredTargets.has(index)) return null;

                        const posX = target.x !== undefined ? target.x : (target.position ? target.position.x : undefined);
                        const posY = target.y !== undefined ? target.y : (target.position ? target.position.y : undefined);
                        if (posX === undefined || posY === undefined) return null;

                        // Normalize coordinates to percentage if specified in pixels based on standard 500x300 canvas
                        const topPercent = posY > 100 ? (posY / 300) * 100 : posY;
                        const leftPercent = posX > 100 ? (posX / 500) * 100 : posX;

                        const targetName = target.name || target.title || target.label || target.text || `Target ${index + 1}`;
                        const isActive = activeTargetIndex === index;

                        const badgeColors = [
                            { bg: "#2563eb", border: "#93c5fd" },
                            { bg: "#dc2626", border: "#fca5a5" },
                            { bg: "#16a34a", border: "#86efac" },
                            { bg: "#9333ea", border: "#e9d5ff" },
                            { bg: "#ea580c", border: "#fdba74" }
                        ];
                        const circleColor = badgeColors[index % badgeColors.length];

                        return (
                            <div
                                key={`pin-${index}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTargetIndex(index);
                                }}
                                style={{
                                    position: "absolute",
                                    top: `${topPercent}%`,
                                    left: `${leftPercent}%`,
                                    transform: "translate(-50%, -50%)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    padding: "0.3rem 0.75rem 0.3rem 0.3rem",
                                    borderRadius: "9999px",
                                    background: isActive ? "#ffffff" : circleColor.bg,
                                    color: isActive ? circleColor.bg : "#ffffff",
                                    border: `2.5px solid ${isActive ? circleColor.bg : "#ffffff"}`,
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
                                    cursor: "pointer",
                                    zIndex: 10,
                                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    scale: isActive ? "1.1" : "1"
                                }}
                            >
                                <div style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    backgroundColor: isActive ? circleColor.bg : "#ffffff",
                                    color: isActive ? "#ffffff" : circleColor.bg,
                                    fontWeight: 800,
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'Poppins', sans-serif"
                                }}>
                                    {index + 1}
                                </div>
                                <span style={{ fontSize: "0.825rem", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>
                                    {targetName}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* All target chips displayed below image */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.25rem 0" }}>
                    {targetList.map((target, index) => {
                        const targetName = target.name || target.title || target.label || target.text || `Target ${index + 1}`;
                        const isDiscovered = discoveredTargets.has(index);
                        const isActive = activeTargetIndex === index;

                        const badgeColors = [
                            { bg: "#2563eb", border: "#93c5fd" },
                            { bg: "#dc2626", border: "#fca5a5" },
                            { bg: "#16a34a", border: "#86efac" },
                            { bg: "#9333ea", border: "#e9d5ff" },
                            { bg: "#ea580c", border: "#fdba74" }
                        ];
                        const circleColor = badgeColors[index % badgeColors.length];

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if (isDiscovered) {
                                        setActiveTargetIndex(index);
                                    }
                                }}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.4rem 1rem 0.4rem 0.4rem",
                                    borderRadius: "9999px",
                                    background: isDiscovered ? (isActive ? "#eff6ff" : "#f0fdf4") : "#ffffff",
                                    border: isDiscovered ? (isActive ? "2px solid #3b82f6" : "2px solid #22c55e") : "2px solid #cbd5e1",
                                    boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                                    cursor: isDiscovered ? "pointer" : "default",
                                    opacity: isDiscovered ? 1 : 0.8,
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{
                                    width: "26px",
                                    height: "26px",
                                    borderRadius: "50%",
                                    backgroundColor: circleColor.bg,
                                    color: "#ffffff",
                                    fontWeight: 800,
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'Poppins', sans-serif"
                                }}>
                                    {index + 1}
                                </div>
                                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                    {targetName}
                                </span>
                                {isDiscovered && (
                                    <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "0.85rem" }}>✓</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Target info popup card inside the board frame if discovered */}
                {activeItem && discoveredTargets.has(activeTargetIndex) && (activeItem.info || activeItem.description || activeItem.hint) && (
                    <div style={{
                        padding: "0.85rem 1.15rem",
                        borderRadius: "0.85rem",
                        background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
                        border: "1.5px solid #a5b4fc",
                        color: "#1e1b4b"
                    }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
                            💡 {activeItem.name || activeItem.title || `Target ${activeTargetIndex + 1}`}
                        </div>
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "#334155" }}>
                            {activeItem.info || activeItem.description || activeItem.hint}
                        </p>
                    </div>
                )}
            </div>
        </BlockCard>
    );
}

export default HotspotExplorerBlock;
