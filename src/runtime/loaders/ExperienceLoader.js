/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * ExperienceLoader
 *
 * Responsibility
 * --------------
 * Convert raw experience JSON into a Runtime ExperienceModel.
 *
 * It DOES NOT:
 * - Fetch files
 * - Read from disk
 * - Navigate
 * - Render
 * ============================================================
 */

import ExperienceModel from "../models/ExperienceModel";

class ExperienceLoader {

    /**
     * Build Runtime ExperienceModel
     */
    load(data) {

        this.validate(data);

        const experience = new ExperienceModel();

        experience.id = data.id ?? null;

        experience.title = data.title ?? "";

        experience.description = data.description ?? "";

        experience.version = data.version ?? "1.0.0";

        experience.grade = data.grade ?? "";

        experience.setActivities(
            data.activities ?? []
        );

        return experience;

    }

    /**
     * Validate Experience JSON
     */
    validate(data) {

        if (!data) {

            throw new Error(
                "Experience data is missing."
            );

        }
        if (data.schemaVersion !== "1.0.0") {

    throw new Error(
        "Unsupported Experience Schema"
    );

}

        if (!Array.isArray(data.activities)) {

            throw new Error(
                "Experience must contain activities."
            );

        }

    }

}

export default ExperienceLoader;