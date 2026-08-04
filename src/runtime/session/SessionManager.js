import BrowserStorageService from "../rendering/services/BrowserStorageService";
import Logger from "../rendering/services/Logger";

class SessionManager {
   constructor() {

    this.session = null;

    this.storageService =
    new BrowserStorageService();

    this.logger = new Logger();

}

    /**
     * Starts a new runtime session.
     *
     * @param {string} experienceId
     * @returns {Object}
     */
    startSession(experienceId) {
        this.session = {
            sessionId: crypto.randomUUID(),

            experienceId,

            status: "IN_PROGRESS",

            startedAt: new Date().toISOString(),

            completedAt: null,

            currentActivityId: null,

            currentScreenId: null,

            score: 0,

            mastery: 0
        };

        this.saveSession();

this.logger.info(
    `Session Started: ${this.session.sessionId}`
);

        return this.session;
    }

    /**
     * Returns current session.
     */
    getSession() {
        return this.session;
    }
    /**
 * Persist current session.
 */
saveSession() {

    if (!this.session) return;

    this.storageService.save(
        "session",
        this.session
    );

}
    /**
 * Restore previous session.
 */
loadSession() {

    const session =
        this.storageService.load("session");

    if (!session) {

        return null;

    }

    this.session = session;

    this.logger.info(
        "Session Restored"
    );

    return this.session;

}
    /**
     * Updates current activity.
     */
    setCurrentActivity(activityId) {
        if (!this.session) return;

        this.session.currentActivityId = activityId;
        this.saveSession();
    }

    /**
     * Updates current screen.
     */
    setCurrentScreen(screenId) {
        if (!this.session) return;

        this.session.currentScreenId = screenId;
        this.saveSession();
    }

    /**
     * Updates score.
     */
    setScore(score) {
        if (!this.session) return;

        this.session.score = score;
        this.saveSession();
    }

    /**
     * Updates mastery.
     */
    setMastery(mastery) {
        if (!this.session) return;

        this.session.mastery = mastery;
        this.saveSession();
    }

    /**
     * Ends current session.
     */
    endSession() {
        if (!this.session) return;

        this.session.status = "COMPLETED";

        this.session.completedAt = new Date().toISOString();

       this.saveSession();

this.logger.info(
    `Session Completed: ${this.session.sessionId}`
);
    }

    /**
     * Clears session.
     */
    reset() {

    this.session = null;

    this.storageService.remove("session");

}
}

export default SessionManager;