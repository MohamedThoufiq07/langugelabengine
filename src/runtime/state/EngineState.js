/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * EngineState
 *
 * Single Source of Truth for the Runtime Engine.
 *
 * Responsibilities
 * ----------------
 * ✓ Runtime Lifecycle
 * ✓ Package State
 * ✓ Experience State
 * ✓ Navigation State
 * ✓ Session State
 * ✓ Progress State
 * ✓ UI State
 * ✓ Service State
 * ============================================================
 */

class EngineState {

    constructor() {
        this.reset();
    }

    /**
     * Reset Runtime State
     */
    reset() {

        /* ============================================
         * Runtime
         * ============================================ */
        this.runtime = {
            status: "idle",
            initialized: false,
            started: false,
            paused: false,
            stopped: false,
            version: "1.0.0"
        };

        /* ============================================
         * Package
         * ============================================ */
        this.package = null;

        /* ============================================
         * Experience
         * ============================================ */
        this.experience = null;

        /* ============================================
         * Navigation
         * ============================================ */
        this.navigation = {
            currentActivityIndex: 0,
            currentScreenIndex: 0,
            history: []
        };

        /* ============================================
         * Session
         * ============================================ */
        this.session = {
            id: null,
            startedAt: null,
            completedAt: null,
            elapsedTime: 0,
            status: "not-started"
        };

        /* ============================================
         * Progress
         * ============================================ */
        this.progress = {
            score: 0,
            mastery: 0,
            completedActivities: [],
            completedScreens: []
        };

        /* ============================================
         * UI
         * ============================================ */
        this.ui = {
            loading: false,
            currentRenderer: null,
            fullscreen: false
        };

        /* ============================================
         * Services
         * ============================================ */
        this.services = {
            packageReady: false,
            rendererReady: false,
            navigationReady: false,
            sessionReady: false
        };

    }

    /* ======================================================
     * Runtime
     * ====================================================== */

    initialize() {
        this.runtime.initialized = true;
        this.runtime.status = "initialized";
    }

    start() {
        this.runtime.started = true;
        this.runtime.paused = false;
        this.runtime.stopped = false;
        this.runtime.status = "running";

        this.session.startedAt = Date.now();
        this.session.status = "running";
    }

    pause() {
        this.runtime.paused = true;
        this.runtime.status = "paused";
    }

    resume() {
        this.runtime.paused = false;
        this.runtime.status = "running";
    }

    stop() {
        this.runtime.started = false;
        this.runtime.paused = false;
        this.runtime.stopped = true;
        this.runtime.status = "stopped";

        this.session.completedAt = Date.now();
        this.session.status = "completed";
    }

    /* ======================================================
     * Package
     * ====================================================== */

    setPackage(packageModel) {
        this.package = packageModel;
    }

    getPackage() {
        return this.package;
    }

    /* ======================================================
     * Experience
     * ====================================================== */

    setExperience(experienceModel) {
        this.experience = experienceModel;
    }

    getExperience() {
        return this.experience;
    }

    /* ======================================================
     * Navigation
     * ====================================================== */

    getNavigation() {
        return this.navigation;
    }

    setCurrentActivity(index) {
        this.navigation.currentActivityIndex = index;
    }

    setCurrentScreen(index) {
        this.navigation.currentScreenIndex = index;
    }

    getCurrentActivityIndex() {
        return this.navigation.currentActivityIndex;
    }

    getCurrentScreenIndex() {
        return this.navigation.currentScreenIndex;
    }

    pushHistory(location) {
        this.navigation.history.push(location);
    }

    /* ======================================================
     * Session
     * ====================================================== */

    getSession() {
        return this.session;
    }

    /* ======================================================
     * Progress
     * ====================================================== */

    getProgress() {
        return this.progress;
    }

    updateScore(score) {
        this.progress.score = score;
    }

    updateMastery(mastery) {
        this.progress.mastery = mastery;
    }

    completeActivity(activityId) {
        this.progress.completedActivities.push(activityId);
    }

    completeScreen(screenId) {
        this.progress.completedScreens.push(screenId);
    }

    /* ======================================================
     * UI
     * ====================================================== */

    getUI() {
        return this.ui;
    }

    setRenderer(renderer) {
        this.ui.currentRenderer = renderer;
    }

    setLoading(value) {
        this.ui.loading = value;
    }

    setFullscreen(value) {
        this.ui.fullscreen = value;
    }

    /* ======================================================
     * Services
     * ====================================================== */

    getServices() {
        return this.services;
    }

    setServiceReady(service, value = true) {

        if (this.services.hasOwnProperty(service)) {
            this.services[service] = value;
        }

    }

    /* ======================================================
     * Complete Engine State
     * ====================================================== */

    getState() {

        return {

            runtime: this.runtime,

            package: this.package,

            experience: this.experience,

            navigation: this.navigation,

            session: this.session,

            progress: this.progress,

            ui: this.ui,

            services: this.services

        };

    }

    clear() {
        this.reset();
    }

}

export default EngineState;