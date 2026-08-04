/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * ProgressManager
 *
 * Responsibilities
 * ----------------
 * ✓ Record screen completion
 * ✓ Record activity completion
 * ✓ Record score
 * ✓ Record mastery
 * ✓ Store results in EngineState
 * ============================================================
 */

class ProgressManager {

    constructor(engineState) {

        this.engineState = engineState;

    }

    /**
     * Save Renderer Result
     */
    record(result = {}) {

        const progress =
            this.engineState.getProgress();

        // Save latest result
        progress.lastResult = result;

        // Score

        if (typeof result.score === "number") {

            progress.score += result.score;

        }

        // Completed Screen

        const screenIndex =
            this.engineState.getCurrentScreenIndex();

        if (
            !progress.completedScreens.includes(
                screenIndex
            )
        ) {

            progress.completedScreens.push(
                screenIndex
            );

        }

    }

    /**
     * Complete Activity
     */
    completeActivity(activityIndex) {

        const progress =
            this.engineState.getProgress();

        if (
            !progress.completedActivities.includes(
                activityIndex
            )
        ) {

            progress.completedActivities.push(
                activityIndex
            );

        }

    }

    /**
     * Current Progress
     */
    /**
 * Current Progress
 */
getProgress() {

    const experience =
        this.engineState.getExperience();

    const activityIndex =
        this.engineState.getCurrentActivityIndex();

    const screenIndex =
        this.engineState.getCurrentScreenIndex();

    const progress =
        this.engineState.getProgress();

    const activity =
        experience.getActivity(activityIndex);
console.log({
    experience,
    activityIndex,
    screenIndex,
    activity,
    progress
});

    return {

        currentActivity: activityIndex + 1,

        totalActivities: experience.totalActivities,

        currentScreen: screenIndex + 1,

        totalScreens: activity.screens.length,

        percentage: Math.round(
            ((screenIndex + 1) / activity.screens.length) * 100
        ),

        score: progress.score,

        mastery: progress.mastery

    };

}

}

export default ProgressManager;