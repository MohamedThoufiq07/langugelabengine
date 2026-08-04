/**
 * Backdrop behind the runtime shell: two large, soft blurred color blobs
 * using the active theme's colors. Kept deliberately minimal/abstract —
 * grade 3-8 students read literal meadow/balloon/mascot scenes as
 * babyish, so this favors a clean, modern EdTech look instead.
 */
function SceneBackdrop() {

    return (

        <div className="elab-scene-backdrop" aria-hidden="true">

            <div className="elab-scene-blob elab-scene-blob-a"></div>
            <div className="elab-scene-blob elab-scene-blob-b"></div>

        </div>

    );

}

export default SceneBackdrop;
