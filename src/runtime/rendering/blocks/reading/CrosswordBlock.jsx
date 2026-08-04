import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function CrosswordBlock({ block }) {

    const {

        question,

        entries = []

    } = block.content;

    const [answers, setAnswers] = useState({});

    function updateAnswer(number, value) {

        setAnswers(prev => ({

            ...prev,

            [number]: value

        }));

    }

    function isCorrect(entry) {

        return (

            answers[entry.number]?.toUpperCase()

            ===

            entry.answer.toUpperCase()

        );

    }

    return (

        <BlockCard type="crossword">

            <BlockHeader

                type="crossword"

                title="Crossword"

                subtitle={question}

            />

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {

                    entries.map(entry => (

                        <div

                            key={entry.number}

                            style={{

                                border: "1.5px solid var(--border)",

                                padding: 16,

                                borderRadius: 14,

                                display: "flex",

                                flexDirection: "column",

                                gap: "10px"

                            }}

                        >

                            <strong style={{ color: "var(--text-primary)" }}>

                                {entry.number}

                                {" "}

                                <span style={{ fontWeight: 500, color: "var(--text-secondary)", textTransform: "capitalize" }}>

                                    ({entry.direction})

                                </span>

                            </strong>

                            <p className="elab-plain-text">

                                {entry.clue}

                            </p>

                            <input

                                className="elab-input"

                                value={

                                    answers[entry.number] || ""

                                }

                                onChange={(e) =>

                                    updateAnswer(

                                        entry.number,

                                        e.target.value

                                    )

                                }

                            />

                            {

                                answers[entry.number] &&

                                (

                                    isCorrect(entry)

                                        ?

                                    <div className="elab-feedback success">✅ Correct</div>

                                        :

                                    <div className="elab-feedback error">❌ Try Again</div>

                                )

                            }

                        </div>

                    ))

                }

            </div>

        </BlockCard>

    );

}

export default CrosswordBlock;
