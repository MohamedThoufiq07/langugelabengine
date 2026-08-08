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
        <BlockCard type="video">
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    src={block.content.url}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={handleTimeUpdate}
                    onSeeking={handleSeeking}
                    onEnded={handleEnded}
                    style={{ width: "100%", borderRadius: "8px" }}
                />
            </div>
        </BlockCard>
    );
}

export default VideoBlock;
