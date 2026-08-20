import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import grammarBadgeWriting from "../../../../assets/images/grammar_badge_writing.png";
import grammarBoyWriting from "../../../../assets/images/grammar_boy_writing_new.png";

function WritingBlock({ block }) {

    const {
        prompt,
        placeholder,
        minWords = 0,
        sentenceStarters = [],
        sentenceStarterMode = false

    } = block.content;

    const [answer, setAnswer] = useState("");
    const [selectedStarter, setSelectedStarter] = useState("");
    const [usingSentenceStarter, setUsingSentenceStarter] = useState(sentenceStarterMode);

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

    function applySentenceStarter(starter) {
        setSelectedStarter(starter);
        setAnswer(starter + " ");
    }

    return (

        <BlockCard type="writing_prompt">

            <div className="grammar-custom-card-content">
                <div className="grammar-custom-illustration">
                    <img src={grammarBoyWriting} alt="Writing Illustration" />
                </div>

                <div className="grammar-custom-interactive">
                    <div className="grammar-header">
                        <img src={grammarBadgeWriting} className="grammar-badge" alt="Writing Badge" />
                        <div className="grammar-title-banner writing">WRITING</div>
                    </div>

                    <h4 className="grammar-subtitle">
                        {prompt || question || "Write about your favorite hobby."}
                    </h4>

                    {sentenceStarters && sentenceStarters.length > 0 && (
                        <div className="sentence-starter-section">
                            <label className="starter-mode-toggle">
                                <input 
                                    type="checkbox" 
                                    checked={usingSentenceStarter}
                                    onChange={(e) => setUsingSentenceStarter(e.target.checked)}
                                    className="toggle-input"
                                />
                                <span className="toggle-text">Use Sentence Starters</span>
                            </label>

                            {usingSentenceStarter && (
                                <div className="sentence-starters-list">
                                    <p className="starters-label">Pick a sentence starter:</p>
                                    <div className="starters-grid">
                                        {sentenceStarters.map((starter, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => applySentenceStarter(starter)}
                                                className={`starter-btn ${selectedStarter === starter ? "is-selected" : ""}`}
                                            >
                                                {starter}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grammar-textarea-container">
                        <textarea
                            className="grammar-textarea"
                            value={answer}
                            onChange={handleChange}
                            placeholder={placeholder || "Start writing here..."}
                        />

                        {minWords > 0 && (
                            <div className="grammar-word-counter-row">
                                <div className="grammar-word-counter-icon">Aa</div>
                                <span className="grammar-word-counter-text">
                                    {wordCount(answer)} / {minWords} words
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </BlockCard>

    );

}

export default WritingBlock;
