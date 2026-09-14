import { useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { resolveMediaUrl } from "../../services/MediaResolver";

// Import cutouts
import badgeAudioUrl from "../../../../assets/images/badge_audio.png";
import audioBoyUrl from "../../../../assets/images/audio_boy.png";
import audioWaveUrl from "../../../../assets/images/audio_wave.png";
import audioPlayBlueUrl from "../../../../assets/images/audio_play_blue.png";
import audioReplayUrl from "../../../../assets/images/audio_replay.png";

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`; 
}

function AudioBlock({ block }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    }

    function replay() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
    }

    function handleSeek(e) {
        const audio = audioRef.current;
        const newTime = parseFloat(e.target.value);
        if (Number.isFinite(newTime)) {
            setCurrentTime(newTime);
            if (audio) {
                audio.currentTime = newTime;
            }
        }
    }

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <BlockCard type="audio">
            <div className="elab-block-two-column audio-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <div className="elab-header-content">
                            <h3 className="elab-block-title" style={{ display: "inline-flex", background: "var(--theme-heading-board, url('/purple board.png')) no-repeat", backgroundSize: "100% 100%", width: "fit-content", padding: "10px 32px", color: "#ffffff", height: "52px", alignItems: "center", justifyContent: "center" }}>
                                Listen Carefully
                            </h3>
                            <p className="elab-custom-subtitle" style={{ marginTop: "16px" }}>Listen to the audio and answer the question</p>
                        </div>
                    </div>

                    {/* Custom Player Controls */}
                    <div className="elab-audio-player-custom-row" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                        {/* Play and Replay Buttons Row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            {/* Circular Play Button */}
                            <button className="elab-audio-play-btn-large" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                                {isPlaying ? (
                                    <div className="elab-audio-pause-btn-custom" />
                                ) : (
                                    <div className="elab-audio-play-btn-custom">
                                        <div className="elab-audio-play-triangle" />
                                    </div>
                                )}
                            </button>

                            {/* Replay Button */}
                            <button 
                                onClick={replay}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "#ffffff",
                                    border: "none",
                                    borderRadius: "18px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: "#4f46e5",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <span style={{ fontSize: "14px" }}>🔄</span> Replay
                            </button>
                        </div>

                        {/* Full Width Seek Bar Container */}
                        <div className="elab-audio-control-bar" style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px" }}>
                            {/* Slider Seek Bar */}
                            <div className="elab-audio-slider-container" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 100}
                                    step={0.1}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    onInput={handleSeek}
                                    aria-label="Audio progress"
                                    style={{
                                        width: "100%",
                                        height: "8px",
                                        borderRadius: "4px",
                                        accentColor: "#1E6BFF",
                                        cursor: "pointer",
                                        outline: "none",
                                        background: `linear-gradient(to right, #1E6BFF ${progressPct}%, #E2ECFA ${progressPct}%)`
                                    }}
                                />
                            </div>

                            <span className="elab-audio-duration-text" style={{ whiteSpace: "nowrap" }}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side Illustration */}
                <div className="elab-audio-illustration-container-single">
                    <img src="/listen carefully boy.png" className="elab-audio-boy-chibi-single" alt="Listen Carefully Boy" />
                </div>
            </div>

            <audio
                ref={audioRef}
                src={resolveMediaUrl(block.content) || null}
                onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                onDurationChange={e => setDuration(e.target.duration)}
                onEnded={() => setIsPlaying(false)}
                style={{ display: "none" }}
            />
        </BlockCard>
    );
}

export default AudioBlock;
