import "../../components/BlockCard.css";

function BlockCard({
    children,
    className = "",
    type,
    style
}) {
    const combinedStyle = {
        ...(type ? { "--block-accent": `var(--c-${type}, var(--primary))` } : {}),
        ...style
    };

    return (
        <section
            className={`elab-block-card ${className}`}
            data-type={type}
            style={combinedStyle}
        >
            {children}
        </section>
    );
}

export default BlockCard;