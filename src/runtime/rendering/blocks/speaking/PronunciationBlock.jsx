import { useState } from "react";
import RecordingService from "../../services/recording/RecordingService";
import PronunciationService from "../../services/speech/PronunciationService";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import pronunciationBadge from "../../../../assets/images/speaking_pronunciation_badge.png";
import recordDot from "../../../../assets/images/speaking_record_dot.png";

const VERDICT_META = {
    excellent: { emoji: "🌟", label: "Excellent! Correct!", tone: "success" },
    good: { emoji: "🙂", label: "Good — Correct!", tone: "success" },
    try_again: { emoji: "🔁", label: "Try again", tone: "warning" }
};

function PronunciationBlock({ block }) {
    const {
        word: singleWord,
        items = [],
        question,
        prompt
    } = block.content;

    const firstItem = items[0] || {};
    const targetWord = singleWord || firstItem.word || firstItem.phrase || firstItem.text || "";
    const questionText = question || prompt || "";

    const [recording, setRecording] = useState(false);
    const [audio, setAudio] = useState(null);
    const [error, setError] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [modelProgress, setModelProgress] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [recordedSubmitted, setRecordedSubmitted] = useState(false);
    const completion = useScreenCompletion();

    const isAssessment = window.__isAssessment;

    async function startRecording() {
        try {
            await RecordingService.startRecording();
            setRecording(true);
            setError("");
            setFeedback(null);
            setRecordedSubmitted(false);
        }
        catch (err) {
            setError(err.message);
        }
    }

    async function stopRecording() {
        const result = await RecordingService.stopRecording();
        setRecording(false);
        setAudio(result.url);
        completion?.reportAnswered(block.id);

        if (isAssessment) {
            // In Assessment mode: simply set "Your recording submitted" and save answer
            setRecordedSubmitted(true);
            completion?.saveAnswer?.(block.id, { recorded: true, audioUrl: result.url });
            return;
        }

        // Lesson mode: analyze pronunciation and give feedback
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

            const score = PronunciationService.scorePronunciation(heardText, targetWord);
            setFeedback(score);
            completion?.saveAnswer?.(block.id, { recorded: true, audioUrl: result.url, score });
        }
        catch (err) {
            // Fallback for lesson mode if offline/browser speech error occurs
            setFeedback({ verdict: "excellent", heard: targetWord });
        }
        finally {
            setAnalyzing(false);
            setModelProgress(null);
        }
    }

    return (
        <BlockCard type="pronunciation">
            <div className="speaking-custom-card-content">
                <div className="speaking-custom-interactive">
                    <div className="speaking-card-header">
                        <div className="speaking-badge-circle pronunciation">
                            <img src={pronunciationBadge} className="speaking-badge-img" alt="Pronunciation" />
                        </div>
                        <div className="speaking-badge-tag pronunciation">
                            PRONUNCIATION PRACTICE
                        </div>
                    </div>

                    {questionText && (
                        <p className="elab-block-subtitle" style={{ margin: "0.25rem 0 0.5rem 0", color: "#475569", fontWeight: 600 }}>
                            {questionText}
                        </p>
                    )}

                    {targetWord && (
                        <div style={{ margin: "0.5rem 0" }}>
                            <h2 className="speaking-practice-word" style={{ margin: 0 }}>
                                {targetWord}
                            </h2>
                        </div>
                    )}

                    {error && (
                        <div className="elab-feedback error">{error}</div>
                    )}

                    <div className="elab-chip-row">
                        {!recording ? (
                            <button 
                                className="speaking-custom-btn voice" 
                                onClick={startRecording}
                            >
                                <img src={recordDot} alt="Start" style={{ borderRadius: "50%" }} /> Start Recording
                            </button>
                        ) : (
                            <button className="speaking-custom-btn danger" onClick={stopRecording}>
                                ⏹ Stop Recording
                            </button>
                        )}
                    </div>

                    {/* Assessment Mode: Show "Your recording submitted" */}
                    {isAssessment && recordedSubmitted && (
                        <div className="elab-feedback success" style={{ background: "#dcfce7", color: "#15803d", border: "1.5px solid #86efac", fontWeight: 700, padding: "0.75rem 1rem", borderRadius: "0.75rem", marginTop: "0.75rem" }}>
                            🎉 Your recording submitted
                        </div>
                    )}

                    {/* Lesson Mode: Analyzing indicator */}
                    {!isAssessment && analyzing && (
                        <div className="elab-feedback" style={{ background: "#F1F5F9", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
                            <span className="elab-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            {modelProgress !== null
                                ? `Downloading pronunciation model… ${modelProgress}%`
                                : "Analyzing your pronunciation…"}
                        </div>
                    )}

                    {/* Lesson Mode: Correct feedback */}
                    {!isAssessment && feedback && feedback.verdict !== "unscored" && (
                        <div className={`elab-feedback ${VERDICT_META[feedback.verdict]?.tone || "success"}`} style={{ marginTop: "0.75rem" }}>
                            {VERDICT_META[feedback.verdict]?.emoji || "🌟"} {VERDICT_META[feedback.verdict]?.label || "Correct!"}
                        </div>
                    )}
                </div>

                <div className="speaking-custom-illustration">
                    <img
                        src="/listen carefully boy.png"
                        alt="Boy practicing pronunciation"
                    />
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default PronunciationBlock;
