import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function FillBlankBlock({ block }) {

    const { sentence } = block.content;

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

        <BlockCard type="fill_blank">

            <BlockHeader

                type="fill_blank"

                title="Fill in the Blank"

                subtitle="Complete the sentence"

            />

            <p className="elab-plain-text" style={{ fontSize: "17px" }}>{sentence}</p>

            <input

                className="elab-input"

                value={answer}

                onChange={handleChange}

                placeholder="Type your answer..."

            />

        </BlockCard>

    );

}

export default FillBlankBlock;
