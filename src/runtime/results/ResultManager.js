/**
 * ============================================================
 * EnglishLab Runtime
 * ------------------------------------------------------------
 * ResultManager
 *
 * Responsibilities
 * ----------------
 * • Store screen results
 * • Retrieve results
 * • Export session results
 * ============================================================
 */

class ResultManager {

    constructor() {

        this.results = new Map();

    }

    save(screenId, data) {

        this.results.set(screenId, data);

    }

    get(screenId) {

        return this.results.get(screenId);

    }

    has(screenId) {

        return this.results.has(screenId);

    }

    remove(screenId) {

        this.results.delete(screenId);

    }

    clear() {

        this.results.clear();

    }

    getAll() {

        return Array.from(this.results.values());

    }

    export() {

        return {

            totalScreens: this.results.size,

            results: this.getAll()

        };

    }

}

export default ResultManager;