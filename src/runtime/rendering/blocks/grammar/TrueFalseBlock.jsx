import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeFactCheckUrl from "../../../samples/assets/images/badge_fact_check.png";
import boyReadingUrl from "../../../samples/assets/images/grammar_boy_reading.png";
import iconCheckUrl from "../../../samples/assets/images/grammar_icon_check.png";
import iconCrossUrl from "../../../samples/assets/images/grammar_icon_cross.png";

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
        <BlockCard type="true_false" className="elab-fact-check-card">
            <div className="elab-grammar-card-content">
                {/* Header */}
                <div className="elab-grammar-header">
                    <div className="elab-grammar-title-row">
                        <img src={badgeFactCheckUrl} className="elab-grammar-badge" alt="Badge" />
                        <span className="elab-grammar-title purple">FACT CHECK</span>
                    </div>
                </div>
                
                {/* Statement */}
                <p className="elab-fact-check-statement">{question}</p>
                
                {/* True/False Buttons Row */}
                <div className="elab-fact-check-options-row">
                    <button
                        onClick={() => choose(true)}
                        disabled={answer !== null}
                        className={`elab-tf-btn true-btn ${answer === true ? "is-selected" : ""}`}
                    >
                        <img src={iconCheckUrl} className="elab-tf-btn-icon" alt="Check" />
                        <span className="elab-tf-btn-text">TRUE</span>
                    </button>
                    
                    <button
                        onClick={() => choose(false)}
                        disabled={answer !== null}
                        className={`elab-tf-btn false-btn ${answer === false ? "is-selected" : ""}`}
                    >
                        <img src={iconCrossUrl} className="elab-tf-btn-icon" alt="Cross" />
                        <span className="elab-tf-btn-text">FALSE</span>
                    </button>
                </div>
            </div>

            {/* Right side Illustration */}
            <div className="elab-grammar-illustration">
                <img src={boyReadingUrl} className="elab-boy-reading-img" alt="Boy Reading" />
            </div>
        </BlockCard>
    );
}

export default TrueFalseBlock;
