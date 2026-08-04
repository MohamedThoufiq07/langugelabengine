import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";

function DialogueBlock({ block }) {

    const {

        steps = []

    } = block.content;

    return (

        <BlockCard type="dialogue">

            <BlockHeader

                type="dialogue"

                title="Dialogue"

            />

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                {steps.map((step, index) => (

                    <div
                        key={index}
                        style={{
                            display: "flex",
                            justifyContent: step.side === "right" ? "flex-end" : "flex-start"
                        }}
                    >

                        <div
                            style={{
                                maxWidth: "75%",
                                background: step.avatarColor || "#3b82f6",
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "0.5rem 0.75rem"
                            }}
                        >

                            <div style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.85 }}>

                                {step.name}

                            </div>

                            <div>

                                {step.text}

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </BlockCard>

    );

}

export default DialogueBlock;
