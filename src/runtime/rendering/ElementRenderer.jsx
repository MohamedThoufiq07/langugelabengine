import registry from "./ElementRegistry";

const JUSTIFY_BY_ALIGNMENT = {

    left: "flex-start",
    center: "center",
    right: "flex-end"

};

function ElementRenderer({

    element

}) {

    const Component = registry[element.type];

    if (!Component) {

        return (

            <div>

                Unsupported Block:

                {element.type}

            </div>

        );

    }

    const { alignment, blockWidth } = element.styles || {};

    const justify = JUSTIFY_BY_ALIGNMENT[String(alignment || "left").toLowerCase()];

    return (

        <div style={{ display: "flex", justifyContent: justify }}>

            <div style={{ width: blockWidth || "100%", maxWidth: "100%" }}>

                <Component

                    block={element}

                />

            </div>

        </div>

    );

}

export default ElementRenderer;