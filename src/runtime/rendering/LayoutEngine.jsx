import ElementRenderer from "./ElementRenderer";
import ScreenStepBar from "./ScreenStepBar";

function LayoutEngine({ screen, activityScreens = [], currentScreenIndex = 0 }) {

    const { elements } = screen.content;
    const list = elements || [];

    const noOuterCard = screen.title?.toLowerCase() === "screen 2" || currentScreenIndex === 0 || currentScreenIndex === 1 || currentScreenIndex === 2 || screen.id === "171" || screen.id === "170" || currentScreenIndex === 5 || screen.id === "165" || screen.id === "169" || currentScreenIndex === 4;

    return (
        <div className="layout-engine-container">

            {/* ── Horizontal step progress bar at the top ── */}
            <ScreenStepBar
                screens={activityScreens}
                currentIndex={currentScreenIndex}
            />

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
