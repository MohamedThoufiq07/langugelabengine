import { useEffect, useMemo, useState } from "react";

import RuntimeEngine from "./runtime/engine/RuntimeEngine";
import RuntimePlayer from "./runtime/player/RuntimePlayer";
import LoadingScreen from "./runtime/player/LoadingScreen";

import experience from "./runtime/samples/The_Lost_Picnic_v1.0.0.elab/experience.json";

// The sample experience's media URLs point at the live CMS backend
// (localhost:8000), which isn't running in this standalone demo. Every file
// under samples/assets/** ships locally, so swap in the bundled copy by
// filename — this auto-discovers new files (no import/map edit needed to
// add another sample asset, just drop it in the right assets/ subfolder
// and reference that filename from experience.json).
const assetModules = import.meta.glob(
    ["./assets/**/*", "./runtime/samples/**/assets/**/*"],
    { eager: true, query: "?url", import: "default" }
);

const LOCAL_SAMPLE_ASSETS = Object.fromEntries(
    Object.entries(assetModules).map(([path, url]) => [path.split("/").pop(), url])
);

function useLocalSampleAssets(rawExperience) {

    return useMemo(() => {

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

    const runtime = useMemo(

        () => new RuntimeEngine(),

        []

    );

    const resolvedExperience = useLocalSampleAssets(experience);

    const [ready, setReady] = useState(false);

    const [showExitHint, setShowExitHint] = useState(false);

    useEffect(() => {

        async function initializeRuntime() {

            await runtime.start(resolvedExperience);

            setReady(true);

        }

        initializeRuntime();

    }, [runtime, resolvedExperience]);

    function handleExit() {

        // Hosted inside the Electron student app: ask the shell to close
        // this engine window.
        if (window.electronAPI?.closeEngine) {

            window.electronAPI.closeEngine();

            return;

        }

        // Standalone in a plain browser tab: window.close() only works on
        // tabs the page itself opened via script. Browsers silently ignore
        // it otherwise, so detect that and tell the user instead of doing
        // nothing visible.
        window.close();

        setTimeout(() => {

            if (!window.closed) setShowExitHint(true);

        }, 150);

    }

    if (!ready) {

        return <LoadingScreen />;

    }

    return (

        <>

            <RuntimePlayer

                runtime={runtime}

                onExit={handleExit}

            />

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

        </>

    );

}

export default App;
