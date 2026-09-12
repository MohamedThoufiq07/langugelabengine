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
        rawUrl = contentOrUrl.url ||
                 contentOrUrl.image ||
                 contentOrUrl.media_url ||
                 contentOrUrl.mediaUrl ||
                 contentOrUrl.src ||
                 contentOrUrl.video ||
                 contentOrUrl.audio ||
                 contentOrUrl.documentImage ||
                 contentOrUrl.documentUrl ||
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
