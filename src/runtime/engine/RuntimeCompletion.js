import RuntimeEvents from "../constants/RuntimeEvents";

class RuntimeCompletion {

    constructor({
        screenLifecycle,
        progressManager,
        sessionManager,
        logger,
        eventBus
    }) {

        this.screenLifecycle = screenLifecycle;
        this.progressManager = progressManager;
        this.sessionManager = sessionManager;
        this.logger = logger;
        this.eventBus = eventBus;

    }

    complete(
        result,
        checkActivityCompletion,
        checkExperienceCompletion
    ) {

        this.screenLifecycle.complete();

        this.progressManager.record(result);

        if (result.score !== undefined) {
            this.sessionManager.setScore(result.score);
        }

        if (result.mastery !== undefined) {
            this.sessionManager.setMastery(result.mastery);
        }

        checkActivityCompletion();

        if (checkExperienceCompletion()) {
            return;
        }

        this.logger.info("Screen Completed");

        this.eventBus.emit(
            RuntimeEvents.SCREEN_COMPLETED,
            result
        );

    }

}

export default RuntimeCompletion;