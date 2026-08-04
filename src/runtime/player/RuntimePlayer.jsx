/**
 * ============================================================
 * EnglishLab Runtime
 * ------------------------------------------------------------
 * RuntimePlayer
 *
 * Responsibilities
 * ----------------
 * • Display current screen
 * • Handle navigation
 * • Show progress
 * • Show completion
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import RendererRegistry from "../rendering/RendererRegistry";
import { pickThemeForScreen, parseGradeBand } from "../theme/presets";

import RuntimeShell from "../ui/RuntimeShell";

import LoadingScreen from "./LoadingScreen";

function RuntimePlayer({

    runtime,

    onExit

}) {

    const registry = useMemo(

        () => new RendererRegistry(),

        []

    );

    const [loading, setLoading] = useState(true);

    const [, setRefreshKey] = useState(0);

    const [screen, setScreen] = useState(null);

    useEffect(() => {

        setScreen(

            runtime.getCurrentScreen()

        );

        setLoading(false);

    }, [runtime]);

    const refreshScreen = useCallback(() => {

        setScreen(

            runtime.getCurrentScreen()

        );

    }, [runtime]);

    const handleComplete = useCallback((result = {}) => {

        runtime.completeCurrentScreen(result);

        setRefreshKey(prev => prev + 1);

        refreshScreen();

    }, [runtime, refreshScreen]);

    const handleNext = useCallback(() => {

        const result = runtime.nextScreen();

        if (result?.completed) {

            // Experience finished — exit straight out instead of showing
            // a separate completion screen.
            onExit?.();

            return;

        }

        refreshScreen();

    }, [runtime, refreshScreen, onExit]);

    const handlePrevious = useCallback(() => {

        runtime.previousScreen();

        refreshScreen();

    }, [runtime, refreshScreen]);

    if (loading) {

        return <LoadingScreen />;

    }

    if (!screen) {

        return <LoadingScreen />;

    }

    const progress = runtime.getProgress();

    const Renderer = registry.getRenderer("screen");

    const theme = pickThemeForScreen(screen, progress.currentScreen).vars;

    const gradeBand = parseGradeBand(runtime.getExperience()?.grade);

    return (

        <RuntimeShell

            runtime={runtime}

            progress={progress}

            canGoNext={runtime.canNavigateNext()}

            onPrevious={handlePrevious}

            onNext={handleNext}

            onExit={onExit}

            theme={theme}

            gradeBand={gradeBand}

        >

            <Renderer

                screen={screen}

                onComplete={handleComplete}

            />

        </RuntimeShell>

    );

}

export default RuntimePlayer;