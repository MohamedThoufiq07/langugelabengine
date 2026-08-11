import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgePuzzle from "../../../../assets/images/grammar_badge_puzzle.png";
import grammarBoyPuzzle from "../../../../assets/images/grammar_boy_puzzle_new.png";

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

            <div className="grammar-custom-card-content">
                <div className="grammar-custom-illustration">
                    <img src={grammarBoyPuzzle} alt="Sentence Builder Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    <div className="grammar-header">
                        <img src={grammarBadgePuzzle} className="grammar-badge" alt="Puzzle Badge" />
                        <div className="grammar-title-banner sentence-builder">SENTENCE BUILDER</div>
                    </div>

                    <h4 className="grammar-subtitle">
                        {question || "Reorder the words to make a correct sentence."}
                    </h4>

                    <div className="grammar-dropzone">
                        {
                            selectedWords.length === 0 && (
                                <span className="grammar-dropzone-placeholder">
                                    Tap words below to build your sentence...
                                </span>
                            )
                        }

                        {
                            selectedWords.map((word, index) => (
                                <button
                                    key={index}
                                    className="grammar-chip"
                                    onClick={() => removeWord(word, index)}
                                >
                                    {word}
                                </button>
                            ))
                        }
                    </div>

                    <div className="grammar-chip-row">
                        {
                            availableWords.map((word, index) => (
                                <button
                                    key={index}
                                    className="grammar-chip"
                                    onClick={() => addWord(word, index)}
                                >
                                    {word}
                                </button>
                            ))
                        }
                    </div>

                    {
                        answer.length > 0 && (
                            <p className="grammar-result-text">
                                <strong>Your Sentence: </strong>{answer}
                            </p>
                        )
                    }

                    {
                        correct && !window.__isAssessment && (
                            <div className="elab-feedback success" style={{ margin: "4px 0 0 0" }}>
                                ✅ Correct!
                            </div>
                        )
                    }

                    {
                        incorrect && !window.__isAssessment && (
                            <div className="elab-feedback error" style={{ margin: "4px 0 0 0" }}>
                                ❌ Not quite — tap "Reset" and try again.
                            </div>
                        )
                    }

                    {
                        allWordsUsed && (
                            <button
                                type="button"
                                className="grammar-reset-btn"
                                onClick={() => {
                                    setAvailableWords(prev => [...prev, ...selectedWords]);
                                    setSelectedWords([]);
                                }}
                            >
                                ↺ Reset
                            </button>
                        )
                    }
                </div>
            </div>

        </BlockCard>

    );

}

export default SentenceBuilderBlock;
