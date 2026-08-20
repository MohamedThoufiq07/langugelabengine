import { useMemo } from "react";
import ElementRenderer from "./ElementRenderer";
import ScreenStepBar from "./ScreenStepBar";

function LayoutEngine({ screen, activityScreens = [], currentScreenIndex = 0, isExperienceType }) {

    const rawElements = screen?.content?.elements || [];
    const list = useMemo(() => {
        return rawElements.slice().sort((a, b) => {
            const getTop = (el) => {
                if (el.order !== undefined && el.order !== null) return Number(el.order);
                if (el.sequence !== undefined && el.sequence !== null) return Number(el.sequence);
                if (el.position !== undefined && el.position !== null) return Number(el.position);
                if (el.styles && el.styles.top !== undefined) {
                    const parsed = parseFloat(String(el.styles.top).replace("px", ""));
                    if (!isNaN(parsed)) return parsed;
                }
                return 0;
            };
            return getTop(a) - getTop(b);
        });
    }, [rawElements]);

    const noOuterCard = useMemo(() => {
        const titleLower = screen.title?.toLowerCase();
        return (
            titleLower === "screen 2" ||
            currentScreenIndex === 0 ||
            currentScreenIndex === 1 ||
            currentScreenIndex === 2 ||
            currentScreenIndex === 4 ||
            currentScreenIndex === 5 ||
            screen.id === "171" ||
            screen.id === "170" ||
            screen.id === "165" ||
            screen.id === "169"
        );
    }, [screen.title, screen.id, currentScreenIndex]);

    return (
        <div className="layout-engine-container">

            {/* ── Horizontal step progress bar at the top ── */}
            {!isExperienceType && (
                <ScreenStepBar
                    screens={activityScreens}
                    currentIndex={currentScreenIndex}
                />
            )}

            {/* ── Blocks stacked cleanly, no step numbers ── */}
            <div className={`scene-backdrop-content ${noOuterCard ? "no-card" : ""}`}>
                <div className="elab-stage">
                    {list.map((element) => (
                        <div key={element.id} className="elab-block-row">
                            <ElementRenderer element={element} />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );

}

export default LayoutEngine;
