import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function HeadingBlock({ block }) {

    const {

        text,
        tag = "H2"

    } = block.content;

    const Tag = (tag || "H2").toLowerCase();

    return (

        <div className="elab-heading-block-transparent" style={{ width: "100%", margin: "0.5rem 0", padding: "0.25rem 0" }}>

            <Tag style={{ margin: 0, fontWeight: "bold", background: "transparent", color: "inherit", border: "none", boxShadow: "none" }}>

                {text}

            </Tag>

        </div>

    );

}

export default HeadingBlock;
