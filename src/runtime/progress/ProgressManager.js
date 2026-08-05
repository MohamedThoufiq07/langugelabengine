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

    // Calculate total screens and current global screen across all activities
    let totalScreens = 0;
    let cumulativeScreenIndex = 0;

    for (let i = 0; i < experience.totalActivities; i++) {
        const act = experience.getActivity(i);
        if (act && act.screens) {
            totalScreens += act.screens.length;
            if (i < activityIndex) {
                cumulativeScreenIndex += act.screens.length;
            }
        }
    }

    const currentScreen = cumulativeScreenIndex + screenIndex + 1;

    return {

        currentActivity: activityIndex + 1,

        totalActivities: experience.totalActivities,

        currentScreen: currentScreen,

        totalScreens: totalScreens,

        percentage: Math.round(
            (currentScreen / totalScreens) * 100
        ),

        score: progress.score,

        mastery: progress.mastery

    };

}

}

export default ProgressManager;