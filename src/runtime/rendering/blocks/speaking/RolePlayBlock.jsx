import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function RolePlayBlock({ block }) {

    const {

        character,
        dialogue,
        referenceAudio

    } = block.content;

    const [recording, setRecording] = useState(false);
    const [audio, setAudio] = useState(null);
    const [error, setError] = useState("");

    const completion = useScreenCompletion();

    async function startRecording() {

        try {

            await RecordingService.startRecording();

            setRecording(true);

            setError("");

        }
        catch (err) {

            setError(err.message);

        }

    }

    async function stopRecording() {

        const result =
            await RecordingService.stopRecording();

        setRecording(false);

        setAudio(result.url);

        completion?.reportAnswered(block.id);

    }

    return (

        <BlockCard type="roleplay">

            <BlockHeader

                type="roleplay"

                title="Role Play"

                subtitle={character}

            />

            <p className="elab-plain-text" style={{ fontSize: "17px", fontStyle: "italic" }}>

                "{dialogue}"

            </p>

            {

                referenceAudio &&

                <div className="elab-media-frame">

                    <audio

                        controls

                        src={referenceAudio}

                    />

                </div>

            }

            {

                error &&

                <div className="elab-feedback error">{error}</div>

            }

            <div className="elab-chip-row">

                {

                    !recording ? (

                        <button className="elab-btn-icon" onClick={startRecording}>

                            🎤 Record My Reply

                        </button>

                    ) : (

                        <button className="elab-btn-icon danger" onClick={stopRecording}>

                            ⏹ Stop Recording

                        </button>

                    )

                }

            </div>

            {

                audio && (

                    <div className="elab-media-frame">

                        <audio

                            controls

                            src={audio}

                        />

                        <p className="elab-caption" style={{ padding: "10px 14px" }}>

                            My Response

                        </p>

                    </div>

                )

            }

        </BlockCard>

    );

}

export default RolePlayBlock;
