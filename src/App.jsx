import { useEffect, useMemo, useState } from "react";

import RuntimeEngine from "./runtime/engine/RuntimeEngine";
import RuntimePlayer from "./runtime/player/RuntimePlayer";
import LoadingScreen from "./runtime/player/LoadingScreen";

// Discover all extracted experience.json files across sample folders
const experienceModules = import.meta.glob(
    "./runtime/samples/**/experience.json",
    { eager: true, import: "default" }
);

// Discover all sample assets across sample folders
const assetModules = import.meta.glob(
    "./runtime/samples/**/assets/**/*",
    { eager: true, query: "?url", import: "default" }
);

const LOCAL_SAMPLE_ASSETS = Object.fromEntries(
    Object.entries(assetModules).map(([path, url]) => [path.split("/").pop(), url])
);

function useLocalSampleAssets(rawExperience) {

    return useMemo(() => {

        if (!rawExperience) return null;

        const clone = structuredClone(rawExperience);

        function resolveAssetReferences(value) {

            if (Array.isArray(value)) {

                return value.map(resolveAssetReferences);

            }

            if (!value || typeof value !== "object") {

                if (typeof value !== "string") return value;

                const filename = value.split("/").pop();

                return LOCAL_SAMPLE_ASSETS[filename] || value;

            }

            return Object.fromEntries(
                Object.entries(value).map(([key, child]) => [
                    key,
                    resolveAssetReferences(child)
                ])
            );

        }

        return resolveAssetReferences(clone);

    }, [rawExperience]);

}

const SEASONS = [
    {
        name: "Summer Season",
        bg: "/summer season/bg1.png",
        cardBg: "/summer season/summer bg board.png"
    },
    {
        name: "Winter Season",
        bg: "/winter season/winter season bg.png",
        cardBg: "/winter season/winter cards bg.png",
        headingBoard: "/winter season/winter heading board.png",
        arrowSign: "/winter season/winter arrow sign.png"
    },
    {
        name: "Spring Season",
        bg: "/spring season/spring season bg.png",
        cardBg: "/spring season/spring card frame.png"
    },
    {
        name: "Desert Season",
        bg: "/desert season/desert season bg.png",
        cardBg: "/desert season/desert card bg.png"
    },
    {
        name: "Lava Season",
        bg: "/lava season/lava bg.png",
        cardBg: "/lava season/lava card bg.png",
        headingBoard: "/lava season/lava heading bg.png",
        arrowSign: "/lava season/lava season arrow.png"
    },
    {
        name: "Marine Season",
        bg: "/marine season/marine season bg.png",
        cardBg: "/marine season/marine card bg.png"
    }
];

function App() {

    const experiencesList = useMemo(() => {

        return Object.entries(experienceModules).map(([filePath, expData], idx) => {

            const parts = filePath.split("/");
            const folderName = parts[parts.length - 2] || "Sample";
            const cleanTitle = (expData && expData.title)
                ? expData.title
                : folderName.replace(/_/g, " ").replace(/\.\.\./g, "").trim();

            // Group 6 lessons per season:
            // Lessons 1-6 (idx 0..5): Summer Season
            // Lessons 7-12 (idx 6..11): Winter Season
            // Lessons 13-18 (idx 12..17): Spring Season
            // Lessons 19-24 (idx 18..23): Desert Season
            // Lessons 25-30 (idx 24..29): Lava Season
            // Lessons 31-36 (idx 30..35): Marine Season
            const seasonIndex = Math.floor(idx / 6) % SEASONS.length;
            const season = SEASONS[seasonIndex];

            return {
                id: (expData && expData.id) || folderName,
                folderName,
                title: cleanTitle,
                season,
                data: expData
            };

        });

    }, []);

    const [selectedExpIndex, setSelectedExpIndex] = useState(0);
    const [ready, setReady] = useState(false);
    const [showExitHint, setShowExitHint] = useState(false);

    const currentRawExp = experiencesList[selectedExpIndex]?.data || null;
    const resolvedExperience = useLocalSampleAssets(currentRawExp);

    const experienceWithSeason = useMemo(() => {
        if (!resolvedExperience) return null;

        const currentExp = experiencesList[selectedExpIndex];
        const seasonTheme = currentExp?.season || SEASONS[Math.floor(selectedExpIndex / 6) % SEASONS.length];

        return {
            ...resolvedExperience,
            seasonTheme
        };
    }, [resolvedExperience, selectedExpIndex, experiencesList]);

    const [runtime, setRuntime] = useState(() => new RuntimeEngine());

    useEffect(() => {

        let isMounted = true;

        async function initializeRuntime() {

            if (!experienceWithSeason) {

                setReady(false);

                return;

            }

            setReady(false);

            const newRuntime = new RuntimeEngine();

            await newRuntime.start(experienceWithSeason);

            if (isMounted) {

                setRuntime(newRuntime);

                setReady(true);

            }

        }

        initializeRuntime();

        return () => {

            isMounted = false;

        };

    }, [experienceWithSeason]);

    function handleNextLesson() {
        if (experiencesList.length > 0) {
            setSelectedExpIndex((prev) => (prev + 1) % experiencesList.length);
        }
    }

    function handleExit() {

        if (window.electronAPI?.closeEngine) {

            window.electronAPI.closeEngine();

            return;

        }

        window.close();

        setTimeout(() => {

            if (!window.closed) setShowExitHint(true);

        }, 150);

    }

    return (

        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Temporary lesson picker for testing */}
            <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 9999,
                background: 'rgba(15, 23, 42, 0.85)',
                WebkitBackdropFilter: 'blur(8px)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <label style={{ color: '#fff', fontSize: '13px', fontWeight: '600', fontFamily: 'sans-serif' }}>
                    Select Lesson:
                </label>
                <select
                    value={selectedExpIndex}
                    onChange={(e) => setSelectedExpIndex(Number(e.target.value))}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {experiencesList.map((exp, idx) => (
                        <option key={exp.id || idx} value={idx}>
                            Lesson {idx + 1}: {exp.title} ({exp.season?.name || 'Default'})
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

                {!ready ? (

                    <LoadingScreen />

                ) : (

                    <RuntimePlayer

                        key={experiencesList[selectedExpIndex]?.id || selectedExpIndex}

                        runtime={runtime}

                        onNextLesson={handleNextLesson}

                        onExit={handleExit}

                    />

                )}

            </div>

            {showExitHint && (

                <div className="elab-exit-hint-overlay">

                    <div className="elab-exit-hint-card">

                        <h2>👋 All done!</h2>

                        <p>Your browser won't let this tab close itself — you can close it manually now.</p>

                        <button

                            type="button"

                            className="elab-btn-icon"

                            onClick={() => setShowExitHint(false)}

                        >

                            Back to experience

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}

export default App;
