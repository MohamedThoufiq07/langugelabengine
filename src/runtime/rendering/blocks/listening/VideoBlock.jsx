import { useContext, useEffect, useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { ScreenCompletionContext } from "../../../screen/ScreenCompletionContext";

function VideoBlock({ block }) {
    const { reportAnswered } = useContext(ScreenCompletionContext) || {};
    const videoRef = useRef(null);
    const [completed, setCompleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const maxTimeWatchedRef = useRef(0);
    const isSeekingRef = useRef(false);

    const storageKey = `video-completed-${block.id}`;

    useEffect(() => {
        // Load initial completed state from session storage
        const hasCompleted = sessionStorage.getItem(storageKey) === "true";
        if (hasCompleted) {
            setCompleted(true);
            if (reportAnswered) {
                reportAnswered(block.id);
            }
        }
    }, [block.id, reportAnswered, storageKey]);

    const handlePlay = () => {
        setIsPlaying(true);
    };

    const handlePause = (e) => {
        if (!completed) {
            // Prevent manual pause by forcing play again
            const video = videoRef.current;
            if (video) {
                video.play().catch(() => {});
            }
        } else {
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;

        if (completed) return;

        // If user is trying to skip forward (seeking ahead of maxTimeWatched + buffer)
        if (video.currentTime > maxTimeWatchedRef.current + 1.5) {
            isSeekingRef.current = true;
            video.currentTime = maxTimeWatchedRef.current;
            isSeekingRef.current = false;
        } else if (!isSeekingRef.current) {
            // Keep track of maximum progress watched
            maxTimeWatchedRef.current = Math.max(maxTimeWatchedRef.current, video.currentTime);
        }
    };

    const handleSeeking = () => {
        const video = videoRef.current;
        if (!video || completed) return;

        if (video.currentTime > maxTimeWatchedRef.current) {
            video.currentTime = maxTimeWatchedRef.current;
        }
    };

    const handleEnded = () => {
        setCompleted(true);
        setIsPlaying(false);
        sessionStorage.setItem(storageKey, "true");
        if (reportAnswered) {
            reportAnswered(block.id);
        }
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch((err) => {
                console.error("Video play failed:", err);
            });
        } else if (completed) {
            video.pause();
        }
    };

    return (
        <BlockCard type="video">
            <BlockHeader type="video" title="Video" />
            <div 
                className="elab-media-frame" 
                style={{ position: "relative", cursor: !completed && !isPlaying ? "pointer" : "default" }}
                onClick={!completed && !isPlaying ? togglePlay : undefined}
            >
                <video
                    ref={videoRef}
                    controls={completed} // Only show standard controls if already watched completely
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    src={block.content.url}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={handleTimeUpdate}
                    onSeeking={handleSeeking}
                    onEnded={handleEnded}
                    style={{
                        width: "100%",
                        borderRadius: "12px",
                        outline: "none"
                    }}
                />
                {!completed && !isPlaying && (
                    <div className="video-play-overlay">
                        <button className="video-play-btn" aria-label="Play video">
                            <svg viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>
                )}
                {!completed && (
                    <div className="video-overlay-banner">
                        🔒 Watch completely to unlock next screen (seeking & pausing disabled)
                    </div>
                )}
            </div>
        </BlockCard>
    );
}

export default VideoBlock;
