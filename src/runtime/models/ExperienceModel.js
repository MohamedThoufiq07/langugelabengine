/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * ExperienceModel
 *
 * Runtime representation of an Experience.
 * ============================================================
 */

class ExperienceModel {

    constructor() {

        this.id = null;

        this.title = "";

        this.description = "";

        this.version = "";

        this.grade = "";

        this.experienceType = "";

        this.activities = [];

        this.totalActivities = 0;

    }

    setActivities(activities = []) {

        this.activities = activities;

        this.totalActivities = activities.length;

    }

    getActivity(index) {

        return this.activities[index];

    }

    hasActivities() {

        return this.totalActivities > 0;

    }

    getModules() {

        const modules = new Set();

        this.activities.forEach(activity => {

            (activity.skills || []).forEach(skill => modules.add(skill));

        });

        return [...modules];

    }

    getActivitiesByModule(moduleId) {

        return this.activities

            .map((activity, index) => ({ index, activity }))

            .filter(({ activity }) => (activity.skills || []).includes(moduleId));

    }

}

export default ExperienceModel;