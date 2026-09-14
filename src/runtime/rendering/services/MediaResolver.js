/**
 * MediaResolver.js
 * Utility to resolve relative or absolute media URLs from JSON block content or strings.
 * Handles paths starting with /media/ by prefixing the Django backend URL (default http://localhost:8000).
 * Preserves frontend local asset imports (e.g. /src/runtime/samples/...) without prepending backend URL.
 */

const BACKEND_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    || "http://localhost:8000";

export function resolveMediaUrl(contentOrUrl) {
    if (!contentOrUrl) return null;

    let rawUrl = "";
    if (typeof contentOrUrl === "string") {
        rawUrl = contentOrUrl;
    } else if (typeof contentOrUrl === "object") {
        const firstItem = (Array.isArray(contentOrUrl.items) && contentOrUrl.items[0]) || 
                          (Array.isArray(contentOrUrl.clips) && contentOrUrl.clips[0]) || 
                          (Array.isArray(contentOrUrl.passages) && contentOrUrl.passages[0]) || 
                          (Array.isArray(contentOrUrl.audioClips) && contentOrUrl.audioClips[0]) ||
                          null;

        rawUrl = contentOrUrl.url ||
                 contentOrUrl.audioUrl ||
                 contentOrUrl.audio ||
                 contentOrUrl.media_url ||
                 contentOrUrl.mediaUrl ||
                 contentOrUrl.src ||
                 contentOrUrl.video ||
                 contentOrUrl.image ||
                 contentOrUrl.imageUrl ||
                 contentOrUrl.image_url ||
                 contentOrUrl.sourceImage ||
                 contentOrUrl.source_image ||
                 contentOrUrl.targetImage ||
                 contentOrUrl.target_image ||
                 contentOrUrl.referenceAudio ||
                 contentOrUrl.clipUrl ||
                 contentOrUrl.file ||
                 contentOrUrl.sound ||
                 contentOrUrl.audio_url ||
                 contentOrUrl.video_url ||
                 (firstItem && (
                     firstItem.url || 
                     firstItem.audioUrl || 
                     firstItem.audio || 
                     firstItem.media_url || 
                     firstItem.mediaUrl || 
                     firstItem.src || 
                     firstItem.image ||
                     firstItem.imageUrl ||
                     firstItem.sourceImage ||
                     firstItem.source_image ||
                     firstItem.file ||
                     firstItem.clipUrl
                 )) ||
                 "";
    }

    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
        return null;
    }

    const cleanUrl = rawUrl.trim();

    if (
        cleanUrl.startsWith("http://") ||
        cleanUrl.startsWith("https://") ||
        cleanUrl.startsWith("data:") ||
        cleanUrl.startsWith("blob:")
    ) {
        return cleanUrl;
    }

    if (
        cleanUrl.startsWith("/src/") ||
        cleanUrl.startsWith("src/") ||
        cleanUrl.startsWith("/@fs/") ||
        cleanUrl.startsWith("/@vite/") ||
        cleanUrl.startsWith("/assets/") ||
        cleanUrl.startsWith("assets/")
    ) {
        return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    }

    if (cleanUrl.startsWith("/media/") || cleanUrl.startsWith("media/")) {
        const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `${BACKEND_URL}${path}`;
    }

    return cleanUrl;
}

export default resolveMediaUrl;
