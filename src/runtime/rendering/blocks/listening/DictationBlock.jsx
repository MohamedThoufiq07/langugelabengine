import { useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

function DictationBlock({ block }) {

    const { url, question } = block.content;

    const audioRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [answer, setAnswer] = useState("");
    const [playbackError, setPlaybackError] = useState(false);

    const completion = useScreenCompletion();

    function togglePlay() {

        const audio = audioRef.current;

        if (!audio) return;

        if (audio.paused) {

            audio.play()
                .then(() => setIsPlaying(true))
                .catch(() => setPlaybackError(true));

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

        <BlockCard type="dictation">

            <BlockHeader

                type="dictation"

                title="Dictation"

                subtitle={question || "Listen and type what you hear"}

            />

            <div className="elab-audio-player">

                <button

                    type="button"

                    className={`elab-audio-play-btn ${isPlaying ? "is-playing" : ""}`}

                    onClick={togglePlay}

                    aria-label={isPlaying ? "Pause" : "Play"}

                >

                    {isPlaying ? "⏸" : "▶"}

                </button>

                <span className="elab-audio-time">

                    {playbackError ? "Audio unavailable — you can still type your answer" : "Play the clip, then type what you hear"}

                </span>

                <audio

                    ref={audioRef}

                    src={url}

                    onEnded={() => setIsPlaying(false)}

                    onError={() => setPlaybackError(true)}

                    style={{ display: "none" }}

                />

            </div>

            <input

                className="elab-input"

                value={answer}

                onChange={handleChange}

                placeholder="Type what you hear..."

                style={{ marginTop: "12px" }}

            />

        </BlockCard>

    );

}

export default DictationBlock;
