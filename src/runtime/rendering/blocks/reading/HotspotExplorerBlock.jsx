import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeUrl from "../../../../assets/images/badge_reading.png";

function HotspotExplorerBlock({ block }) {
    const {
        image,
        imageUrl,
        title = "Explore the Image",
        hotspots = [],
        instruction = "Click on different areas to learn more"
    } = block.content;
    const resolvedImage = image || imageUrl;

    const [activeHotspot, setActiveHotspot] = useState(null);
    const [discoveredHotspots, setDiscoveredHotspots] = useState(new Set());
    const completion = useScreenCompletion();

    function handleHotspotClick(index, hotspot) {
        setActiveHotspot(index);
        setDiscoveredHotspots(prev => new Set([...prev, index]));

        // Report progress
        if (discoveredHotspots.size + 1 === hotspots.length) {
            completion?.reportAnswered(block.id);
        }

        completion?.saveAnswer?.(block.id, {
            discoveredHotspots: Array.from([...discoveredHotspots, index]),
            totalHotspots: hotspots.length
        });
    }

    return (
        <BlockCard type="hotspot_explorer">
            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="hotspot_explorer"
                        title={title}
                        subtitle={instruction}
                    />

                    <div className="hotspot-progress">
                        <span className="progress-text">
                            Discovered: {discoveredHotspots.size} / {hotspots.length}
                        </span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(discoveredHotspots.size / hotspots.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>

                    <div className="hotspot-image-container">
                        <img
                            src={resolvedImage}
                            alt={title}
                            className="hotspot-main-image"
                            useMap="#hotspotMap"
                        />
                        <map name="hotspotMap">
                            {hotspots.map((hotspot, index) => (
                                <area
                                    key={index}
                                    shape="circle"
                                    coords={`${hotspot.x},${hotspot.y},${hotspot.radius || 30}`}
                                    alt={hotspot.title}
                                    onClick={() => handleHotspotClick(index, hotspot)}
                                    className={`hotspot-area ${discoveredHotspots.has(index) ? "discovered" : ""}`}
                                    title={hotspot.title}
                                />
                            ))}
                        </map>

                        {/* Visual indicators for hotspots */}
                        {hotspots.map((hotspot, index) => (
                            <div
                                key={`indicator-${index}`}
                                className={`hotspot-indicator ${discoveredHotspots.has(index) ? "discovered" : ""}`}
                                style={{
                                    left: `${hotspot.x}px`,
                                    top: `${hotspot.y}px`
                                }}
                                onClick={() => handleHotspotClick(index, hotspot)}
                            >
                                <div className="hotspot-pulse" />
                                <span className="hotspot-number">{index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="elab-block-content-side">
                    {activeHotspot !== null && hotspots[activeHotspot] && (
                        <div className="hotspot-details">
                            <h4 className="hotspot-title">
                                {hotspots[activeHotspot].title}
                            </h4>
                            <div className="hotspot-content">
                                {hotspots[activeHotspot].description && (
                                    <p>{hotspots[activeHotspot].description}</p>
                                )}
                                {hotspots[activeHotspot].audio && (
                                    <div className="elab-media-frame">
                                        <audio
                                            src={hotspots[activeHotspot].audio}
                                            controls
                                            className="elab-media-player"
                                        />
                                    </div>
                                )}
                                {hotspots[activeHotspot].image && (
                                    <img
                                        src={hotspots[activeHotspot].image}
                                        alt={hotspots[activeHotspot].title}
                                        className="hotspot-detail-image"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {activeHotspot === null && (
                        <div className="hotspot-placeholder">
                            <p>Click on the image to discover more</p>
                        </div>
                    )}

                    <div className="hotspot-list">
                        <h5>Items to Discover:</h5>
                        <ul>
                            {hotspots.map((hotspot, index) => (
                                <li
                                    key={index}
                                    className={`hotspot-list-item ${discoveredHotspots.has(index) ? "discovered" : ""}`}
                                    onClick={() => handleHotspotClick(index, hotspot)}
                                >
                                    <span className="list-number">{index + 1}</span>
                                    <span className="list-title">{hotspot.title}</span>
                                    {discoveredHotspots.has(index) && (
                                        <span className="list-check">✓</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default HotspotExplorerBlock;
