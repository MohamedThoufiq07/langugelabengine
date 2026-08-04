import "../navigation/NavigationBar.css";

function NavigationBar({

    canGoBack,
    canGoNext,
    isLastScreen,
    onPrevious,
    onNext,
    onExit

}) {

    return (

        <footer className="navigation-bar">

            <div className="nav-bar-centered">

                <button
                    className="elab-nav-btn elab-nav-btn-prev"
                    disabled={!canGoBack}
                    onClick={onPrevious}
                    aria-label="Previous"
                    title="Previous"
                >
                    ← Previous
                </button>

                <button
                    className="nav-btn exit"
                    onClick={onExit}
                >
                    🏠 Exit
                </button>

                {isLastScreen ? (

                    <button
                        className="elab-nav-btn elab-nav-btn-next elab-nav-btn-finish"
                        disabled={!canGoNext}
                        onClick={onNext}
                        aria-label="Finish"
                        title="Finish"
                    >
                        Finish ✓
                    </button>

                ) : (

                    <button
                        className="elab-nav-btn elab-nav-btn-next"
                        disabled={!canGoNext}
                        onClick={onNext}
                        aria-label="Next"
                        title="Next"
                    >
                        Next →
                    </button>

                )}

            </div>

        </footer>

    );

}

export default NavigationBar;