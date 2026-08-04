import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function GrammarCorrectionBlock({ block }) {

    const { incorrectSentence } = block.content;

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

        <BlockCard type="grammar_correction">

            <BlockHeader

                type="grammar_correction"

                title="Find and Fix the Error"

                subtitle="Rewrite the sentence correctly"

            />

            <p className="elab-plain-text" style={{ fontSize: "17px" }}>

                {incorrectSentence}

            </p>

            <input

                className="elab-input"

                value={answer}

                onChange={handleChange}

                placeholder="Type the corrected sentence..."

            />

        </BlockCard>

    );

}

export default GrammarCorrectionBlock;
