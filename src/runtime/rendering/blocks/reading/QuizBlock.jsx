import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

const CONFETTI_EMOJI = ["🎉", "⭐", "✨"];

function QuizBlock({ block }) {

    const { question, options, correctAnswerIndex } = block.content;

    const [selected, setSelected] = useState(null);

    const [confetti, setConfetti] = useState([]);

    const completion = useScreenCompletion();

    function handleSelect(index) {

        if (selected !== null) return;

        setSelected(index);

        completion?.reportAnswered(block.id);

        if (index === correctAnswerIndex) {

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

                <div className="elab-chip-row" style={{ flexDirection: "column" }}>

                    {options.map((option, index) => {

                        const isSelected = selected === index;
                        const isCorrect = selected !== null && index === correctAnswerIndex;
                        const isIncorrect = isSelected && index !== correctAnswerIndex;

                        return (

                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                disabled={selected !== null}
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
