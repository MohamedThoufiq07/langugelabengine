import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function HeadingBlock({ block }) {

    const {

        text,
        tag = "H2"

    } = block.content;

    const Tag = (tag || "H2").toLowerCase();

    return (

        <BlockCard type="heading">

            <BlockHeader

                type="heading"

                title="Heading"

            />

            <Tag style={{ margin: 0 }}>

                {text}

            </Tag>

        </BlockCard>

    );

}

export default HeadingBlock;
