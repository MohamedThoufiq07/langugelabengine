/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * NavigationEngine
 *
 * Responsibilities
 * ----------------
 * ✓ Initialize Navigation
 * ✓ Current Activity
 * ✓ Current Screen
 * ✓ Next Screen
 * ✓ Previous Screen
 * ✓ Next Activity
 * ============================================================
 */

class NavigationEngine {

    constructor({ engineState }) {

    this.engineState = engineState;

}

    /**
     * Initialize Navigation
     */
    initialize() {

        this.engineState.setCurrentActivity(0);

        this.engineState.setCurrentScreen(0);

       
    }

    /**
     * Current Activity
     */
    getCurrentActivity() {

        const experience =
            this.engineState.getExperience();

        const index =
            this.engineState.getCurrentActivityIndex();

        return experience.getActivity(index);

    }

    /**
     * Current Screen
     */
    getCurrentScreen() {

        const activity =
            this.getCurrentActivity();

        const screenIndex =
            this.engineState.getCurrentScreenIndex();

        return activity.screens[screenIndex];

    }

    /**
     * Next Screen
     */
    nextScreen() {

        const activity =
            this.getCurrentActivity();

        const current =
            this.engineState.getCurrentScreenIndex();

        if (current < activity.screens.length - 1) {

            this.engineState.setCurrentScreen(current + 1);

            return this.getCurrentScreen();

        }

        return this.nextActivity();

    }

    /**
     * Previous Screen
     */
    previousScreen() {

        const current =
            this.engineState.getCurrentScreenIndex();

        if (current > 0) {

            this.engineState.setCurrentScreen(current - 1);

        }

        return this.getCurrentScreen();

    }

    /**
     * Next Activity
     */
    nextActivity() {

        const experience =
            this.engineState.getExperience();

        const activityIndex =
            this.engineState.getCurrentActivityIndex();

        if (activityIndex < experience.totalActivities - 1) {

            this.engineState.setCurrentActivity(activityIndex + 1);

            this.engineState.setCurrentScreen(0);

            return this.getCurrentScreen();

        }

        return null;

    }

}

export default NavigationEngine;