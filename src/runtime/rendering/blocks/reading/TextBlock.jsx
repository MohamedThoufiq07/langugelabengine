import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function TextBlock({ block }) {

    const {
        text,
        size = "18px",
        color = "#374151",
        weight = 400
    } = block?.content || {};

    const styles = block?.styles || {};

    const fontSize = styles.fontSize || size;
    const textColor = styles.color || styles.textColor || color;
    const fontWeight = styles.fontWeight || weight;
    const fontFamily = styles.fontFamily || "inherit";
    const textAlign = (styles.alignment || "left").toLowerCase();

    return (

        <BlockCard type="text" className="elab-reading-text-card">

            <BlockHeader
                type="text"
                title="Reading"
            />

            <p
                style={{
                    fontSize: fontSize,
                    color: textColor,
                    fontWeight: fontWeight,
                    fontFamily: fontFamily,
                    textAlign: textAlign,
                    lineHeight: 1.8,
                    margin: 0
                }}
            >
                {text}
            </p>

        </BlockCard>

    );

}

export default TextBlock;
