import registry from "./ElementRegistry";

function resolveComponent(type) {
    if (!type) return null;
    const norm = String(type).toLowerCase().trim();
    if (registry[norm]) return registry[norm];

    // Fuzzy fallback resolution for typos or schema variants
    if (norm.includes("audio") || norm.includes("dio")) return registry.audio;
    if (norm.includes("video")) return registry.video;
    if (norm.includes("image") || norm.includes("img")) return registry.image;
    if (norm.includes("heading")) return registry.heading;
    if (norm.includes("text")) return registry.text;
    if (norm.includes("quiz") || norm.includes("mcq") || norm.includes("choice")) return registry.quiz;
    if (norm.includes("match")) return registry.match;
    if (norm.includes("flashcard")) return registry.flashcard;
    if (norm.includes("sentence")) return registry.sentence_builder;
    if (norm.includes("writing")) return registry.writing_prompt;
    if (norm.includes("fill")) return registry.fill_blank;

    return null;
}

// Renders a single block component.
function ElementRenderer({ element }) {

    const Component = resolveComponent(element?.type);

    if (!Component) {
        return (
            <div className="elab-unsupported-block">
                ⚠️ Unsupported block type: <strong>{element?.type}</strong>
            </div>
        );
    }

    return <Component block={element} />;

}

export default ElementRenderer;