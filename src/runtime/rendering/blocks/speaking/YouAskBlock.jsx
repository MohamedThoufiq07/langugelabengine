import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import RecordingService from "../../services/recording/RecordingService";

import badgeUrl from "../../../../assets/images/speaking_masks_badge.png";
import illustrationUrl from "../../../../assets/images/speaking_puppet_show.png";
import recordDot from "../../../../assets/images/speaking_record_dot.png";

function YouAskBlock({ block }) {
    const { 
        topic,
        prompt,
        instructions = "Ask 2-3 questions about this topic",
        context = "",
        referenceAudio = null 
    } = block.content;
    const displayTopic = topic || prompt || "Ask Questions";

    const [recording, setRecording] = useState(false);
    const [audio, setAudio] = useState(null);
    const [error, setError] = useState("");
    const [transcript, setTranscript] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const completion = useScreenCompletion();

    async function startRecording() {
        try {
            await RecordingService.startRecording();
            setRecording(true);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function stopRecording() {
        try {
            const result = await RecordingService.stopRecording();
            setRecording(false);
            setAudio(result.url);
            setTranscript(result.transcript || "");
        } catch (err) {
            setError(err.message);
        }
    }

    function handleSubmit() {
        if (audio) {
            setSubmitted(true);
            completion?.saveAnswer?.(block.id, {
                audio: audio,
                transcript: transcript,
                topic: topic
            });
            completion?.reportAnswered(block.id);
        }
    }

    return (
        <BlockCard type="you_ask">
            <div className="speaking-custom-card-content">
                <div className="speaking-custom-illustration">
                    <img
                        src={illustrationUrl}
                        className="you-ask-illustration"
                        alt="Children asking questions"
                    />
                </div>

                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle youask">
                            <img src={badgeUrl} className="speaking-badge-img" alt="You Ask" />
                        </div>
                        <div className="speaking-badge-tag youask">
                            YOU ASK
                        </div>
                    </div>

                    <div className="speaking-divider-line" />

                    <div className="you-ask-prompt-panel">
                        <h3 className="speaking-topic-title">
                            {displayTopic}
                        </h3>

                        <p className="speaking-instructions">
                            {instructions}
                        </p>
                    </div>

                    {context && (
                        <div className="speaking-context-box">
                            <small className="speaking-context-label">Context:</small>
                            <p className="speaking-context-text">{context}</p>
                        </div>
                    )}

                    {referenceAudio && (
                        <div className="elab-media-frame you-ask-audio-frame">
                            <audio src={referenceAudio} controls className="elab-media-player" />
                        </div>
                    )}

                    {!submitted ? (
                        <div className="speaking-recorder-section">
                            {!audio ? (
                                <>
                                    <button
                                        onClick={recording ? stopRecording : startRecording}
                                        className={`elab-recording-btn ${recording ? "is-recording" : ""}`}
                                        disabled={submitted}
                                    >
                                        <img src={recordDot} alt="Record" className="record-dot" />
                                        {recording ? "Stop Recording" : "Start Recording"}
                                    </button>
                                    <span className={`you-ask-recording-status ${recording ? "is-recording" : ""}`}>
                                        {recording ? "Recording in progress..." : "Ready to record your questions"}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="you-ask-recorded-label">
                                        <span className="you-ask-recorded-dot" />
                                        Recording ready
                                    </div>
                                    <div className="elab-media-frame you-ask-audio-frame">
                                        <audio src={audio} controls className="elab-media-player" />
                                    </div>
                                    {transcript && (
                                        <div className="speaking-transcript">
                                            <small>Transcribed:</small>
                                            <p>{transcript}</p>
                                        </div>
                                    )}
                                    <div className="you-ask-recording-actions">
                                        <button
                                            onClick={handleSubmit}
                                            className="elab-submit-btn"
                                        >
                                            Submit Questions
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAudio(null);
                                                setTranscript("");
                                            }}
                                            className="elab-retry-btn"
                                        >
                                            Record Again
                                        </button>
                                    </div>
                                </>
                            )}
                            {error && <div className="elab-error-message">{error}</div>}
                        </div>
                    ) : (
                        <div className="elab-submission-success">
                            <div className="elab-success-icon">✅</div>
                            <p>Your questions have been recorded!</p>
                        </div>
                    )}
                </div>
            </div>
        </BlockCard>
    );
}

export default YouAskBlock;
