import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import PronunciationService from "../../services/speech/PronunciationService";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

const VERDICT_META = {

    excellent: { emoji: "🌟", label: "Excellent!", tone: "success" },
    good: { emoji: "🙂", label: "Good — close!", tone: "warning" },
    try_again: { emoji: "🔁", label: "Try again", tone: "error" }

};

function PronunciationBlock({ block }) {

    const {

        word,

        hint,

        referenceAudio

    } = block.content;

    const [recording, setRecording] = useState(false);

    const [audio, setAudio] = useState(null);

    const [error, setError] = useState("");

    const [analyzing, setAnalyzing] = useState(false);

    const [modelProgress, setModelProgress] = useState(null);

    const [feedback, setFeedback] = useState(null);

    const completion = useScreenCompletion();

    async function startRecording() {

        try {

            await RecordingService.startRecording();

            setRecording(true);

            setError("");

            setFeedback(null);

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

        setAnalyzing(true);

        setModelProgress(null);

        try {

            const heardText = await PronunciationService.transcribe(

                result.blob,

                progress => {

                    if (progress?.status === "progress" && typeof progress.progress === "number") {

                        setModelProgress(Math.round(progress.progress));

                    }

                }

            );

            setFeedback(

                PronunciationService.scorePronunciation(heardText, word)

            );

        }

        catch (err) {

            setError("Couldn't analyze that recording — " + err.message);

        }

        finally {

            setAnalyzing(false);

            setModelProgress(null);

        }

    }

    return (

        <BlockCard type="pronunciation">

            <BlockHeader

                type="pronunciation"

                title="Pronunciation Practice"

                subtitle={hint}

            />

            <h2 style={{ color: "var(--primary)" }}>

                {word}

            </h2>

            {

                referenceAudio && (

                    <div className="elab-media-frame">

                        <audio

                            controls

                            src={referenceAudio}

                        />

                    </div>

                )

            }

            {

                error && (

                    <div className="elab-feedback error">{error}</div>

                )

            }

            <div className="elab-chip-row">

                {

                    !recording ? (

                        <button className="elab-btn-icon" onClick={startRecording}>

                            🎤 Record Pronunciation

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

                            Your Recording

                        </p>

                    </div>

                )

            }

            {

                analyzing && (

                    <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>

                        <span className="elab-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />

                        {

                            modelProgress !== null

                                ? `Downloading pronunciation model… ${modelProgress}%`

                                : "Listening to your pronunciation…"

                        }

                    </div>

                )

            }

            {

                feedback && feedback.verdict !== "unscored" && (

                    <div className={`elab-feedback ${VERDICT_META[feedback.verdict].tone}`}>

                        {VERDICT_META[feedback.verdict].emoji} {VERDICT_META[feedback.verdict].label}

                        {feedback.heard && (

                            <span style={{ marginLeft: 8, opacity: .75 }}>

                                — we heard "{feedback.heard}"

                            </span>

                        )}

                    </div>

                )

            }

        </BlockCard>

    );

}

export default PronunciationBlock;
