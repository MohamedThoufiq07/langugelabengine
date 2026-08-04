import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function TextBlock({ block }) {

    const {

        text,
        size = "18px",
        color = "#374151",
        weight = 400

    } = block.content;

    return (

        <BlockCard type="text">

            <BlockHeader

                type="text"

                title="Reading"

            />

            <p
                style={{
                    fontSize: size,
                    color,
                    fontWeight: weight,
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