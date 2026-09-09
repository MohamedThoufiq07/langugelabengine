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

function App() {

    const experiencesList = useMemo(() => {

        return Object.entries(experienceModules).map(([filePath, expData]) => {

            const parts = filePath.split("/");
            const folderName = parts[parts.length - 2] || "Sample";
            const cleanTitle = (expData && expData.title)
                ? expData.title
                : folderName.replace(/_/g, " ").replace(/\.\.\./g, "").trim();

            return {
                id: (expData && expData.id) || folderName,
                folderName,
                title: cleanTitle,
                data: expData
            };

        });

    }, []);

    const [selectedExpIndex, setSelectedExpIndex] = useState(0);
    const [ready, setReady] = useState(false);
    const [showExitHint, setShowExitHint] = useState(false);

    const currentRawExp = experiencesList[selectedExpIndex]?.data || null;
    const resolvedExperience = useLocalSampleAssets(currentRawExp);

    const [runtime, setRuntime] = useState(() => new RuntimeEngine());

    useEffect(() => {

        let isMounted = true;

        async function initializeRuntime() {

            if (!resolvedExperience) {

                setReady(false);

                return;

            }

            setReady(false);

            const newRuntime = new RuntimeEngine();

            await newRuntime.start(resolvedExperience);

            if (isMounted) {

                setRuntime(newRuntime);

                setReady(true);

            }

        }

        initializeRuntime();

        return () => {

            isMounted = false;

        };

    }, [resolvedExperience]);

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

            {experiencesList.length > 0 && (

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    background: '#0f172a',
                    color: '#fff',
                    zIndex: 9999,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    flexShrink: 0
                }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#94a3b8' }}>📚 Experience Package:</span>

                        <select

                            value={selectedExpIndex}

                            onChange={(e) => setSelectedExpIndex(Number(e.target.value))}

                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: '#1e293b',
                                color: '#f8fafc',
                                border: '1px solid #475569',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                outline: 'none'
                            }}

                        >

                            {experiencesList.map((exp, idx) => (

                                <option key={exp.id + idx} value={idx}>

                                    {idx + 1}. {exp.title} ({exp.folderName})

                                </option>

                            ))}

                        </select>

                    </div>

                    <span style={{ fontSize: '12px', color: '#64748b' }}>

                        {selectedExpIndex + 1} of {experiencesList.length} packages available

                    </span>

                </div>

            )}

            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

                {!ready ? (

                    <LoadingScreen />

                ) : (

                    <RuntimePlayer

                        key={experiencesList[selectedExpIndex]?.id || selectedExpIndex}

                        runtime={runtime}

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
