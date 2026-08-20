import { useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

const CONFETTI_EMOJI = ["🎉", "⭐", "✨"];

function QuizBlock({ block }) {

    const { 
        question, 
        options, 
        correctAnswerIndex,
        audio,
        audioFirst = false
    } = block.content;

    const completion = useScreenCompletion();
    const savedAnswer = completion?.getSavedAnswer?.(block.id);

    const [selected, setSelected] = useState(savedAnswer !== null ? savedAnswer : null);

    const [confetti, setConfetti] = useState([]);
    const [audioPlayed, setAudioPlayed] = useState(false);
    const [useAudioMode, setUseAudioMode] = useState(audioFirst);

    // Pre-report answered state if there is a saved answer loaded on mount
    useEffect(() => {
        if (savedAnswer !== null) {
            completion?.reportAnswered(block.id);
        }
    }, [savedAnswer]);

    function handleSelect(index) {

        if (selected !== null && !window.__isAssessment) return;

        setSelected(index);
        completion?.saveAnswer?.(block.id, { 
            selectedIndex: index,
            audioFirst: useAudioMode
        });

        completion?.reportAnswered(block.id);

        if (!window.__isAssessment && index === correctAnswerIndex) {

            const pieces = Array.from({ length: 6 }).map((_, i) => ({
                id: `${Date.now()}-${i}`,
                emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
                left: 10 + Math.random() * 80,
                fly: `translate(${(Math.random() - 0.5) * 80}px, ${-60 - Math.random() * 40}px)`
            }));

            setConfetti(pieces);

            setTimeout(() => setConfetti([]), 700);

        }

    }

    const isAssessment = window.__isAssessment;

    return (

        <BlockCard type="quiz">

            <BlockHeader

                type="quiz"

                title="Quiz"

                subtitle={question}

            />

            <div style={{ position: "relative" }}>

                {confetti.map(p => (
                    <span
                        key={p.id}
                        className="elab-confetti-piece"
                        style={{ left: `${p.left}%`, top: 0, "--fly-to": p.fly }}
                    >
                        {p.emoji}
                    </span>
                ))}

                {audio && (
                    <div className="quiz-audio-section">
                        <div className="elab-media-frame">
                            <audio 
                                src={audio} 
                                controls 
                                className="elab-media-player"
                                onPlay={() => setAudioPlayed(true)}
                            />
                        </div>
                        {useAudioMode && (
                            <div className="audio-first-toggle">
                                <label className="toggle-label">
                                    <input 
                                        type="checkbox" 
                                        checked={useAudioMode}
                                        onChange={(e) => setUseAudioMode(e.target.checked)}
                                        className="toggle-input"
                                    />
                                    <span className="toggle-text">Audio-First Mode</span>
                                </label>
                                {!audioPlayed && (
                                    <small className="audio-reminder">Listen first before answering</small>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="elab-chip-row" style={{ flexDirection: "column" }}>

                    {options.map((option, index) => {

                        const isSelected = selected === index;
                        const isCorrect = !isAssessment && selected !== null && index === correctAnswerIndex;
                        const isIncorrect = !isAssessment && isSelected && index !== correctAnswerIndex;

                        return (

                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                disabled={!isAssessment && selected !== null}
                                className={`elab-option ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isIncorrect ? "is-incorrect" : ""}`}
                            >
                                <span className="elab-option-badge">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option.text}
                            </button>

                        );

                    })}

                </div>

            </div>

        </BlockCard>

    );

}

export default QuizBlock;
