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

            <div className="elab-media-frame">

                <img

                    src={url}

                    alt={caption || "Image"}

                />

            </div>

            {caption &&

                <p className="elab-caption">{caption}</p>

            }

        </BlockCard>

    );

}

export default ImageBlock;
