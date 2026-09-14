import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function HeadingBlock({ block }) {

    const {
        text,
        tag = "H2"
    } = block?.content || {};

    const Tag = (tag || "H2").toLowerCase();
    const styles = block?.styles || {};

    // Determine width and alignment based on block.styles if available
    const alignment = (styles.alignment || "Center").toLowerCase();
    
    // Map text alignment to flex alignments for container
    const justifyValue = alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center";

    const fontFamily = styles.fontFamily || "inherit";
    const fontSize = styles.fontSize || "24px";
    const fontWeight = styles.fontWeight || "bold";
    const color = styles.color || styles.textColor || "#ffffff";

    return (
        <div 
            className="elab-heading-block-wooden-board" 
            style={{ 
                width: "100%", 
                margin: "8px 0 14px 0",
                padding: 0,
                display: "flex",
                justifyContent: justifyValue
            }}
        >
            <Tag 
                style={{ 
                    margin: 0, 
                    fontWeight: fontWeight, 
                    fontFamily: fontFamily,
                    backgroundImage: "var(--theme-heading-board, url('/locked board.png'))",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    color: color, 
                    border: "none", 
                    boxShadow: "none",
                    fontSize: fontSize,
                    textAlign: alignment,
                    width: "fit-content",
                    maxWidth: "95%",
                    minWidth: "240px",
                    minHeight: "56px",
                    height: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 48px",
                    boxSizing: "border-box",
                    whiteSpace: "nowrap"
                }}
            >
                {text}
            </Tag>
        </div>
    );

}

export default HeadingBlock;
