import { useRef, useState, useEffect } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import { resolveMediaUrl } from "../../services/MediaResolver";

import dictationMicUrl from "../../../../assets/images/dictation_mic.png";
import dictationPlayPurpleUrl from "../../../../assets/images/dictation_play_purple.png";

function DictationBlock({ block }) {
    const content = block?.content || {};
    const items = Array.isArray(content.items) ? content.items : [];
    const activeItem = items[0] || {};

    const question = content.question || activeItem.question || "Listen and type what you hear.";
    const resolvedUrl = resolveMediaUrl(content);
    const audioRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [answer, setAnswer] = useState("");
    const [playbackError, setPlaybackError] = useState(false);

    const completion = useScreenCompletion();

    useEffect(() => {
        setPlaybackError(false);
    }, [resolvedUrl]);

    function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            setPlaybackError(false);
            audio.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.warn("Dictation audio play failed:", err);
                    setPlaybackError(true);
                });
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    }

    function handleChange(e) {
        const value = e.target.value;
        setAnswer(value);
        if (value.trim().length > 0) {
            completion?.reportAnswered(block.id);
        }
    }

    return (
        <BlockCard type="dictation" className="elab-dictation-card">
            <div className="elab-block-two-column dictation-custom">
                {/* Left Side Illustration */}
                <div className="elab-dictation-illustration-container">
                    <img src="/dictation left side girl.png" className="elab-dictation-girl-chibi" alt="Girl writing" />
                </div>

                {/* Right Side / Interactive Side */}
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header dictation-header-right">
                        <div className="elab-header-content">
                            <h3 className="elab-custom-title-purple">Dictation</h3>
                            <p className="elab-custom-subtitle">{question || "Listen and type what you hear."}</p>
                        </div>
                    </div>

                    {/* Play Banner Row */}
                    <div className="elab-dictation-play-banner">
                        <button className="elab-dictation-play-btn-circle" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? (
                                <div className="elab-dictation-pause-btn-custom" />
                            ) : (
                                <img src={dictationPlayPurpleUrl} className="elab-dictation-play-img" alt="Play" />
                            )}
                        </button>
                        <span className="elab-dictation-banner-text">
                            {playbackError ? "Audio unavailable" : "Play the clip, then type what you hear"}
                        </span>
                        <img src={dictationMicUrl} className="elab-dictation-mic-icon" alt="Mic" />
                    </div>

                    {/* Input Field */}
                    <div className="elab-dictation-input-container">
                        <input
                            type="text"
                            className="elab-dictation-input-field"
                            value={answer}
                            onChange={handleChange}
                            placeholder="Type what you hear..."
                        />
                        <span className="elab-dictation-input-pencil">✏️</span>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={resolvedUrl}
                onEnded={() => setIsPlaying(false)}
                onError={() => setPlaybackError(true)}
                style={{ display: "none" }}
            />
        </BlockCard>
    );
}

export default DictationBlock;
