import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function ImageBlock({ block }) {
    const { url, caption } = block.content;
    const jsonStyles = block.styles || {};

    const cardStyle = {
        width: jsonStyles.blockWidth ? jsonStyles.blockWidth : "933px",
        minHeight: jsonStyles.minHeight ? jsonStyles.minHeight : "auto",
        margin: "0 auto"
    };

    return (
        <BlockCard type="image" className="elab-media-card" style={cardStyle}>
            <BlockHeader
                type="image"
                title="Image"
            />
            <div className="elab-media-card-content">
                <img
                    src={url || null}
                    alt={caption || "Content Image"}
                    className="elab-media-card-element"
                />
                {caption && (
                    <p className="elab-media-card-caption">{caption}</p>
                )}
            </div>
        </BlockCard>
    );
}

export default ImageBlock;
