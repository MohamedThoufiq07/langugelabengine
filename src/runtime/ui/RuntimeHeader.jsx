import "../header/RuntimeHeader.css";

function RuntimeHeader({ runtime, progress }) {

    const experience = runtime.getExperience();

    const dots = Array.from({ length: progress.totalScreens }, (_, i) => {

        const screenNumber = i + 1;

        if (screenNumber < progress.currentScreen) return "completed";
        if (screenNumber === progress.currentScreen) return "active";
        return "upcoming";

    });

    return (

        <header className="runtime-header">

            <div className="runtime-header-top">

                <div className="runtime-header-left">

                    <div className="runtime-logo">
                        <svg viewBox="0 0 24 24" className="runtime-logo-mark" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 5.5c-1.6-1.2-3.9-1.8-6.2-1.8-.7 0-1.3.6-1.3 1.3v11.4c0 .7.6 1.2 1.3 1.2 2.3 0 4.6.6 6.2 1.9 1.6-1.3 3.9-1.9 6.2-1.9.7 0 1.3-.5 1.3-1.2V5c0-.7-.6-1.3-1.3-1.3-2.3 0-4.6.6-6.2 1.8Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path d="M12 5.5v13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>

                        <h1 className="runtime-title">
                            English<span className="runtime-title-accent">Lab</span>
                        </h1>

                        <p className="runtime-subtitle">
                            {experience?.title || "English Activity"}
                        </p>

                    </div>

                </div>

                <div className="runtime-screen-indicator">

                    <span className="runtime-header-progress-text">
                        Screen {progress.currentScreen} of {progress.totalScreens}
                    </span>

                    <div className="screen-dots">

                        {dots.map((state, i) => (

                            <div key={i} className={`screen-dot ${state}`} />

                        ))}

                    </div>

                </div>

            </div>

        </header>

    );

}

export default RuntimeHeader;
