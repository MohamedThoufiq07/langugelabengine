import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
import badgeSeqUrl from "../../../../assets/images/badge_seq.png";
import seqStep1BadgeUrl from "../../../../assets/images/seq_step1_badge.png";
import seqStep2BadgeUrl from "../../../../assets/images/seq_step2_badge.png";
import seqStep3BadgeUrl from "../../../../assets/images/seq_step3_badge.png";

// Import arrows
import arrowBlueUpUrl from "../../../../assets/images/arrow_blue_up.png";
import arrowPinkUpUrl from "../../../../assets/images/arrow_pink_up.png";
import arrowBlueDownUrl from "../../../../assets/images/arrow_blue_down.png";
import arrowGreenDownUrl from "../../../../assets/images/arrow_green_down.png";

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
                    disabled={solved || index === 0}
                    aria-label={`Move step ${index + 1} up`}
                    title="Move up"
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
                    disabled={solved || index === order.length - 1}
                    aria-label={`Move step ${index + 1} down`}
                    title="Move down"
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
        <BlockCard type="sequence" className="elab-sequence-card">
            <div className="elab-block-two-column sequence-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <img src="/arrange in order/arrange in order head icon.png" className="elab-header-badge-img" alt="Badge" />
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
                                </div>
                                <span className="elab-seq-option-text">{item}</span>
                                {renderArrowButtons(index)}
                            </div>
                        ))}
                    </div>

                    {solved && (
                        <div className="elab-feedback success elab-sequence-success" role="status">
                            <span className="elab-sequence-success-icon" aria-hidden="true">✓</span>
                            <span>
                                <strong>Excellent!</strong>
                                <small>You found the correct order.</small>
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Side Illustration */}
                <div className="elab-sequence-illustration-container">
                    <img
                        src="/arrange in order/arrange in order bulp.png"
                        className="elab-seq-lightbulb"
                        alt="Lightbulb"
                    />
                    <img
                        src="/arrange in order/arrange in order right side icons.png"
                        className="elab-seq-side-icons"
                        alt="Sound and music icons"
                    />
                    <img
                        src="/arrange in order/arrang in order girl image.png"
                        className="elab-seq-girl-chibi-new"
                        alt="Girl reading"
                    />
                </div>
            </div>
        </BlockCard>
    );
}

export default SequenceBlock;
