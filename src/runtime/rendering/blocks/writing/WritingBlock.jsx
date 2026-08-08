import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgeWriting from "../../../samples/assets/images/grammar_badge_writing.png";
import grammarBoyWriting from "../../../samples/assets/images/grammar_boy_writing_new.png";

function WritingBlock({ block }) {

    const {
        prompt,
        placeholder,
        minWords = 0

    } = block.content;

    const [answer, setAnswer] = useState("");

    const completion = useScreenCompletion();

    function wordCount(value) {

        return value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length;

    }

    function handleChange(e) {

        const value = e.target.value;

        setAnswer(value);

        if (wordCount(value) >= minWords && wordCount(value) > 0) {

            completion?.reportAnswered(block.id);

        }

    }

    return (

        <BlockCard type="writing_prompt">

            <div className="grammar-custom-card-content">
                <div className="grammar-custom-illustration">
                    <img src={grammarBoyWriting} alt="Writing Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    <div className="grammar-header">
                        <img src={grammarBadgeWriting} className="grammar-badge" alt="Writing Badge" />
                        <div className="grammar-title-banner writing">WRITING</div>
                    </div>

                    <h4 className="grammar-subtitle">
                        Write about your <span className="blue">favorite hobby</span>.
                    </h4>

                    <div className="grammar-textarea-container">
                        <textarea
                            className="grammar-textarea"
                            value={answer}
                            onChange={handleChange}
                            placeholder={placeholder || "Start writing here..."}
                        />

                        {minWords > 0 && (
                            <div className="grammar-word-counter-row">
                                <div className="grammar-word-counter-icon">Aa</div>
                                <span className="grammar-word-counter-text">
                                    {wordCount(answer)} / {minWords} words
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </BlockCard>

    );

}

export default WritingBlock;
