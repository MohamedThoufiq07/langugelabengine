import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import PronunciationService from "../../services/speech/PronunciationService";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function VoiceRecorderBlock({ block }) {

    const { prompt } = block.content;

    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);

    const [audio, setAudio] = useState(null);

    const [duration, setDuration] = useState(0);

    const [error, setError] = useState("");

    const [analyzing, setAnalyzing] = useState(false);

    const [heardText, setHeardText] = useState(null);

    const completion = useScreenCompletion();

    async function startRecording() {

        try {

            await RecordingService.startRecording();

            setRecording(true);

            setPaused(false);

            setError("");

        }

        catch (err) {

            setError(err.message);

        }

    }

    async function stopRecording() {

        const result =

            await RecordingService.stopRecording();

        setAudio(result.url);

        setDuration(result.duration);

        setRecording(false);

        setPaused(false);

        setHeardText(null);

        completion?.reportAnswered(block.id);

        setAnalyzing(true);

        try {

            const text = await PronunciationService.transcribe(result.blob);

            setHeardText(text || "(nothing recognized)");

        }

        catch {

            // Non-critical — the recording itself still counts as answered.

        }

        finally {

            setAnalyzing(false);

        }

    }

    function pauseRecording() {

        RecordingService.pauseRecording();

        setPaused(true);

    }

    function resumeRecording() {

        RecordingService.resumeRecording();

        setPaused(false);

    }

    return (

        <BlockCard type="voice">

            <BlockHeader

                type="voice"

                title="Voice Recorder"

                subtitle={prompt}

            />

            {

                recording &&

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                    <span className="elab-recording-dot" />

                    <span className="elab-plain-text">Recording{paused ? " (paused)" : ""}...</span>

                </div>

            }

            {

                error &&

                <div className="elab-feedback error">{error}</div>

            }

            <div className="elab-chip-row">

                {

                    !recording &&

                    <button className="elab-btn-icon" onClick={startRecording}>

                        🎤 Start Recording

                    </button>

                }

                {

                    recording && !paused &&

                    <button className="elab-btn-icon secondary" onClick={pauseRecording}>

                        ⏸ Pause

                    </button>

                }

                {

                    recording && paused &&

                    <button className="elab-btn-icon secondary" onClick={resumeRecording}>

                        ▶ Resume

                    </button>

                }

                {

                    recording &&

                    <button className="elab-btn-icon danger" onClick={stopRecording}>

                        ⏹ Stop
                    </button>

                }

            </div>

            {

                audio &&

                <div className="elab-media-frame">

                    <audio

                        controls

                        src={audio}

                    />

                    <p className="elab-caption" style={{ padding: "10px 14px" }}>

                        Duration:

                        {" "}

                        {Math.round(duration / 1000)}

                        sec

                    </p>

                </div>

            }

            {

                analyzing &&

                <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>

                    <span className="elab-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Transcribing your recording…

                </div>

            }

            {

                heardText &&

                <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>

                    🗣️ We heard: "{heardText}"

                </div>

            }

        </BlockCard>

    );

}

export default VoiceRecorderBlock;
