import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function shuffle(arr) {

    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [a[i], a[j]] = [a[j], a[i]];

    }

    return a;

}

function SequenceBlock({ block }) {

    const { items = [] } = block.content;

    const completion = useScreenCompletion();

    const [order, setOrder] = useState(() => shuffle(items));

    const [solved, setSolved] = useState(false);

    useEffect(() => {

        if (solved || items.length === 0) return;

        const isCorrect = order.every((item, i) => item === items[i]);

        if (isCorrect) {

            setSolved(true);

            completion?.reportAnswered(block.id);

        }

    }, [order]);

    function move(index, dir) {

        if (solved) return;

        const target = index + dir;

        if (target < 0 || target >= order.length) return;

        const next = [...order];

        [next[index], next[target]] = [next[target], next[index]];

        setOrder(next);

    }

    return (

        <BlockCard type="sequence">

            <BlockHeader

                type="sequence"

                title="Arrange in Order"

                subtitle="Use the arrows to put the steps in the correct order"

            />

            <div className="elab-chip-row" style={{ flexDirection: "column" }}>

                {order.map((item, index) => (

                    <div

                        key={item + index}

                        className={`elab-option ${solved ? "is-correct" : ""}`}

                        style={{ cursor: "default" }}

                    >

                        <span className="elab-option-badge">{index + 1}</span>

                        <span style={{ flex: 1 }}>{item}</span>

                        {!solved && (

                            <div style={{ display: "flex", gap: "4px" }}>

                                <button

                                    type="button"

                                    className="elab-btn-icon secondary"

                                    style={{ padding: "4px 10px" }}

                                    onClick={() => move(index, -1)}

                                    disabled={index === 0}

                                >

                                    ▲

                                </button>

                                <button

                                    type="button"

                                    className="elab-btn-icon secondary"

                                    style={{ padding: "4px 10px" }}

                                    onClick={() => move(index, 1)}

                                    disabled={index === order.length - 1}

                                >

                                    ▼

                                </button>

                            </div>

                        )}

                    </div>

                ))}

            </div>

            {solved && (

                <div className="elab-feedback success">✅ Correct order!</div>

            )}

        </BlockCard>

    );

}

export default SequenceBlock;
