import BlockCard from "../../../ui/components/BlockCard";
import imageCardOverlayUrl from "../../../samples/assets/images/image_card_overlay.png";

function ImageBlock({ block }) {
    const { url, caption } = block.content;

    return (
        <BlockCard type="image" className="elab-image-block-custom-card">
            {/* Absolute positioned stickers overlay */}
            <img src={imageCardOverlayUrl} className="elab-image-card-decor-overlay" alt="Decorations" />

            {/* Browser Mockup Content wrapper - aligned perfectly behind overlay opening */}
            <div className="elab-browser-mockup-content-wrapper">
                <img
                    src={url}
                    className="elab-browser-image"
                    alt={caption || "Browser Content"}
                />
            </div>

            {caption &&
                <p className="elab-caption">{caption}</p>
            }
        </BlockCard>
    );
}

export default ImageBlock;
