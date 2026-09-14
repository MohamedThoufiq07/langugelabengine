import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

// Import cutouts
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
    const isAssessment = !!window.__isAssessment;
    const [order, setOrder] = useState(() => shuffle(items));
    const [solved, setSolved] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (solved || items.length === 0 || isAssessment) return;
        const isCorrect = order.every((item, i) => item === items[i]);
        if (isCorrect) {
            setSolved(true);
            completion?.reportAnswered(block.id);
        }
    }, [order, isAssessment]);

    function move(index, dir) {
        if (solved || submitted) return;
        const target = index + dir;
        if (target < 0 || target >= order.length) return;
        const next = [...order];
        [next[index], next[target]] = [next[target], next[index]];
        setOrder(next);
        if (isAssessment) {
            completion?.saveAnswer?.(block.id, next);
            completion?.reportAnswered(block.id);
        }
    }

    function handleSubmitAssessment() {
        setSubmitted(true);
        completion?.saveAnswer?.(block.id, order);
        completion?.reportAnswered(block.id);
    }

    function getStepBadge(index) {
        const cycleIndex = index % 3;
        if (cycleIndex === 0) return seqStep1BadgeUrl;
        if (cycleIndex === 1) return seqStep2BadgeUrl;
        return seqStep3BadgeUrl;
    }

    const BADGE_COLOR_PALETTES = [
        { bg: "linear-gradient(135deg, #ff5e98 0%, #ff2a75 100%)", border: "#ff94b9", arrowUp: arrowPinkUpUrl, arrowDown: arrowPinkUpUrl, rotateDown: true },
        { bg: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", border: "#7dd3fc", arrowUp: arrowBlueUpUrl, arrowDown: arrowBlueDownUrl, rotateDown: false },
        { bg: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)", border: "#86efac", arrowUp: arrowGreenDownUrl, arrowDown: arrowGreenDownUrl, rotateUp: true, rotateDown: false },
        { bg: "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)", border: "#e9d5ff", arrowUp: arrowBlueUpUrl, arrowDown: arrowBlueDownUrl, rotateDown: false },
        { bg: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)", border: "#fdba74", arrowUp: arrowPinkUpUrl, arrowDown: arrowPinkUpUrl, rotateDown: true }
    ];

    function renderArrowButtons(index, palette) {
        let upSrc = palette.arrowUp;
        let downSrc = palette.arrowDown;
        let upRotate = palette.rotateUp || false;
        let downRotate = palette.rotateDown || false;

        return (
            <div className="elab-seq-arrows-row">
                <button
                    type="button"
                    className="elab-seq-arrow-btn"
                    onClick={() => move(index, -1)}
                    disabled={(solved && !isAssessment) || submitted || index === 0}
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
                    disabled={(solved && !isAssessment) || submitted || index === order.length - 1}
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
                                ARRANGE IN ORDER
                            </h3>
                            <p className="elab-custom-subtitle">Use the arrows to put the steps in the correct order</p>
                        </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="elab-seq-list-container">
                        {order.map((item, index) => {
                            const stepNum = index + 1;
                            const palette = BADGE_COLOR_PALETTES[index % BADGE_COLOR_PALETTES.length];

                            return (
                                <div
                                    key={item + index}
                                    className={`elab-seq-option-card ${solved && !isAssessment ? "is-correct" : ""}`}
                                >
                                    <div className="elab-seq-badge-container">
                                        <div
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "50%",
                                                background: palette.bg,
                                                border: `3px solid ${palette.border}`,
                                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#ffffff",
                                                fontSize: "1.25rem",
                                                fontWeight: 800,
                                                fontFamily: "'Poppins', sans-serif"
                                            }}
                                        >
                                            {stepNum}
                                        </div>
                                    </div>
                                    <span className="elab-seq-option-text">{item}</span>
                                    {renderArrowButtons(index, palette)}
                                </div>
                            );
                        })}
                    </div>

                    {isAssessment && !submitted && (
                        <button
                            type="button"
                            onClick={handleSubmitAssessment}
                            style={{
                                marginTop: "1rem",
                                padding: "0.6rem 1.5rem",
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "#ffffff",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                            }}
                        >
                            Submit
                        </button>
                    )}

                    {solved && !isAssessment && (
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
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default SequenceBlock;
