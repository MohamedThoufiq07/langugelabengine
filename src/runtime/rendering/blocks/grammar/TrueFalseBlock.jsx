import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function TrueFalseBlock({ block }) {

    const { question } = block.content;

    const [answer, setAnswer] = useState(null);

    const completion = useScreenCompletion();

    function choose(value) {

        if (answer !== null) return;

        setAnswer(value);

        completion?.reportAnswered(block.id);

    }

    return (

        <BlockCard type="true_false">

            <BlockHeader

                type="true_false"

                title="True or False"

                subtitle={question}

            />

            <div className="elab-chip-row">

                <button
                    onClick={() => choose(true)}
                    disabled={answer !== null}
                    className={`elab-option ${answer === true ? "is-selected" : ""}`}
                    style={{ flex: 1 }}
                >
                    True
                </button>

                <button
                    onClick={() => choose(false)}
                    disabled={answer !== null}
                    className={`elab-option ${answer === false ? "is-selected" : ""}`}
                    style={{ flex: 1 }}
                >
                    False
                </button>

            </div>

        </BlockCard>

    );

}

export default TrueFalseBlock;
