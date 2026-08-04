import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

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

            <BlockHeader

                type="input"

                title="Short Answer"

                subtitle={question}

            />

            <input

                className="elab-input"

                value={answer}

                onChange={handleChange}

                placeholder={placeholder || "Type your answer..."}

            />

        </BlockCard>

    );

}

export default InputBlock;
