import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeFactCheckUrl from "../../../../assets/images/badge_fact_check.png";
import boyReadingUrl from "../../../../assets/images/grammar_boy_reading.png";
import iconCheckUrl from "../../../../assets/images/grammar_icon_check.png";
import iconCrossUrl from "../../../../assets/images/grammar_icon_cross.png";

function TrueFalseBlock({ block }) {
    const { question } = block.content;
    const completion = useScreenCompletion();
    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const [answer, setAnswer] = useState(savedAnswer !== null ? savedAnswer : null);

    const isAssessment = window.__isAssessment;

    useEffect(() => {
        if (savedAnswer !== null) {
            completion?.reportAnswered(block.id);
        }
    }, [savedAnswer]);

    function choose(value) {
        if (answer !== null && !isAssessment) return;
        setAnswer(value);
        completion?.saveAnswer?.(block.id, value);
        completion?.reportAnswered(block.id);
    }

    return (
        <BlockCard type="true_false" className="elab-fact-check-card">
            <div className="elab-grammar-card-content">
                <BlockHeader
                    type="quiz"
                    title="FACT CHECK"
                    subtitle={question}
                />
                
                {/* True/False Buttons Row */}
                <div className="elab-fact-check-options-row">
                    <button
                        onClick={() => choose(true)}
                        disabled={!isAssessment && answer !== null}
                        className={`elab-tf-btn true-btn ${answer === true ? "is-selected" : ""}`}
                    >
                        <img src={iconCheckUrl} className="elab-tf-btn-icon" alt="Check" />
                        <span className="elab-tf-btn-text">TRUE</span>
                    </button>
                    
                    <button
                        onClick={() => choose(false)}
                        disabled={!isAssessment && answer !== null}
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
