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
                        <img src="/logo.png" alt="Logo" className="runtime-logo-img" />
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
