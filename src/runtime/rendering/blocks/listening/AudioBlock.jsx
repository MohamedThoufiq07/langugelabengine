import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, Headphones } from "lucide-react";
import BlockCard from "../../../ui/components/BlockCard";

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

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (

        <BlockCard type="audio">

            <div className="listening-block">

                <div className="listening-header">

                    <div className="listening-icon">

                        <Headphones size={17} />

                    </div>

                    <div>

                        <h2>Listen Carefully</h2>

                        <p>Listen to the audio and answer the question.</p>

                    </div>

                </div>

                <div className="listening-player">

                    <button
                        className="listening-play-btn"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >

                        {isPlaying
                            ? <Pause size={22} fill="currentColor" />
                            : <Play size={22} fill="currentColor" style={{ marginLeft: "2px" }} />
                        }

                    </button>

                    <div className="listening-player-main">

                        <div className="listening-progress">

                            <div
                                className="listening-progress-fill"
                                style={{ width: `${progressPct}%` }}
                            />

                        </div>

                        <div className="listening-footer">

                            <button className="listening-secondary" onClick={replay}>

                                <RotateCcw size={13} />

                                Replay

                            </button>

                            <span className="listening-time">

                                {formatTime(currentTime)} / {formatTime(duration)}

                            </span>

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

                </div>

            </div>

        </BlockCard>

    );

}

export default AudioBlock;
