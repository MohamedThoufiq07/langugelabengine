import EngineState from "../state/EngineState";
import ExperienceLoader from "../loaders/ExperienceLoader";
import NavigationEngine from "../navigation/NavigationEngine";
import ScreenLifecycle from "../screen/ScreenLifecycle";
import ProgressManager from "../progress/ProgressManager";
import PackageLoader from "../package/PackageLoader";
import AssetResolver from "../package/AssetResolver";
import EventBus from "../rendering/services/EventBus";
import Logger from "../rendering/services/Logger";
import RuntimeEvents from "../constants/RuntimeEvents";
import SessionManager from "../session/SessionManager";
import RuntimeFactory from "./RuntimeFactory";

class RuntimeEngine {

   constructor() {

    Object.assign(
        this,
        RuntimeFactory.create()
    );

}


     
    async start(experienceJson) {

    this.logger.info("EnglishLab Runtime Engine Started");

    await this.runtimeBootstrap.boot(
    experienceJson
);

    this.engineState.start();

    const experience =
        this.engineState.getExperience();

    this.sessionManager.startSession(
        experience.id
    );

    this.runtimeNavigator.showCurrentScreen();

    this.eventBus.emit(
        RuntimeEvents.SESSION_STARTED
    );

    this.logger.info("Runtime Running");

}
    /**
 * Check Activity Completion
 */
checkActivityCompletion() {

    const experience =
        this.engineState.getExperience();

    const activityIndex =
        this.engineState.getCurrentActivityIndex();

    const screenIndex =
        this.engineState.getCurrentScreenIndex();

    const activity =
        experience.getActivity(activityIndex);

    const isLastScreen =
        screenIndex === activity.screens.length - 1;

    if (!isLastScreen) {

        return;

    }

    this.progressManager.completeActivity(
        activityIndex
    );
    this.sessionManager.setCurrentActivity(
    activity.id
);

   this.logger.info(
    `Activity ${activityIndex + 1} Completed`
);

this.eventBus.emit(
    RuntimeEvents.ACTIVITY_COMPLETED,
    activity
);

  }
    /**
 * ======================================================
 * Check Experience Completion
 * ======================================================
 */
completeCurrentScreen(result = {}) {

    this.saveResult(result);

    this.runtimeCompletion.complete(

        result,

        () => this.checkActivityCompletion(),

        () => this.checkExperienceCompletion()

    );
    
}
checkExperienceCompletion() {

    const experience =
        this.engineState.getExperience();

    const activityIndex =
        this.engineState.getCurrentActivityIndex();

    const screenIndex =
        this.engineState.getCurrentScreenIndex();

    const activity =
        experience.getActivity(activityIndex);

    const isLastActivity =
        activityIndex === experience.totalActivities - 1;

    const isLastScreen =
        screenIndex === activity.screens.length - 1;

    if (!isLastActivity || !isLastScreen) {

        return false;

    }

   this.logger.info("Experience Completed");

this.eventBus.emit(
    RuntimeEvents.EXPERIENCE_COMPLETED
);
    this.stop();

    return true;

    }

    /* ======================================================
     * Navigation
     * ====================================================== */

    nextScreen() {

    const result =
        this.runtimeNavigator.nextScreen();

    if (result.completed) {

        this.stop();

    }

    return result;

}


   previousScreen() {

    return this.runtimeNavigator.previousScreen();

}

    getCurrentScreen() {

        return this.navigationEngine.getCurrentScreen();

    }

    getScreenState() {

        return this.screenLifecycle.getState();

    }

    canNavigateNext() {

        return this.screenLifecycle.isCompleted();
        console.log(
    "Navigator state:",
    this.screenLifecycle.getState()
);

    }
    /* ======================================================
 * Runtime Queries
 * ====================================================== */

isCompleted() {

    return this.engineState.isCompleted();

}

isRunning() {

    return this.engineState.isRunning();

}

getExperience() {

    return this.engineState.getExperience();

}

getCurrentActivity() {

    const experience =
        this.getExperience();

    return experience.getActivity(

        this.engineState.getCurrentActivityIndex()

    );

}
getCurrentModules() {

    return this.getCurrentActivity().skills || [];

}

getResults() {

    return this.resultManager.export();

}

getCurrentScreenIndex() {

    return this.engineState.getCurrentScreenIndex();

}

getCurrentActivityIndex() {

    return this.engineState.getCurrentActivityIndex();

}
saveResult(result) {

    const screen =
        this.getCurrentScreen();

    this.resultManager.save(

        screen.id,

        {

            screenId: screen.id,

            activityId: this.getCurrentActivity().id,

            type: screen.type,

            completedAt:

                new Date().toISOString(),

            result

        }

    );

}

    /* ======================================================
     * Runtime Lifecycle
     * ====================================================== */

    pause() {

        this.engineState.pause();

        this.logger.info("Runtime Paused");

this.eventBus.emit(
    RuntimeEvents.SESSION_PAUSED
);

    }

    resume() {

        this.engineState.resume();

        this.logger.info("Runtime Resumed");

this.eventBus.emit(
    RuntimeEvents.SESSION_RESUMED
);

    }

    stop() {

        this.engineState.stop();
        this.sessionManager.endSession();

        this.logger.info("Runtime Stopped");

this.eventBus.emit(
    RuntimeEvents.SESSION_ENDED
);

    }

    shutdown() {

        this.engineState.clear();
        this.sessionManager.reset();
        this.eventBus.clear();
        this.logger.info("Runtime Shutdown");

    }

    /* ======================================================
     * State
     * ====================================================== */

    getState() {

        return this.engineState.getState();

    }

    getProgress() {

        return this.progressManager.getProgress();

    }
    getSession() {

    return this.sessionManager.getSession();

}

}

export default RuntimeEngine;