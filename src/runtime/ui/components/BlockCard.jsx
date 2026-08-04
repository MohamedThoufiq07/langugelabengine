import "../../components/BlockCard.css";

function BlockCard({

    children,

    className = "",

    type

}) {

    return (

        <section
            className={`elab-block-card ${className}`}
            data-type={type}
            style={type ? { "--block-accent": `var(--c-${type}, var(--primary))` } : undefined}
        >

            {children}

        </section>

    );

}

export default BlockCard;