import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import badgeSeqUrl from "../../../samples/assets/images/badge_seq.png";
import seqGirlUrl from "../../../samples/assets/images/seq_girl.png";
import seqWaveUrl from "../../../samples/assets/images/seq_wave.png";
import seqStep1BadgeUrl from "../../../samples/assets/images/seq_step1_badge.png";
import seqStep2BadgeUrl from "../../../samples/assets/images/seq_step2_badge.png";
import seqStep3BadgeUrl from "../../../samples/assets/images/seq_step3_badge.png";

// Import arrows
import arrowBlueUpUrl from "../../../samples/assets/images/arrow_blue_up.png";
import arrowPinkUpUrl from "../../../samples/assets/images/arrow_pink_up.png";
import arrowBlueDownUrl from "../../../samples/assets/images/arrow_blue_down.png";
import arrowGreenDownUrl from "../../../samples/assets/images/arrow_green_down.png";

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function SequenceBlock({ block }) {
    const { items = [] } = block.content;
    const completion = useScreenCompletion();
    const [order, setOrder] = useState(() => shuffle(items));
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        if (solved || items.length === 0) return;
        const isCorrect = order.every((item, i) => item === items[i]);
        if (isCorrect) {
            setSolved(true);
            completion?.reportAnswered(block.id);
        }
    }, [order]);

    function move(index, dir) {
        if (solved) return;
        const target = index + dir;
        if (target < 0 || target >= order.length) return;
        const next = [...order];
        [next[index], next[target]] = [next[target], next[index]];
        setOrder(next);
    }

    function getStepBadge(index) {
        const cycleIndex = index % 3;
        if (cycleIndex === 0) return seqStep1BadgeUrl;
        if (cycleIndex === 1) return seqStep2BadgeUrl;
        return seqStep3BadgeUrl;
    }

    function renderArrowButtons(index) {
        if (solved) return null;
        const cycleIndex = index % 3;

        let upSrc = arrowBlueUpUrl;
        let downSrc = arrowBlueDownUrl;
        let upRotate = false;
        let downRotate = false;

        if (cycleIndex === 0) {
            upSrc = arrowPinkUpUrl;
            downSrc = arrowPinkUpUrl;
            downRotate = true;
        } else if (cycleIndex === 1) {
            upSrc = arrowBlueUpUrl;
            downSrc = arrowBlueDownUrl;
        } else {
            upSrc = arrowGreenDownUrl;
            downSrc = arrowGreenDownUrl;
            upRotate = true;
        }

        return (
            <div className="elab-seq-arrows-row">
                <button
                    type="button"
                    className="elab-seq-arrow-btn"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                >
                    <img
                        src={upSrc}
                        className="elab-seq-arrow-img"
                        style={upRotate ? { transform: "rotate(180deg)" } : undefined}
                        alt="Up"
                    />
                </button>
                <span className="elab-seq-arrow-divider">⋮</span>
                <button
                    type="button"
                    className="elab-seq-arrow-btn"
                    onClick={() => move(index, 1)}
                    disabled={index === order.length - 1}
                >
                    <img
                        src={downSrc}
                        className="elab-seq-arrow-img"
                        style={downRotate ? { transform: "rotate(180deg)" } : undefined}
                        alt="Down"
                    />
                </button>
            </div>
        );
    }

    return (
        <BlockCard type="sequence">
            <div className="elab-block-two-column sequence-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <img src={badgeSeqUrl} className="elab-header-badge-img" alt="Badge" />
                        <div className="elab-header-content">
                            <h3 className="elab-custom-title-seq">
                                <span className="title-blue">ARRANGE</span> <span className="title-pink">IN ORDER</span>
                            </h3>
                            <p className="elab-custom-subtitle">Use the arrows to put the steps in the correct order</p>
                        </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="elab-seq-list-container">
                        {order.map((item, index) => (
                            <div
                                key={item + index}
                                className={`elab-seq-option-card ${solved ? "is-correct" : ""}`}
                            >
                                <div className="elab-seq-badge-container">
                                    <img src={getStepBadge(index)} className="elab-seq-step-badge-img" alt="Step" />
                                    {/* Small sparkle icons next to badge */}
                                    <span className="elab-seq-badge-sparkles">✨</span>
                                </div>
                                <span className="elab-seq-option-text">{item}</span>
                                {renderArrowButtons(index)}
                            </div>
                        ))}
                    </div>

                    {solved && (
                        <div className="elab-feedback success" style={{ marginTop: "12px" }}>
                            ✅ Correct order!
                        </div>
                    )}
                </div>

                {/* Right Side Illustration */}
                <div className="elab-sequence-illustration-container">
                    <img src={seqWaveUrl} className="elab-seq-wave-bubble" alt="Sound Wave" />
                    <img src={seqGirlUrl} className="elab-seq-girl-chibi" alt="Girl pointing" />
                </div>
            </div>
        </BlockCard>
    );
}

export default SequenceBlock;
