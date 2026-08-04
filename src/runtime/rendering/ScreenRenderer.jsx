import { useEffect, useMemo, useRef, useState } from "react";
import LayoutEngine from "./LayoutEngine";
import { ScreenCompletionContext } from "../screen/ScreenCompletionContext";

const GATING_TYPES = new Set([

    "quiz",
    "mcq",
    "true_false",
    "fill_blank",
    "input",
    "match",
    "sequence",
    "drag_drop",
    "word_search",
    "sentence_builder",
    "reading_passage",
    "writing_prompt",
    "dictation",
    "grammar_correction"

]);

function ScreenRenderer({

    screen,
    onComplete

}) {

    const requiredIds = useMemo(() => {

        const elements = screen?.content?.elements || [];

        return elements

            .filter(el => GATING_TYPES.has(el.type))

            .map(el => el.id);

    }, [screen]);

    const [answeredIds, setAnsweredIds] = useState(() => new Set());

    const completedRef = useRef(false);

    useEffect(() => {

        setAnsweredIds(new Set());

        completedRef.current = false;

    }, [screen]);

    useEffect(() => {

        if (!onComplete || completedRef.current) return;

        const allAnswered =

            requiredIds.length === 0 ||

            requiredIds.every(id => answeredIds.has(id));

        if (allAnswered) {

            completedRef.current = true;

            onComplete({});

        }

    }, [answeredIds, requiredIds, onComplete]);

    function reportAnswered(blockId) {

        setAnsweredIds(prev => {

            if (prev.has(blockId)) return prev;

            const next = new Set(prev);

            next.add(blockId);

            return next;

        });

    }

    const remaining = requiredIds.filter(id => !answeredIds.has(id)).length;

    return (

        <ScreenCompletionContext.Provider value={{ reportAnswered }}>

            <div
                style={{
                    padding: "8px"
                }}
            >

                <LayoutEngine
                    screen={screen}
                />

                {requiredIds.length > 0 && remaining > 0 && (

                    <div className="elab-completion-hint">

                        Finish {remaining} more {remaining === 1 ? "activity" : "activities"} on this screen to continue

                    </div>

                )}

            </div>

        </ScreenCompletionContext.Provider>

    );

}

export default ScreenRenderer;
