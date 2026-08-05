import registry from "./ElementRegistry";

// Renders a single block component. No absolute positioning here —
// the LayoutEngine's stepper rows handle placement.
function ElementRenderer({ element }) {

    const Component = registry[element.type];

    if (!Component) {
        return (
            <div className="elab-unsupported-block">
                ⚠️ Unsupported block type: <strong>{element.type}</strong>
            </div>
        );
    }

    return <Component block={element} />;

}

export default ElementRenderer;