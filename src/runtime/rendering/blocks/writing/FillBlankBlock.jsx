import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgePencil from "../../../samples/assets/images/grammar_badge_pencil.png";
import grammarGirlReading from "../../../samples/assets/images/grammar_girl_reading_new.png";

function FillBlankBlock({ block }) {

    const { sentence, text } = block.content;

    const [answer, setAnswer] = useState("");

    const completion = useScreenCompletion();

    function handleChange(e) {

        const value = e.target.value;

        setAnswer(value);

        if (value.trim().length > 0) {

            completion?.reportAnswered(block.id);

        }

    }

    const rawSentence = sentence || text || "";
    const displaySentence = rawSentence.replace(/\[([^\]]+)\]/g, "_______");

    return (

        <BlockCard type="fill_blank">

            <div className="grammar-custom-card-content reverse">
                <div className="grammar-custom-illustration">
                    <img src={grammarGirlReading} alt="Fill in the Blank Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    <div className="grammar-header">
                        <img src={grammarBadgePencil} className="grammar-badge" alt="Pencil Badge" />
                        <div className="grammar-title-banner fill-blank">FILL IN THE BLANK</div>
                    </div>

                    <h4 className="grammar-subtitle">
                        {question || "Complete the sentence."}
                    </h4>

                    {displaySentence && (
                        <p className="elab-plain-text" style={{ fontSize: "17px", fontWeight: 600, color: "#334155", margin: "4px 0" }}>
                            {displaySentence}
                        </p>
                    )}

                    <input
                        className="grammar-input"
                        value={answer}
                        onChange={handleChange}
                        placeholder="Type your answer..."
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default FillBlankBlock;
