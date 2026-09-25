/**
 * MediaResolver.js
 * Utility to resolve relative or absolute media URLs from JSON block content or strings.
 * Handles paths starting with /media/ by prefixing the Django backend URL (default http://187.52.116.48).
 * Preserves frontend local asset imports (e.g. /src/runtime/samples/...) without prepending backend URL.
 */

const BACKEND_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    || "http://187.52.116.48";

export function resolveMediaUrl(contentOrUrl) {
    if (!contentOrUrl) return null;

    let rawUrl = "";
    if (typeof contentOrUrl === "string") {
        rawUrl = contentOrUrl;
    } else if (typeof contentOrUrl === "object") {
        const obj = contentOrUrl.content || contentOrUrl;

        // 1. Check direct candidate properties in priority order
        const candidates = [
            obj.url,
            obj.media_url,
            obj.mediaUrl,
            obj.video,
            obj.video_url,
            obj.videoUrl,
            obj.videoPath,
            obj.video_path,
            obj.audio,
            obj.audio_url,
            obj.audioUrl,
            obj.audioPath,
            obj.audio_path,
            obj.image,
            obj.image_url,
            obj.imageUrl,
            obj.imagePath,
            obj.image_path,
            obj.src,
            obj.file,
            obj.filePath,
            obj.file_path,
            obj.path,
            obj.mediaPath,
            obj.media_path,
            obj.sourceImage,
            obj.source_image,
            obj.targetImage,
            obj.target_image,
            obj.referenceAudio,
            obj.reference_audio,
            obj.clipUrl,
            obj.clip_url,
            obj.sound,
            obj.sound_url,
            obj.soundUrl,
            obj.frontImage,
            obj.backImage,
            obj.frontAudio,
            obj.backAudio,
            obj.poster,
            obj.posterUrl,
            obj.poster_url
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim()) {
                rawUrl = candidate.trim();
                break;
            }
        }

        // 2. Check resolvedMedia array if present
        if (!rawUrl && Array.isArray(obj.resolvedMedia) && obj.resolvedMedia.length > 0) {
            for (const item of obj.resolvedMedia) {
                if (item && typeof item.url === "string" && item.url.trim()) {
                    rawUrl = item.url.trim();
                    break;
                }
            }
        }

        // 3. Search nested arrays (items, clips, passages, audioClips, elements, cards, etc.)
        if (!rawUrl) {
            const list = (Array.isArray(obj.items) && obj.items) ||
                         (Array.isArray(obj.clips) && obj.clips) ||
                         (Array.isArray(obj.passages) && obj.passages) ||
                         (Array.isArray(obj.audioClips) && obj.audioClips) ||
                         (Array.isArray(obj.elements) && obj.elements) ||
                         (Array.isArray(obj.cards) && obj.cards) ||
                         null;

            if (list) {
                for (const item of list) {
                    if (typeof item === "string" && item.trim()) {
                        rawUrl = item.trim();
                        break;
                    } else if (item && typeof item === "object") {
                        const childUrl = resolveMediaUrl(item);
                        if (childUrl) {
                            return childUrl;
                        }
                    }
                }
            }
        }
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

    if (cleanUrl.startsWith("/media_library/") || cleanUrl.startsWith("media_library/")) {
        const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `${BACKEND_URL}/media${path}`;
    }

    if (cleanUrl.startsWith("/uploads/") || cleanUrl.startsWith("uploads/")) {
        const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `${BACKEND_URL}/media${path}`;
    }

    return cleanUrl;
}

export default resolveMediaUrl;
