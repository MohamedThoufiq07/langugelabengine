import { useCallback, useContext, useEffect, useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { ScreenCompletionContext } from "../../../screen/ScreenCompletionContext";

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

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handlePause = useCallback(() => {
        if (!completed) {
            const video = videoRef.current;
            if (video) {
                video.play().catch(() => {});
            }
        } else {
            setIsPlaying(false);
        }
    }, [completed]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (completed) return;

        if (video.currentTime > maxTimeWatchedRef.current + 1.5) {
            isSeekingRef.current = true;
            video.currentTime = maxTimeWatchedRef.current;
            isSeekingRef.current = false;
        } else if (!isSeekingRef.current) {
            maxTimeWatchedRef.current = Math.max(maxTimeWatchedRef.current, video.currentTime);
        }
    }, [completed]);

    const handleSeeking = useCallback(() => {
        const video = videoRef.current;
        if (!video || completed) return;

        if (video.currentTime > maxTimeWatchedRef.current) {
            video.currentTime = maxTimeWatchedRef.current;
        }
    }, [completed]);

    const handleEnded = useCallback(() => {
        setCompleted(true);
        setIsPlaying(false);
        sessionStorage.setItem(storageKey, "true");
        if (reportAnswered) {
            reportAnswered(block.id);
        }
    }, [storageKey, reportAnswered, block.id]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch((err) => {
                if (import.meta.env.DEV) {
                    console.error("Video play failed:", err);
                }
            });
        } else if (completed) {
            video.pause();
        }
    }, [completed]);

    const handleLoadedMetadata = useCallback(() => {
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
    }, []);

    const jsonStyles = block.styles || {};
    const cardStyle = {
        width: jsonStyles.blockWidth ? jsonStyles.blockWidth : "933px",
        minHeight: jsonStyles.minHeight ? jsonStyles.minHeight : "auto",
        margin: "0 auto"
    };

    return (
        <BlockCard type="video" style={cardStyle}>
            <BlockHeader
                type="video"
                title="Video"
            />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0.25rem" }}>
                <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    src={block.content.url || null}
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
