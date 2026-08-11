import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    "grammar_correction",
    "video"

]);

function ScreenRenderer({

    screen,
    onComplete,
    activityScreens,
    currentScreenIndex

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

    const reportAnswered = useCallback((blockId) => {

        setAnsweredIds(prev => {

            if (prev.has(blockId)) return prev;

            const next = new Set(prev);

            next.add(blockId);

            return next;

        });

    }, []);

    const saveAnswer = useCallback((blockId, answer) => {
        if (!window.__assessmentAnswers) {
            window.__assessmentAnswers = {};
        }
        window.__assessmentAnswers[blockId] = answer;
    }, []);

    const getSavedAnswer = useCallback((blockId) => {
        return window.__assessmentAnswers?.[blockId] !== undefined ? window.__assessmentAnswers[blockId] : null;
    }, []);

    return (

        <ScreenCompletionContext.Provider value={{ reportAnswered, saveAnswer, getSavedAnswer }}>

            <LayoutEngine
                screen={screen}
                activityScreens={activityScreens}
                currentScreenIndex={currentScreenIndex}
            />

        </ScreenCompletionContext.Provider>

    );

}

export default ScreenRenderer;
