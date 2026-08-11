import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import shortAnswerBadge from "../../../../assets/images/speaking_short_answer_badge.png";
import girlWritingImg from "../../../../assets/images/speaking_girl_writing.png";

function InputBlock({ block }) {

    const { question, placeholder } = block.content;

    const [answer, setAnswer] = useState("");

    const completion = useScreenCompletion();

    function handleChange(e) {

        const value = e.target.value;

        setAnswer(value);

        if (value.trim().length > 0) {

            completion?.reportAnswered(block.id);

        }

    }

    return (

        <BlockCard type="input">

            <div className="speaking-custom-card-content">
                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle input">
                            <img src={shortAnswerBadge} className="speaking-badge-img" alt="Short Answer" />
                        </div>
                        <div className="speaking-badge-tag input">
                            SHORT ANSWER
                        </div>
                    </div>

                    {question && (
                        <p className="elab-block-subtitle" style={{ margin: "0.25rem 0", color: "#475569", fontWeight: 600 }}>
                            {question}
                        </p>
                    )}

                    <div className="speaking-divider-dashed input">
                        <span className="speaking-divider-dot input" />
                    </div>

                    <textarea
                        className="speaking-custom-textarea"
                        value={answer}
                        onChange={handleChange}
                        placeholder={placeholder || "Type your answer here..."}
                        rows={2}
                    />
                </div>

                <div className="speaking-custom-illustration">
                    <img 
                        src={girlWritingImg} 
                        alt="Short Answer Illustration" 
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default InputBlock;

