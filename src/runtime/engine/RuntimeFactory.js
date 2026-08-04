/**
 * ============================================================
 * EnglishLab Runtime
 * ------------------------------------------------------------
 * RuntimeFactory
 *
 * Responsibilities
 * ----------------
 * • Create all runtime dependencies
 * • Wire shared services
 * • Return fully configured runtime components
 * ============================================================
 */

import EngineState from "../state/EngineState";

import ExperienceLoader from "../loaders/ExperienceLoader";

import NavigationEngine from "../navigation/NavigationEngine";
import RuntimeNavigator from "../navigation/RuntimeNavigator";

import ScreenLifecycle from "../screen/ScreenLifecycle";

import ProgressManager from "../progress/ProgressManager";

import PackageLoader from "../package/PackageLoader";
import AssetResolver from "../package/AssetResolver";

import SessionManager from "../session/SessionManager";

import EventBus from "../rendering/services/EventBus";
import Logger from "../rendering/services/Logger";

import RuntimeBootstrap from "../engine/RuntimeBootstrap";
import RuntimeCompletion from "../engine/RuntimeCompletion";

import ResultManager from "../results/ResultManager";

class RuntimeFactory {

    static create() {

        /*
        ======================================================
        Core Services
        ======================================================
        */

        const logger = new Logger();

        const eventBus = new EventBus();

        /*
        ======================================================
        Package
        ======================================================
        */

        const packageLoader = new PackageLoader();

        const assetResolver = new AssetResolver();

        /*
        ======================================================
        Experience
        ======================================================
        */

        const experienceLoader = new ExperienceLoader();

        /*
        ======================================================
        Runtime State
        ======================================================
        */

        const engineState = new EngineState();

        const sessionManager = new SessionManager();

        const progressManager = new ProgressManager(
    engineState
);
        const resultManager = new ResultManager();

        /*
        ======================================================
        Screen
        ======================================================
        */

        const screenLifecycle = new ScreenLifecycle();

        /*
        ======================================================
        Navigation
        ======================================================
        */

        const navigationEngine = new NavigationEngine({

            engineState

        });

        const runtimeNavigator = new RuntimeNavigator({

    navigationEngine,

    screenLifecycle,

    sessionManager,

    eventBus,

    logger

});

        /*
        ======================================================
        Runtime Completion
        ======================================================
        */

        const runtimeCompletion = new RuntimeCompletion({

    screenLifecycle,

    progressManager,

    sessionManager,

    logger,

    eventBus

});

        /*
        ======================================================
        Runtime Bootstrap
        ======================================================
        */

        const runtimeBootstrap = new RuntimeBootstrap({

    logger,

    eventBus,

    packageLoader,

    experienceLoader,

    navigationEngine,

    engineState

});

        /*
        ======================================================
        Export
        ======================================================
        */

        return {

            logger,

            eventBus,

            packageLoader,

            assetResolver,

            experienceLoader,

            engineState,

            sessionManager,

            progressManager,

            resultManager,

            screenLifecycle,

            navigationEngine,

            runtimeNavigator,

            runtimeCompletion,

            runtimeBootstrap

        };

    }

}

export default RuntimeFactory;