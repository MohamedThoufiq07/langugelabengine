import RuntimeEvents from "../constants/RuntimeEvents";

class RuntimeBootstrap {

    constructor({
        logger,
        eventBus,
        packageLoader,
        experienceLoader,
        navigationEngine,
        engineState
    }) {

        this.logger = logger;
        this.eventBus = eventBus;
        this.packageLoader = packageLoader;
        this.experienceLoader = experienceLoader;
        this.navigationEngine = navigationEngine;
        this.engineState = engineState;


    }

    async boot(experienceJson) {

        this.logger.info("Initializing Runtime");

        // Load Experience
        const experience =
            this.experienceLoader.load(experienceJson);

        this.engineState.setExperience(experience);

        this.eventBus.emit(
            RuntimeEvents.EXPERIENCE_LOADED,
            experience
        );

        // Initialize Navigation
        this.navigationEngine.initialize();

        this.logger.info("Runtime Ready");

        return experience;

    }

}

export default RuntimeBootstrap;