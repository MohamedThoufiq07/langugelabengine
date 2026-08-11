const ICONS = {

    text: "📖",
    heading: "🔠",
    image: "🖼️",
    video: "🎬",
    audio: "🔊",
    voice: "🎤",
    dialogue: "💬",
    quiz: <span style={{ color: "#e91e63", fontWeight: "800", fontSize: "32px", fontFamily: "inherit" }}>?</span>,
    true_false: "⚖️",
    fill_blank: "✏️",
    input: "✍️",
    match: "🔗",
    sequence: "🔢",
    drag_drop: "🔀",
    flashcard: "🃏",
    crossword: "🧩",
    memory: "🧠",
    sentence: "📝",
    wordsearch: "🔤",
    roleplay: "🎭",
    pronunciation: "🗣️",
    dictation: "🎧",
    reading_passage: "📖",
    writing_prompt: "🖋️",
    grammar_correction: "✅"

};

function BlockHeader({

    type,

    title,

    subtitle

}) {

    const icon = ICONS[type] || "📦";

    return (

        <div className="elab-block-header">

            <div className="elab-block-icon" data-type={type}>

                {icon}

            </div>

            <div className="elab-block-info">

                <h3 className="elab-block-title">

                    {title}

                </h3>

                {subtitle && (

                    <p className="elab-block-subtitle">

                        {subtitle}

                    </p>

                )}

            </div>

        </div>

    );

}

export default BlockHeader;