import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import PronunciationService from "../../services/speech/PronunciationService";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import recorderBadge from "../../../../assets/images/speaking_recorder_badge.png";
import voiceRecorderImg from "../../../../assets/images/speaking_voice_recorder_illustration.png";
import recordDot from "../../../../assets/images/speaking_record_dot.png";

function VoiceRecorderBlock({ block }) {

    const { 
        prompt,
        audio = null,
        audioFirst = false
    } = block.content;

    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);

    const [userAudio, setUserAudio] = useState(null);

    const [duration, setDuration] = useState(0);

    const [error, setError] = useState("");

    const [analyzing, setAnalyzing] = useState(false);

    const [heardText, setHeardText] = useState(null);
    
    const [audioPlayed, setAudioPlayed] = useState(false);
    const [useAudioMode, setUseAudioMode] = useState(audioFirst);

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

        setUserAudio(result.url);

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

            <div className="speaking-custom-card-content">
                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle voice">
                            <img src={recorderBadge} className="speaking-badge-img" alt="Voice Recorder" />
                        </div>
                        <div className="speaking-badge-tag voice">
                            VOICE RECORDER
                        </div>
                    </div>

                    <p className="elab-block-subtitle" style={{ margin: "0.25rem 0", color: "#475569", fontWeight: 600 }}>
                        {prompt || "Please record your response."}
                    </p>

                    <div className="speaking-divider-line" />

                    {audio && (
                        <div className="voice-audio-section">
                            <div className="elab-media-frame">
                                <audio 
                                    src={audio} 
                                    controls 
                                    className="elab-media-player"
                                    onPlay={() => setAudioPlayed(true)}
                                />
                            </div>
                            {useAudioMode && (
                                <div className="audio-first-toggle">
                                    <label className="toggle-label">
                                        <input 
                                            type="checkbox" 
                                            checked={useAudioMode}
                                            onChange={(e) => setUseAudioMode(e.target.checked)}
                                            className="toggle-input"
                                        />
                                        <span className="toggle-text">Audio-First Mode</span>
                                    </label>
                                    {!audioPlayed && (
                                        <small className="audio-reminder">Listen first before recording</small>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {recording && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0.25rem 0" }}>
                            <span className="elab-recording-dot" />
                            <span className="elab-plain-text" style={{ fontWeight: 600, color: "#e11d48" }}>
                                Recording{paused ? " (paused)" : ""}...
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="elab-feedback error">{error}</div>
                    )}

                    <div className="elab-chip-row">
                        {!recording && (
                            <button className="speaking-custom-btn voice" onClick={startRecording}>
                                <img src={recordDot} alt="Start" style={{ borderRadius: "50%" }} /> Start Recording
                            </button>
                        )}

                        {recording && !paused && (
                            <button className="speaking-custom-btn voice" onClick={pauseRecording}>
                                ⏸ Pause
                            </button>
                        )}

                        {recording && paused && (
                            <button className="speaking-custom-btn voice" onClick={resumeRecording}>
                                ▶ Resume
                            </button>
                        )}

                        {recording && (
                            <button className="speaking-custom-btn danger" onClick={stopRecording}>
                                ⏹ Stop
                            </button>
                        )}
                    </div>

                    {userAudio && (
                        <div className="elab-media-frame">
                            <audio controls src={userAudio} />
                            <p className="elab-caption" style={{ padding: "10px 14px" }}>
                                Duration: {Math.round(duration / 1000)} sec
                            </p>
                        </div>
                    )}

                    {analyzing && (
                        <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>
                            <span className="elab-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            Transcribing your recording…
                        </div>
                    )}

                    {heardText && (
                        <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>
                            🗣️ We heard: "{heardText}"
                        </div>
                    )}
                </div>

                <div className="speaking-custom-illustration">
                    <img 
                        src={voiceRecorderImg} 
                        alt="Voice Recorder Illustration" 
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default VoiceRecorderBlock;

