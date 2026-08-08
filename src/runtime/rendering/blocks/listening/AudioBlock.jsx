import { useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";

// Import cutouts
import badgeAudioUrl from "../../../samples/assets/images/badge_audio.png";
import audioBoyUrl from "../../../samples/assets/images/audio_boy.png";
import audioWaveUrl from "../../../samples/assets/images/audio_wave.png";
import audioPlayBlueUrl from "../../../samples/assets/images/audio_play_blue.png";
import audioReplayUrl from "../../../samples/assets/images/audio_replay.png";

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
                        <img src={badgeAudioUrl} className="elab-header-badge-img" alt="Badge" />
                        <div className="elab-header-content">
                            <h3 className="elab-custom-title-audio">
                                <span className="title-blue">Listen</span> <span className="title-pink">Carefully</span>
                            </h3>
                            <p className="elab-custom-subtitle">Listen to the audio and answer the question.</p>
                        </div>
                    </div>

                    {/* Custom Player Controls */}
                    <div className="elab-audio-player-custom-row">
                        {/* Circular Play Button */}
                        <button className="elab-audio-play-btn-large" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? (
                                <div className="elab-audio-pause-btn-custom" />
                            ) : (
                                <img src={audioPlayBlueUrl} className="elab-play-btn-bg" alt="Play Button" />
                            )}
                        </button>

                        {/* Control Bar */}
                        <div className="elab-audio-control-bar">
                            <button className="elab-audio-replay-btn" onClick={replay}>
                                <img src={audioReplayUrl} className="elab-replay-icon-img" alt="Replay" />
                                <span className="elab-replay-text">Replay</span>
                            </button>

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
                <div className="elab-audio-illustration-container">
                    <img src={audioWaveUrl} className="elab-audio-wave-bubble" alt="Audio Wave" />
                    <img src={audioBoyUrl} className="elab-audio-boy-chibi" alt="Audio Boy" />
                </div>
            </div>

            <audio
                ref={audioRef}
                src={block.content.url}
                onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                onEnded={() => setIsPlaying(false)}
                style={{ display: "none" }}
            />
        </BlockCard>
    );
}

export default AudioBlock;
