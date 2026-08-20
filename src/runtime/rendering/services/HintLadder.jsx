/**
 * HintLadder Utility
 * Provides progressive hints for assessment blocks with 4 attempts ladder:
 * 1. Replay (audio/visual repeat)
 * 2. Visual Clue (highlighted/focused element)
 * 3. Sentence Starter (text prompt)
 * 4. Model Answer (complete solution)
 */

export const HINT_STAGES = {
    ATTEMPT_1: { stage: 0, label: "Replay", icon: "🔁" },
    ATTEMPT_2: { stage: 1, label: "Visual Clue", icon: "💡" },
    ATTEMPT_3: { stage: 2, label: "Sentence Starter", icon: "📝" },
    ATTEMPT_4: { stage: 3, label: "Model Answer", icon: "✅" }
};

export function useHintLadder(initialAttempt = 0) {
    const [currentAttempt, setCurrentAttempt] = React.useState(initialAttempt);
    const [hintUsed, setHintUsed] = React.useState(false);

    const canUseHint = () => currentAttempt < 4;
    const getNextHint = () => {
        if (canUseHint()) {
            setCurrentAttempt(prev => prev + 1);
            setHintUsed(true);
            return HINT_STAGES[`ATTEMPT_${currentAttempt + 1}`];
        }
        return null;
    };

    const resetHints = () => {
        setCurrentAttempt(0);
        setHintUsed(false);
    };

    return {
        currentAttempt,
        canUseHint,
        getNextHint,
        resetHints,
        hintUsed,
        maxAttempts: 4
    };
}

export function HintLadderComponent({ 
    currentAttempt, 
    onRequestHint, 
    canUseHint,
    hints = {}
}) {
    const stages = [
        { stage: 1, label: "Replay", icon: "🔁", content: hints.replay },
        { stage: 2, label: "Visual Clue", icon: "💡", content: hints.visualClue },
        { stage: 3, label: "Sentence Starter", icon: "📝", content: hints.sentenceStarter },
        { stage: 4, label: "Model Answer", icon: "✅", content: hints.modelAnswer }
    ];

    return (
        <div className="hint-ladder-container">
            <div className="hint-ladder-header">
                <span className="hint-attempts">Attempt: {currentAttempt} / 4</span>
            </div>

            <div className="hint-ladder-stages">
                {stages.map((hintStage, idx) => {
                    const isAvailable = idx < currentAttempt;
                    const isNext = idx === currentAttempt && canUseHint;
                    const isExhausted = idx >= currentAttempt && !canUseHint && currentAttempt === 4;

                    return (
                        <div
                            key={idx}
                            className={`hint-stage ${isAvailable ? "available" : ""} ${isNext ? "next" : ""} ${isExhausted ? "exhausted" : ""}`}
                        >
                            <button
                                className="hint-stage-button"
                                onClick={isNext ? () => onRequestHint(hintStage) : undefined}
                                disabled={!isNext && !isAvailable}
                            >
                                <span className="hint-icon">{hintStage.icon}</span>
                                <span className="hint-label">{hintStage.label}</span>
                            </button>

                            {hintStage.content && isAvailable && (
                                <div className="hint-content">
                                    {typeof hintStage.content === "string" ? (
                                        <p>{hintStage.content}</p>
                                    ) : (
                                        hintStage.content
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {currentAttempt === 4 && (
                <div className="hint-ladder-exhausted">
                    ℹ️ All hints have been used. Try your best!
                </div>
            )}
        </div>
    );
}

export default HintLadderComponent;
