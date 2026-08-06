import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function ReadingBlock({ block }) {

    const {
        title,
        passage,
        question

    } = block.content;

    const [confirmed, setConfirmed] = useState(false);

    const completion = useScreenCompletion();

    function handleConfirm() {

        setConfirmed(true);

        completion?.reportAnswered(block.id);

    }

    return (

        <BlockCard type="reading_passage">

            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="reading_passage"
                        title={title || "Reading Passage"}
                        subtitle={question || "Read the passage carefully"}
                    />

                    <p
                        style={{
                            fontSize: "17px",
                            color: "#374151",
                            lineHeight: 1.8,
                            margin: 0,
                            whiteSpace: "pre-wrap"
                        }}
                    >
                        {passage}
                    </p>

                    <button
                        className="elab-btn-icon"
                        disabled={confirmed}
                        onClick={handleConfirm}
                        style={{ marginTop: "12px" }}
                    >
                        {confirmed ? "✔ Marked as read" : "I've finished reading"}
                    </button>
                </div>

                <div className="elab-block-illustration-side">
                    <img 
                        src="/assets/reading para and memory game.jpeg" 
                        alt="Reading Passage Illustration" 
                        className="elab-block-illustration-image elab-crop-reading"
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default ReadingBlock;
