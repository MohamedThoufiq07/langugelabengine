import { useMemo } from "react";
import ElementRenderer from "./ElementRenderer";

function LayoutEngine({ screen, currentScreenIndex = 0 }) {

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

    const noOuterCard = false;

    return (
        <div className="layout-engine-container">
            {/* ── Blocks stacked cleanly, top 1, 2, 3 step bar removed completely ── */}
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
