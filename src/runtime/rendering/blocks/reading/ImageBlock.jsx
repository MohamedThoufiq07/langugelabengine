import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { resolveMediaUrl } from "../../services/MediaResolver";
import defaultImageFallback from "../../../../assets/images/reading_boy_magnifying.png";

function ImageBlock({ block }) {
    const content = block?.content || {};
    const { caption } = content;
    const jsonStyles = block?.styles || {};

    const resolvedUrl = resolveMediaUrl(content);
    const [imgSrc, setImgSrc] = useState(resolvedUrl || defaultImageFallback);

    useEffect(() => {
        const url = resolveMediaUrl(block?.content);
        setImgSrc(url || defaultImageFallback);
    }, [block]);

    const cardStyle = {
        width: "100%",
        maxWidth: "100%",
        minHeight: jsonStyles.minHeight ? jsonStyles.minHeight : "auto",
        margin: "0 auto",
        boxSizing: "border-box"
    };

    return (
        <BlockCard type="image" className="elab-media-card" style={cardStyle}>
            <BlockHeader
                type="image"
                title="Image"
            />
            <div className="elab-media-card-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0", overflow: "hidden" }}>
                <img
                    src={imgSrc}
                    alt={caption || "Lesson Content Image"}
                    onError={() => {
                        if (imgSrc !== defaultImageFallback) {
                            setImgSrc(defaultImageFallback);
                        }
                    }}
                    className="elab-media-card-element"
                    style={{ width: "100%", maxWidth: "100%", maxHeight: "420px", borderRadius: "14px", objectFit: "contain", display: "block" }}
                />
                {caption && (
                    <p className="elab-media-card-caption" style={{ marginTop: "8px", marginBottom: "0", textAlign: "center", fontWeight: "700" }}>{caption}</p>
                )}
            </div>
        </BlockCard>
    );
}

export default ImageBlock;
