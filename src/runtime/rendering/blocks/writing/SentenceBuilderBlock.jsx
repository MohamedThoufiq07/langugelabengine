import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Public-folder image — served directly by Vite from /public
const grammarBoyPuzzle = "/sentence builder img.png";

function normalize(text) {
    return (text || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

/**
 * One sentence puzzle — renders word chips the student taps to arrange.
 */
function SentencePuzzle({ item, index, total, onCorrect, isAssessment }) {
    const { question, words = [], sentence } = item;

    const [availableWords, setAvailableWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        setAvailableWords([...words].sort(() => Math.random() - 0.5));
        setSelectedWords([]);
        setSolved(false);
    }, [words]);

    function addWord(word, index) {
        setSelectedWords((prev) => [...prev, word]);
        setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    }

    function removeWord(word, index) {
        setAvailableWords((prev) => [...prev, word]);
        setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    }

    const answer = selectedWords.join(" ");
    const allWordsUsed = selectedWords.length === words.length && words.length > 0;
    const correct = allWordsUsed && normalize(answer) === normalize(sentence);
    const incorrect = allWordsUsed && !correct;

    useEffect(() => {
        if (correct && !solved) {
            setSolved(true);
            onCorrect(index);
        }
    }, [correct]);

    return (
        <div
            style={{
                background: "#f0f9ff",
                border: "1.5px solid #bae6fd",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "14px",
            }}
        >
            {total > 1 && (
                <div
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#0369a1",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                    }}
                >
                    Sentence {index + 1} of {total}
                </div>
            )}

            <h4
                style={{
                    margin: "0 0 10px 0",
                    fontSize: "0.88rem",
                    color: "#1e293b",
                    fontWeight: 600,
                }}
            >
                {question || "Reorder the words to make a correct sentence."}
            </h4>

            {/* Drop zone */}
            <div className="grammar-dropzone" style={{ minHeight: "44px", marginBottom: "10px" }}>
                {selectedWords.length === 0 && (
                    <span className="grammar-dropzone-placeholder">
                        Tap words below to build your sentence…
                    </span>
                )}
                {selectedWords.map((word, i) => (
                    <button
                        key={i}
                        className="grammar-chip"
                        onClick={() => !solved && removeWord(word, i)}
                        style={{ opacity: solved ? 0.75 : 1 }}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Available chips */}
            <div className="grammar-chip-row">
                {availableWords.map((word, i) => (
                    <button
                        key={i}
                        className="grammar-chip"
                        onClick={() => !solved && addWord(word, i)}
                        style={{ opacity: solved ? 0.5 : 1 }}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Feedback */}
            {correct && !isAssessment && (
                <div className="elab-feedback success" style={{ marginTop: "8px" }}>
                    ✅ Correct!
                </div>
            )}
            {incorrect && !isAssessment && (
                <div className="elab-feedback error" style={{ marginTop: "8px" }}>
                    ❌ Not quite — tap a word to put it back and try again.
                </div>
            )}

            {/* Reset */}
            {allWordsUsed && !solved && (
                <button
                    type="button"
                    className="grammar-reset-btn"
                    onClick={() => {
                        setAvailableWords((prev) => [...prev, ...selectedWords]);
                        setSelectedWords([]);
                    }}
                    style={{ marginTop: "8px" }}
                >
                    ↺ Reset
                </button>
            )}
        </div>
    );
}

function SentenceBuilderBlock({ block }) {
    const completion = useScreenCompletion();
    const isAssessment = !!window.__isAssessment;

    // Support both:
    //   content.sentences = [{ question, words, sentence }, ...]  ← multi-item (JSON format)
    //   content.{ question, words, sentence }                     ← legacy single item
    const rawSentences = block.content?.sentences;
    const sentences =
        rawSentences && rawSentences.length > 0
            ? rawSentences
            : [
                  {
                      question: block.content?.question || "",
                      words: block.content?.words || [],
                      sentence: block.content?.sentence || "",
                  },
              ];

    const [solvedSet, setSolvedSet] = useState(() => new Set());

    function handleCorrect(index) {
        setSolvedSet((prev) => {
            const next = new Set(prev);
            next.add(index);
            if (next.size === sentences.length) {
                completion?.reportAnswered(block.id);
            }
            return next;
        });
    }

    return (
        <BlockCard type="sentence">
            <div className="grammar-custom-card-content">
                {/* Illustration */}
                <div className="grammar-custom-illustration">
                    <img src={grammarBoyPuzzle} alt="Sentence Builder Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    {/* Header */}
                    <div className="grammar-header">
                        <div className="grammar-title-banner sentence-builder">
                            SENTENCE BUILDER
                        </div>
                    </div>

                    {/* Progress badge */}
                    {sentences.length > 1 && (
                        <div
                            style={{
                                fontSize: "0.75rem",
                                color: "#475569",
                                marginBottom: "8px",
                                fontWeight: 600,
                            }}
                        >
                            {solvedSet.size} / {sentences.length} solved
                        </div>
                    )}

                    {/* All sentence puzzles */}
                    {sentences.map((item, i) => (
                        <SentencePuzzle
                            key={i}
                            item={item}
                            index={i}
                            total={sentences.length}
                            onCorrect={handleCorrect}
                            isAssessment={isAssessment}
                        />
                    ))}
                </div>
            </div>
        </BlockCard>
    );
}

export default SentenceBuilderBlock;
