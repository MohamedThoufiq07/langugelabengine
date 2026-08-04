import RuntimeEvents from "../constants/RuntimeEvents";

class RuntimeNavigator {

    constructor({
        navigationEngine,
        screenLifecycle,
        sessionManager,
        logger,
        eventBus
    }) {

        this.navigationEngine = navigationEngine;
        this.screenLifecycle = screenLifecycle;
        this.sessionManager = sessionManager;
        this.logger = logger;
        this.eventBus = eventBus;

    }

    activateCurrentScreen() {

        this.screenLifecycle.reset();

        this.screenLifecycle.load();

        this.screenLifecycle.start();

        const screen =
            this.navigationEngine.getCurrentScreen();

        this.sessionManager.setCurrentScreen(
            screen.id
        );

        this.logger.info(
            `Current Screen: ${screen.title}`
        );

        return screen;

    }

   nextScreen() {

    if (!this.screenLifecycle.isCompleted()) {

        this.logger.warn(
            "Current screen not completed."
        );

        return {
            success: false,
            completed: false
        };

    }

    const screen =
        this.navigationEngine.nextScreen();

    if (!screen) {

        this.logger.info(
            "Experience Completed."
        );

        return {
            success: false,
            completed: true
        };

    }

    this.showCurrentScreen();

    return {
        success: true,
        completed: false,
        screen
    };

}
   showCurrentScreen() {

    const screen =
        this.activateCurrentScreen();

    this.eventBus.emit(
        RuntimeEvents.SCREEN_CHANGED,
        screen
    );

    return screen;

}

    previousScreen() {

    const screen =
        this.navigationEngine.previousScreen();

    if (!screen) {

        return false;

    }

    this.showCurrentScreen();

    return true;

}

}

export default RuntimeNavigator;