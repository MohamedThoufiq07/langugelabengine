// Step colors cycling through a vibrant palette — one per screen
const STEP_COLORS = [
    { bg: "#14b8a6", shadow: "rgba(20,184,166,0.30)" },   // teal
    { bg: "#6366f1", shadow: "rgba(99,102,241,0.30)" },   // indigo
    { bg: "#f59e0b", shadow: "rgba(245,158,11,0.30)" },   // amber
    { bg: "#ec4899", shadow: "rgba(236,72,153,0.30)" },   // pink
    { bg: "#10b981", shadow: "rgba(16,185,129,0.30)" },   // emerald
    { bg: "#8b5cf6", shadow: "rgba(139,92,246,0.30)" },   // violet
    { bg: "#ef4444", shadow: "rgba(239,68,68,0.30)" },    // red
    { bg: "#3b82f6", shadow: "rgba(59,130,246,0.30)" },   // blue
];

/**
 * ScreenStepBar
 *
 * Horizontal numbered step indicator.
 * Shows one badge per screen (1 … N), no labels — just clean numbers.
 * Active badge is larger with a color ring. Completed badges show ✓.
 *
 * Props:
 *  screens      — full flat list of all screens in the experience
 *  currentIndex — 0-based index of the currently active screen
 */
function ScreenStepBar({ screens = [], currentIndex = 0 }) {

    if (!screens || screens.length === 0) return null;

    return (
        <nav className="ssb-wrapper" aria-label="Screen progress">
            <div className="ssb-track-row">
                {screens.map((screen, idx) => {
                    const color      = STEP_COLORS[idx % STEP_COLORS.length];
                    const isActive   = idx === currentIndex;
                    const isComplete = idx < currentIndex;
                    const isLast     = idx === screens.length - 1;

                    return (
                        <div key={screen.id ?? idx} className="ssb-cell">

                            {/* Numbered / checkmark badge */}
                            <div
                                className={[
                                    "ssb-badge",
                                    isActive   ? "ssb-badge--active"   : "",
                                    isComplete ? "ssb-badge--complete" : "",
                                    isLast     ? "ssb-badge--last"     : "",
                                ].filter(Boolean).join(" ")}
                                style={{
                                    "--ssb-color":  color.bg,
                                    "--ssb-shadow": color.shadow,
                                }}
                                aria-current={isActive ? "step" : undefined}
                                title={screen.title || `Screen ${idx + 1}`}
                            >
                                {isLast && (
                                    <span className="ssb-star-badge">⭐</span>
                                )}
                                {isComplete ? (
                                    <svg className="ssb-check" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span>{idx + 1}</span>
                                )}
                            </div>

                            {/* Solid connector between badges (not after last) */}
                            {!isLast && (
                                <div
                                    className={[
                                        "ssb-connector",
                                        isComplete ? "ssb-connector--done" : ""
                                    ].filter(Boolean).join(" ")}
                                    style={{
                                        "--ssb-connector-color": color.bg
                                    }}
                                    aria-hidden="true"
                                />
                            )}

                        </div>
                    );
                })}
            </div>
        </nav>
    );
}

export default ScreenStepBar;
