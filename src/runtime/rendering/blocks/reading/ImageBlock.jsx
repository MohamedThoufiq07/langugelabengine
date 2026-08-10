import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function ImageBlock({ block }) {
    const { url, caption } = block.content;

    return (
        <BlockCard type="image">
            <BlockHeader
                type="image"
                title="Image"
            />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0.25rem" }}>
                <img
                    src={url || null}
                    alt={caption || "Content Image"}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }}
                />
                {caption && (
                    <p style={{ marginTop: "8px", fontSize: "14px", color: "#64748b", textAlign: "center" }}>{caption}</p>
                )}
            </div>
        </BlockCard>
    );
}

export default ImageBlock;
