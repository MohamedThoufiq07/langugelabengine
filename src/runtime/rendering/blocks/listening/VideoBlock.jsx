import { useContext, useEffect, useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { ScreenCompletionContext } from "../../../screen/ScreenCompletionContext";

import clapperIcon from "../../../samples/assets/images/video_custom_clapperboard.png";
import sparklesIcon from "../../../samples/assets/images/video_custom_sparkles.png";
import newCloudIcon from "../../../samples/assets/images/video_custom_new_cloud.png";
import clockIcon from "../../../samples/assets/images/video_custom_clock_10.png";
import gradCapIcon from "../../../samples/assets/images/video_custom_grad_cap_large.png";
import bookIcon from "../../../samples/assets/images/video_custom_open_book.png";
import boyCharIcon from "../../../samples/assets/images/video_custom_boy_reading.png";

function VideoBlock({ block }) {
    const { reportAnswered } = useContext(ScreenCompletionContext) || {};
    const videoRef = useRef(null);
    const [completed, setCompleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState("00:00");
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

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) {
            const secs = Math.floor(video.duration);
            if (!isNaN(secs)) {
                const mins = Math.floor(secs / 60);
                const remainingSecs = secs % 60;
                const formatted = `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
                setDuration(formatted);
            }
        }
    };

    return (
        <BlockCard type="video" className="custom-video-card-block">
            {/* Header */}
            <div className="custom-video-card-header">
                <div className="custom-video-card-header-left">
                    <img src={clapperIcon} className="custom-video-clapper-icon" alt="Video Lesson" />
                    <div className="custom-video-title-area">
                        <div className="custom-video-title-row">
                            <h2 className="custom-video-title-text">VIDEO LESSON</h2>
                            <img src={sparklesIcon} className="custom-video-sparkles-icon" alt="Sparkles" />
                        </div>
                        <p className="custom-video-subtitle">Watch the lesson carefully and learn something new.</p>
                    </div>
                </div>
                <img src={newCloudIcon} className="custom-video-new-cloud" alt="New Tag" />
            </div>

            {/* Video Frame */}
            <div 
                className="custom-video-overlay-frame-html" 
                style={{ cursor: !completed && !isPlaying ? "pointer" : "default" }}
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
                    onLoadedMetadata={handleLoadedMetadata}
                    className="custom-video-element-html"
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
                    <div className="custom-video-banner-html">
                        🔒 Watch completely to unlock next screen (seeking & pausing disabled)
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="custom-video-card-footer">
                {/* Capsule 1: Duration */}
                <div className="custom-video-capsule">
                    <img src={clockIcon} className="custom-video-capsule-icon" alt="Clock" />
                    <div className="custom-video-capsule-text">
                        <span className="custom-video-capsule-label">Duration</span>
                        <span className="custom-video-capsule-value">{duration}</span>
                    </div>
                </div>

                {/* Capsule 2: Learn at your own pace */}
                <div className="custom-video-capsule">
                    <img src={gradCapIcon} className="custom-video-capsule-icon" alt="Graduation Cap" />
                    <div className="custom-video-capsule-text">
                        <span className="custom-video-capsule-label">Learn at</span>
                        <span className="custom-video-capsule-value">your own pace</span>
                    </div>
                </div>

                {/* Capsule 3: Build your knowledge */}
                <div className="custom-video-capsule">
                    <img src={bookIcon} className="custom-video-capsule-icon" alt="Book" />
                    <div className="custom-video-capsule-text">
                        <span className="custom-video-capsule-label">Build your</span>
                        <span className="custom-video-capsule-value">knowledge</span>
                    </div>
                </div>
            </div>

            {/* Anime boy reading overlap */}
            <img src={boyCharIcon} className="custom-video-boy-char" alt="Boy Reading Book" />
        </BlockCard>
    );
}

export default VideoBlock;
