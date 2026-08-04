import { useEffect, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function DragDropBlock({ block }) {

    const { draggableItems = [], dropZones = [], question } = block.content;

    const completion = useScreenCompletion();

    const [selectedItem, setSelectedItem] = useState(null);

    const [placed, setPlaced] = useState({});

    const [wrongZone, setWrongZone] = useState(null);

    const placedItemIndices = new Set(Object.values(placed));

    const total = Math.min(draggableItems.length, dropZones.length);

    const allPlaced = total > 0 && placedItemIndices.size === total;

    useEffect(() => {

        if (allPlaced) completion?.reportAnswered(block.id);

    }, [allPlaced]);

    function chooseItem(index) {

        if (placedItemIndices.has(index)) return;

        setSelectedItem(index === selectedItem ? null : index);

    }

    function chooseZone(zoneIndex) {

        if (selectedItem === null || placed[zoneIndex] !== undefined) return;

        if (selectedItem === zoneIndex) {

            setPlaced(prev => ({ ...prev, [zoneIndex]: selectedItem }));

            setSelectedItem(null);

        } else {

            setWrongZone(zoneIndex);

            setTimeout(() => setWrongZone(null), 400);

        }

    }

    return (

        <BlockCard type="drag_drop">

            <BlockHeader

                type="drag_drop"

                title="Drag & Drop"

                subtitle={question || "Tap an item, then tap its matching destination"}

            />

            <div className="elab-chip-row">

                {draggableItems.map((item, index) => (

                    <button

                        key={index}

                        onClick={() => chooseItem(index)}

                        disabled={placedItemIndices.has(index)}

                        className={`elab-chip ${selectedItem === index ? "is-selected-chip" : ""} ${placedItemIndices.has(index) ? "is-placed" : ""}`}

                    >

                        {item}

                    </button>

                ))}

            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>

                {dropZones.map((zone, zoneIndex) => {

                    const itemIndex = placed[zoneIndex];

                    const filled = itemIndex !== undefined;

                    return (

                        <div

                            key={zoneIndex}

                            onClick={() => chooseZone(zoneIndex)}

                            className={`elab-dropzone ${filled ? "is-filled" : ""} ${wrongZone === zoneIndex ? "is-wrong" : ""}`}

                            style={{ cursor: filled ? "default" : "pointer", justifyContent: "space-between", minHeight: "auto", padding: "12px 16px" }}

                        >

                            <span style={{ fontWeight: 600 }}>{zone}</span>

                            {filled && <span className="elab-chip is-static">{draggableItems[itemIndex]}</span>}

                        </div>

                    );

                })}

            </div>

            {allPlaced && (

                <div className="elab-feedback success">✅ Great job!</div>

            )}

        </BlockCard>

    );

}

export default DragDropBlock;
