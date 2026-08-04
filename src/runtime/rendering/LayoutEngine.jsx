import OneColumn from "./layout/OneColumn";
import ElementRenderer from "./ElementRenderer";

// The CMS only authors a single-column screen now (the layout/column-ratio
// picker and left/right slots were removed) — every screen is just a
// straight list of blocks, so this always renders one column.
function LayoutEngine({ screen }) {

    const { elements } = screen.content;

    return (

        <OneColumn>

            {

                (elements || []).map(element => (

                    <ElementRenderer

                        key={element.id}

                        element={element}

                    />

                ))

            }

        </OneColumn>

    );

}

export default LayoutEngine;
