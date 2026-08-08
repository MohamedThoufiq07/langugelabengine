import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import masksBadge from "../../../samples/assets/images/speaking_masks_badge.png";
import puppetShowImg from "../../../samples/assets/images/speaking_puppet_show.png";
import micIcon from "../../../samples/assets/images/dictation_mic.png";

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

            <div className="speaking-custom-card-content">
                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle roleplay">
                            <img src={masksBadge} className="speaking-badge-img" alt="Role Play" />
                        </div>
                        <div className="speaking-badge-tag roleplay">
                            ROLE PLAY
                        </div>
                    </div>

                    <div className="speaking-divider-line" />

                    <div className="speaking-quotes-container">
                        ” {dialogue || ""} ”
                    </div>

                    {referenceAudio && (
                        <div className="elab-media-frame">
                            <audio controls src={referenceAudio} />
                        </div>
                    )}

                    {error && (
                        <div className="elab-feedback error">{error}</div>
                    )}

                    <div className="elab-chip-row">
                        {!recording ? (
                            <button className="speaking-custom-btn roleplay" onClick={startRecording}>
                                <img src={micIcon} alt="Mic" /> Record My Reply
                            </button>
                        ) : (
                            <button className="speaking-custom-btn danger" onClick={stopRecording}>
                                ⏹ Stop Recording
                            </button>
                        )}
                    </div>

                    {audio && (
                        <div className="elab-media-frame">
                            <audio controls src={audio} />
                            <p className="elab-caption" style={{ padding: "10px 14px" }}>
                                My Response
                            </p>
                        </div>
                    )}
                </div>

                <div className="speaking-custom-illustration">
                    <img 
                        src={puppetShowImg} 
                        alt="Role Play Illustration" 
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default RolePlayBlock;

