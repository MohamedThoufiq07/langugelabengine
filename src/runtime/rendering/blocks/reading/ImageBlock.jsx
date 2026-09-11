import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function ImageBlock({ block }) {
    const { url, caption } = block.content;
    const jsonStyles = block.styles || {};

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
            <div className="elab-media-card-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", overflow: "hidden" }}>
                <img
                    src={url || null}
                    alt={caption || "Content Image"}
                    className="elab-media-card-element"
                    style={{ width: "100%", maxWidth: "100%", height: "auto", borderRadius: "12px", objectFit: "contain" }}
                />
                {caption && (
                    <p className="elab-media-card-caption">{caption}</p>
                )}
            </div>
        </BlockCard>
    );
}

export default ImageBlock;
