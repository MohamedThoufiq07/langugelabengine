import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

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

            <BlockHeader

                type="writing_prompt"

                title="Writing"

                subtitle={prompt}

            />

            <textarea

                className="elab-input"

                rows={6}

                value={answer}

                onChange={handleChange}

                placeholder={placeholder || "Write your answer here..."}

                style={{ resize: "vertical", fontFamily: "inherit" }}

            />

            {minWords > 0 && (

                <p

                    style={{
                        fontSize: "13px",
                        color: "#6B7280",
                        marginTop: "8px"
                    }}

                >

                    {wordCount(answer)} / {minWords} words

                </p>

            )}

        </BlockCard>

    );

}

export default WritingBlock;
