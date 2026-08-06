import ElementRenderer from "./ElementRenderer";
import ScreenStepBar from "./ScreenStepBar";

function LayoutEngine({ screen, activityScreens = [], currentScreenIndex = 0 }) {

    const { elements } = screen.content;
    const list = elements || [];

    return (
        <div className="layout-engine-container">

            {/* ── Horizontal step progress bar at the top ── */}
            <ScreenStepBar
                screens={activityScreens}
                currentIndex={currentScreenIndex}
            />

            {/* ── Blocks stacked cleanly, no step numbers ── */}
            <div className="scene-backdrop-content">
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
