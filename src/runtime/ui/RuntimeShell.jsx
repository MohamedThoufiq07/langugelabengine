import RuntimeHeader from "./RuntimeHeader";
import ContentCard from "./ContentCard";
import SceneBackdrop from "./SceneBackdrop";
import NavigationBar from "../player/NavigationBar";

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

            <SceneBackdrop />

            <RuntimeHeader
                runtime={runtime}
                progress={progress}
            />

            <ContentCard>

                {children}

            </ContentCard>

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