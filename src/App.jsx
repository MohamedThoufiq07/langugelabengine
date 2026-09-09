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
        bg: "/winter season/winter season bg.jpg",
        cardBg: "/winter season/winter cards bg.png"
    },
    {
        name: "Spring Season",
        bg: "/spring season/spring season bg.png",
        cardBg: "/spring season/spring card frame.png"
    },
    {
        name: "Desert Season",
        bg: "/desert season/desert season bg.jpg",
        cardBg: "/desert season/desert card bg.png"
    },
    {
        name: "Lava Season",
        bg: "/lava season/lava bg.jpg",
        cardBg: "/lava season/lava card bg.png"
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

        const seasonIndex = Math.floor(selectedExpIndex / 6) % SEASONS.length;
        const seasonTheme = SEASONS[seasonIndex];

        return {
            ...resolvedExperience,
            seasonTheme
        };
    }, [resolvedExperience, selectedExpIndex]);

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

        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>

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
