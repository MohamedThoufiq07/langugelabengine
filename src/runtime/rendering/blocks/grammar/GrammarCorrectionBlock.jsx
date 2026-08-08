import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeSentenceFixerUrl from "../../../samples/assets/images/badge_sentence_fixer.png";
import boyWritingUrl from "../../../samples/assets/images/grammar_boy_writing.png";

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
        <BlockCard type="grammar_correction" className="elab-sentence-fixer-card">
            <div className="elab-grammar-card-content">
                {/* Header */}
                <div className="elab-grammar-header">
                    <div className="elab-grammar-title-row">
                        <img src={badgeSentenceFixerUrl} className="elab-grammar-badge" alt="Badge" />
                        <span className="elab-grammar-title green">SENTENCE FIXER</span>
                    </div>
                    <p className="elab-grammar-subtitle">Rewrite the sentence correctly.</p>
                </div>
                
                {/* Incorrect Sentence Box */}
                <div className="elab-incorrect-sentence-box">
                    {incorrectSentence}
                </div>
                
                {/* Text input with pencil icon */}
                <div className="elab-grammar-input-container">
                    <span className="elab-grammar-input-icon">✏️</span>
                    <input
                        className="elab-grammar-input-field"
                        value={answer}
                        onChange={handleChange}
                        placeholder="Type the corrected sentence..."
                    />
                </div>
            </div>

            {/* Right side Illustration */}
            <div className="elab-grammar-illustration">
                <img src={boyWritingUrl} className="elab-boy-writing-img" alt="Boy Writing" />
            </div>
        </BlockCard>
    );
}

export default GrammarCorrectionBlock;
