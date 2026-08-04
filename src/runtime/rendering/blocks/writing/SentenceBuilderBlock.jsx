import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function normalize(text) {

    return (text || "")

        .trim()

        .replace(/\s+/g, " ")

        .toLowerCase();

}

function SentenceBuilderBlock({ block }) {

    const {

        question,

        words = [],

        sentence

    } = block.content;

    const completion = useScreenCompletion();

    const [availableWords, setAvailableWords] = useState([]);

    const [selectedWords, setSelectedWords] = useState([]);

    useEffect(() => {

        shuffleWords();

    }, []);

    function shuffleWords() {

        const shuffled =

            [...words].sort(() => Math.random() - 0.5);

        setAvailableWords(shuffled);

    }

    function addWord(word, index) {

        setSelectedWords(prev => [

            ...prev,

            word

        ]);

        setAvailableWords(prev =>

            prev.filter((_, i) => i !== index)

        );

    }

    function removeWord(word, index) {

        setAvailableWords(prev => [

            ...prev,

            word

        ]);

        setSelectedWords(prev =>

            prev.filter((_, i) => i !== index)

        );

    }

    const answer =

        selectedWords.join(" ");

    const allWordsUsed =

        selectedWords.length === words.length && words.length > 0;

    const correct =

        allWordsUsed && normalize(answer) === normalize(sentence);

    const incorrect =

        allWordsUsed && !correct;

    useEffect(() => {

        if (correct) completion?.reportAnswered(block.id);

    }, [correct]);

    return (

        <BlockCard type="sentence">

            <BlockHeader

                type="sentence"

                title="Sentence Builder"

                subtitle={question}

            />

            <div className="elab-dropzone">

                {

                    selectedWords.length === 0 && (

                        <span className="elab-plain-text" style={{ fontStyle: "italic" }}>

                            Tap words below to build your sentence...

                        </span>

                    )

                }

                {

                    selectedWords.map(

                        (word, index) =>

                            <button

                                key={index}

                                className="elab-chip"

                                onClick={() =>

                                    removeWord(word, index)

                                }

                            >

                                {word}

                            </button>

                    )

                }

            </div>

            <div className="elab-chip-row">

                {

                    availableWords.map(

                        (word, index) =>

                            <button

                                key={index}

                                className="elab-chip"

                                onClick={() =>

                                    addWord(word, index)

                                }

                            >

                                {word}

                            </button>

                    )

                }

            </div>

            {

                answer.length > 0 && (

                    <p className="elab-plain-text">

                        <strong style={{ color: "var(--text-primary)" }}>Your Sentence: </strong>

                        {answer}

                    </p>

                )

            }

            {

                correct && (

                    <div className="elab-feedback success">

                        ✅ Correct!

                    </div>

                )

            }

            {

                incorrect && (

                    <div className="elab-feedback error">

                        ❌ Not quite — tap "Reset" and try again.

                    </div>

                )

            }

            {

                allWordsUsed && (

                    <button

                        type="button"

                        className="elab-btn-icon secondary"

                        onClick={() => {

                            setAvailableWords(prev => [...prev, ...selectedWords]);

                            setSelectedWords([]);

                        }}

                    >

                        ↺ Reset

                    </button>

                )

            }

        </BlockCard>

    );

}

export default SentenceBuilderBlock;
