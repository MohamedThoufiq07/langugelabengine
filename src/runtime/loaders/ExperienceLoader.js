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

        experience.experienceType = data.experienceType ?? data.experience_type ?? data.lessonType ?? data.lesson_type ?? "lesson";

        const getTopValue = (el) => {
            if (el.order !== undefined && el.order !== null) return Number(el.order);
            if (el.sequence !== undefined && el.sequence !== null) return Number(el.sequence);
            if (el.position !== undefined && el.position !== null) return Number(el.position);
            if (el.styles && el.styles.top !== undefined) {
                const parsed = parseFloat(String(el.styles.top).replace("px", ""));
                if (!isNaN(parsed)) return parsed;
            }
            return 0;
        };

        const rawActivities = data.activities ?? [];
        const sortedActivities = rawActivities.slice().sort((a, b) => {
            const seqA = a.sequence ?? a.order ?? a.position ?? 0;
            const seqB = b.sequence ?? b.order ?? b.position ?? 0;
            return seqA - seqB;
        }).map(activity => {
            const rawScreens = activity.screens ?? [];
            const sortedScreens = rawScreens.slice().sort((a, b) => {
                const seqA = a.sequence ?? a.order ?? a.screen_order ?? a.position ?? 0;
                const seqB = b.sequence ?? b.order ?? b.screen_order ?? b.position ?? 0;
                return seqA - seqB;
            }).map(screen => {
                if (!screen.content?.elements) return screen;
                const sortedElements = screen.content.elements.slice().sort((a, b) => {
                    return getTopValue(a) - getTopValue(b);
                });
                return {
                    ...screen,
                    content: {
                        ...screen.content,
                        elements: sortedElements
                    }
                };
            });
            return {
                ...activity,
                screens: sortedScreens
            };
        });

        experience.setActivities(sortedActivities);

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