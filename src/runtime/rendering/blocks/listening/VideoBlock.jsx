import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function VideoBlock({ block }) {

    return (

        <BlockCard type="video">

            <BlockHeader

                type="video"

                title="Video"

            />

            <div className="elab-media-frame">

                <video

                    controls

                    src={block.content.url}

                />

            </div>

        </BlockCard>

    );

}

export default VideoBlock;
