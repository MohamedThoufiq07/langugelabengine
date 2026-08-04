function NavigationBar({

    canGoBack,
    canGoNext,
    isLastScreen,
    onPrevious,
    onNext,
    onExit

}) {

    return (

        <>

            <button
                className="elab-nav-fab elab-nav-fab-prev"
                disabled={!canGoBack}
                onClick={onPrevious}
                aria-label="Previous"
                title="Previous"
            >
                ←
            </button>

            {isLastScreen ? (

                <button
                    className="elab-nav-fab elab-nav-fab-next elab-nav-fab-finish"
                    disabled={!canGoNext}
                    onClick={onNext}
                    aria-label="Finish"
                    title="Finish"
                >
                    ✓
                </button>

            ) : (

                <button
                    className="elab-nav-fab elab-nav-fab-next"
                    disabled={!canGoNext}
                    onClick={onNext}
                    aria-label="Next"
                    title="Next"
                >
                    →
                </button>

            )}

            <footer className="navigation-bar">

                <button
                    className="nav-btn exit"
                    onClick={onExit}
                >
                    🏠 Exit
                </button>

            </footer>

        </>

    );

}

export default NavigationBar;