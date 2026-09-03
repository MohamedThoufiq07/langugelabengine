import { useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";

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

    function handleProgressClick(e) {
        const audio = audioRef.current;
        if (!audio || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    }

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <BlockCard type="audio">
            <div className="elab-block-two-column audio-custom">
                <div className="elab-block-interactive-side">
                    {/* Header */}
                    <div className="elab-custom-header">
                        <div className="elab-header-content">
                            <h3 className="elab-block-title" style={{ display: "inline-flex", background: "url('/purple board.png') no-repeat", backgroundSize: "100% 100%", padding: "10px 32px", color: "#ffffff", height: "52px", alignItems: "center", justifyContent: "center" }}>
                                Listen <span style={{ color: "#ff8ab4", marginLeft: "6px" }}>Carefully</span>
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
                            <div className="elab-audio-slider-container" onClick={handleProgressClick}>
                                <div className="elab-audio-slider-track">
                                    <div className="elab-audio-slider-fill" style={{ width: `${progressPct}%` }} />
                                    <div className="elab-audio-slider-handle" style={{ left: `calc(${progressPct}% - 6px)` }} />
                                </div>
                            </div>

                            <span className="elab-audio-duration-text">
                                {formatTime(currentTime)} / {formatTime(duration || 268)}
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
                src={block.content.url || null}
                onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                onEnded={() => setIsPlaying(false)}
                style={{ display: "none" }}
            />
        </BlockCard>
    );
}

export default AudioBlock;
