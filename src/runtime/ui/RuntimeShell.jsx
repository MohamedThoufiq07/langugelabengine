import RuntimeHeader from "./RuntimeHeader";
import NavigationBar from "../player/NavigationBar";
import "../RuntimeShell.css";
import "../backdrop/SceneBackdrop.css";

function RuntimeShell({

    runtime,
    progress,
    canGoNext,
    onPrevious,
    onNext,
    onExit,
    theme,
    gradeBand = "mid",
    children

}) {

    const isLastScreen =
        progress.currentActivity === progress.totalActivities &&
        progress.currentScreen === progress.totalScreens;

    return (

        <div className="runtime-shell" data-grade-band={gradeBand} style={theme}>

            <RuntimeHeader
                runtime={runtime}
                progress={progress}
            />

            <main className="scene-backdrop">

                {children}

            </main>

            <NavigationBar
                canGoBack={progress.currentScreen > 1}
                canGoNext={canGoNext}
                isLastScreen={isLastScreen}
                onPrevious={onPrevious}
                onNext={onNext}
                onExit={onExit}
            />

        </div>

    );

}

export default RuntimeShell;