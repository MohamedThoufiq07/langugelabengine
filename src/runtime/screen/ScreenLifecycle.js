/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * ScreenLifecycle
 *
 * Responsibility
 * --------------
 * Manages the lifecycle of the current screen.
 * ============================================================
 */

class ScreenLifecycle {

    constructor() {

        this.reset();

    }

    reset() {

        this.state = "CREATED";

    }

    load() {

        this.state = "LOADED";

    }

    start() {

        this.state = "STARTED";

    }

    progress() {

        this.state = "IN_PROGRESS";

    }

    complete() {

        this.state = "COMPLETED";

    }

    getState() {

        return this.state;

    }

    isCompleted() {

        return this.state === "COMPLETED";

    }

}

export default ScreenLifecycle;