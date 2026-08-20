import React from "react";

function SceneBackdrop({ runtime }) {
    const experience = runtime?.getExperience();
    const currentActivityIndex = runtime?.engineState?.getCurrentActivityIndex();
    const currentActivity = experience?.activities?.[currentActivityIndex];
    const isAssessment = experience?.experienceType === 'ASSESSMENT' || experience?.experience_type === 'ASSESSMENT' || currentActivity?.activityType === 'ASSESSMENT' || currentActivity?.activity_type === 'ASSESSMENT';

    const bgStyle = isAssessment ? {
        backgroundImage: "url('/Assesment bg.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
    } : {};

    return (
        <div 
            className="elab-scene-backdrop" 
            aria-hidden="true"
            style={bgStyle}
        />
    );
}

export default SceneBackdrop;
