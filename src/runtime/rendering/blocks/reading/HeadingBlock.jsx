import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function HeadingBlock({ block }) {

    const {

        text,
        tag = "H2"

    } = block.content;

    const Tag = (tag || "H2").toLowerCase();

    // Determine width and alignment based on block.styles if available
    const blockWidth = block.styles?.blockWidth || "auto";
    const alignment = (block.styles?.alignment || "Center").toLowerCase();
    
    // Map text alignment to flex alignments for container
    const justifyValue = alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center";

    return (
        <div 
            className="elab-heading-block-wooden-board" 
            style={{ 
                width: "100%", 
                margin: "4px 0 10px 0",
                padding: 0,
                display: "flex",
                justifyContent: justifyValue
            }}
        >
            <Tag 
                style={{ 
                    margin: 0, 
                    fontWeight: block.styles?.fontWeight || "bold", 
                    backgroundImage: "var(--theme-heading-board, url('/locked board.png'))",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    color: "#ffffff", 
                    border: "none", 
                    boxShadow: "none",
                    fontSize: block.styles?.fontSize || "20px",
                    textAlign: "center",
                    width: "fit-content",
                    maxWidth: "90%",
                    minWidth: "150px",
                    height: "48px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 30px",
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
