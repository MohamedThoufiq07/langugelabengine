import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import RecordingService from "../../services/recording/RecordingService";
import { resolveMediaUrl } from "../../services/MediaResolver";

import roleplayBoyGirlImg from "/role play boy and girl.png";
import recordDot from "../../../../assets/images/speaking_record_dot.png";

function RoleplaySimulationBlock({ block }) {
    const {
        title = "Roleplay",
        scenario = "Have a conversation",
        character1Name,
        character2Name,
        character1Role,
        character2Role,
        npcCharacter,
        userRole,
        speakerAName,
        speakerBName,
        npcAvatarUrl,
        userAvatarUrl,
        speakerAAvatarUrl,
        speakerBAvatarUrl,
        conversationTurns,
        conversation = [],
        instructions
    } = block.content;

    const displayTitle = (title === "2-Way Roleplay" || title === "2-Way Role Play" || !title) ? "Roleplay" : title;
    const turns = conversationTurns || conversation;

    // Resolve speaker names and avatars
    const nameA = speakerAName || npcCharacter || character1Name || "Speaker A";
    const nameB = speakerBName || userRole || character2Name || "Speaker B";

    const avatarA = resolveMediaUrl(speakerAAvatarUrl || npcAvatarUrl);
    const avatarB = resolveMediaUrl(speakerBAvatarUrl || userAvatarUrl);

    const [responses, setResponses] = useState({});
    const [attempts, setAttempts] = useState({});
    const [recordingTurnIndex, setRecordingTurnIndex] = useState(null);
    const [activeListenTurnIndex, setActiveListenTurnIndex] = useState(null);
    const [error, setError] = useState("");
    const completion = useScreenCompletion();

    const handleListen = (turn, idx) => {
        const rawAudio = turn.audio || turn.audioUrl || turn.sound || turn.voiceUrl || turn.audio_url || turn.sound_url || turn.speakerAudio || turn.dialogueAudio || turn.audioFile || turn.mediaUrl || turn.media_url || turn.url || turn.clipUrl || turn.referenceAudio;
        const turnAudio = resolveMediaUrl(rawAudio);
        const turnText = turn.prompt || turn.text || turn.dialogue || turn.expectedResponse || turn.expected_response || "";

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        setActiveListenTurnIndex(idx);

        const speakWithTTS = () => {
            if (window.speechSynthesis && turnText) {
                const utterance = new SpeechSynthesisUtterance(turnText);
                utterance.lang = "en-US";
                utterance.rate = 0.95;

                const voices = window.speechSynthesis.getVoices() || [];
                const speakerName = (turn.speaker === "npc" || turn.speaker === "speakerA" ? nameA : nameB).toLowerCase();
                const isFemale = speakerName.includes("maya") || speakerName.includes("girl") || speakerName.includes("woman") || speakerName.includes("she") || turn.gender === "female";

                let bestVoice = null;

                if (isFemale) {
                    bestVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Jenny") || v.name.includes("Google US English") || v.name.includes("Female")));
                    utterance.pitch = 1.15;
                } else {
                    bestVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("David") || v.name.includes("Guy") || v.name.includes("George") || v.name.includes("Male")));
                    utterance.pitch = 0.95;
                }

                if (!bestVoice) {
                    bestVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
                }

                if (bestVoice) {
                    utterance.voice = bestVoice;
                }

                utterance.onend = () => setActiveListenTurnIndex(null);
                utterance.onerror = () => setActiveListenTurnIndex(null);
                window.speechSynthesis.speak(utterance);
            } else {
                setActiveListenTurnIndex(null);
            }
        };

        if (turnAudio) {
            const audioObj = new Audio(turnAudio);
            audioObj.onended = () => setActiveListenTurnIndex(null);
            audioObj.onerror = () => speakWithTTS();
            audioObj.play().catch(() => speakWithTTS());
        } else {
            speakWithTTS();
        }
    };

    async function startRecording(turnIdx) {
        try {
            await RecordingService.startRecording();
            setRecordingTurnIndex(turnIdx);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    // Helper function to validate response matching against expected response strictly
    const checkResponseMatch = (userTranscript, expectedResponse) => {
        if (!expectedResponse || !expectedResponse.trim()) return true; // No expectation = match
        if (!userTranscript || !userTranscript.trim()) return false; // Empty transcript = try again

        const expandContractions = (text) => {
            if (!text) return "";
            return text.toLowerCase()
                .replace(/\b(i)'?m\b/g, "$1 am")
                .replace(/\b(you|we|they)'?re\b/g, "$1 are")
                .replace(/\b(he|she|it|that|what|where|there)'?s\b/g, "$1 is")
                .replace(/\b(can)'?t\b/g, "can not")
                .replace(/\b(won)'?t\b/g, "will not")
                .replace(/\b(don|doesn|didn|isn|aren|wasn|weren|hasn|haven|hadn|wouldn|couldn|shouldn)'?t\b/g, "$1 not")
                .replace(/[^a-z0-9\s]/gi, " ")
                .replace(/\s+/g, " ")
                .trim();
        };

        const cleanUser = expandContractions(userTranscript);
        const cleanExpected = expandContractions(expectedResponse);

        if (!cleanUser || !cleanExpected) return false;

        // Exact match after contraction expansion
        if (cleanUser === cleanExpected) return true;

        const userWords = cleanUser.split(/\s+/).filter(Boolean);
        const expectedWords = cleanExpected.split(/\s+/).filter(Boolean);

        // Homophone dictionary for common Speech-To-Text phonetic mismatches
        const HOMOPHONES = {
            "too": ["to", "two"],
            "to": ["too", "two"],
            "two": ["to", "too"],
            "there": ["their", "theyre"],
            "their": ["there", "theyre"],
            "your": ["youre"],
            "youre": ["your"],
            "for": ["four", "fore"],
            "four": ["for"],
            "be": ["bee"],
            "see": ["sea"],
            "sea": ["see"],
            "by": ["buy", "bye"],
            "buy": ["by", "bye"],
            "hear": ["here"],
            "here": ["hear"],
            "meet": ["meat"],
            "meat": ["meet"],
            "sun": ["son"],
            "son": ["sun"]
        };

        const isWordMatched = (expWord, uWords) => {
            if (uWords.includes(expWord)) return true;
            const equivalents = HOMOPHONES[expWord] || [];
            return equivalents.some(eq => uWords.includes(eq));
        };

        // Every expected word MUST be present (or homophone equivalent) in user transcript
        const allExpectedWordsPresent = expectedWords.every(w => isWordMatched(w, userWords));
        if (!allExpectedWordsPresent) return false;

        // Reject conflicting greeting/time/negation keywords that alter sentence meaning
        const conflictingKeywords = ["night", "evening", "afternoon", "morning", "bye", "goodbye", "hello", "hi", "no", "not"].filter(w => !expectedWords.includes(w));
        if (conflictingKeywords.some(w => userWords.includes(w))) {
            return false;
        }

        return true;
    };

    // Helper to identify if a turn is Speaker A (NPC/Partner) or Speaker B (User/Student)
    const checkIsSpeakerA = (turn, idx) => {
        if (turn.speaker === "npc" || turn.speaker === "speakerA" || turn.speaker === nameA) return true;
        if (turn.speaker === "user" || turn.speaker === "speakerB" || turn.speaker === nameB) return false;
        return idx % 2 === 0;
    };

    // Helper to check if student has completed a given turn index
    const isTurnCompleted = (idx) => {
        const resp = responses[idx];
        if (!resp) return false;
        return !!resp.completed;
    };

    // Determine if a turn at index `idx` is visible
    // A turn is visible if all previous student turns before `idx` have been completed!
    const isTurnVisible = (idx) => {
        for (let k = 0; k < idx; k++) {
            const turnK = turns[k];
            const isStudentK = !checkIsSpeakerA(turnK, k);
            if (isStudentK && !isTurnCompleted(k)) {
                return false;
            }
        }
        return true;
    };

    async function stopRecording(turnIdx) {
        try {
            const result = await RecordingService.stopRecording();
            setRecordingTurnIndex(null);

            const currentTurn = turns[turnIdx];
            const expected = (currentTurn?.expectedResponse || currentTurn?.expected_response || currentTurn?.targetAnswer || currentTurn?.text || currentTurn?.prompt || "").trim();
            const transcript = result.transcript || "";
            const isMatch = checkResponseMatch(transcript, expected);

            const newAttemptCount = (attempts[turnIdx] || 0) + 1;
            setAttempts(prev => ({ ...prev, [turnIdx]: newAttemptCount }));

            if (isMatch) {
                setResponses(prev => {
                    const next = {
                        ...prev,
                        [turnIdx]: {
                            audio: result.url,
                            transcript: transcript || expected || "Recorded Response",
                            completed: true,
                            matched: true,
                            errorMessage: null
                        }
                    };
                    completion?.saveAnswer?.(block.id, next);

                    const studentTurnIndices = turns.map((t, i) => (!checkIsSpeakerA(t, i) ? i : null)).filter(i => i !== null);
                    const finishedCount = studentTurnIndices.filter(i => !!next[i]?.completed).length;

                    if (finishedCount >= studentTurnIndices.length && studentTurnIndices.length > 0) {
                        completion?.reportAnswered(block.id);
                    }
                    return next;
                });
            } else {
                const hintMsg = newAttemptCount >= 3
                    ? `💡 Hint: Try saying "${expected}"`
                    : `⚠️ Try again! Response not matched. (Attempt ${newAttemptCount}/3)`;

                setResponses(prev => ({
                    ...prev,
                    [turnIdx]: {
                        ...prev[turnIdx],
                        audio: result.url,
                        transcript: transcript,
                        completed: false,
                        matched: false,
                        errorMessage: hintMsg
                    }
                }));
            }
        } catch (err) {
            setError(err.message);
            setRecordingTurnIndex(null);
        }
    }

    return (
        <BlockCard type="roleplay_simulation">
            <div className="roleplay-redesign" style={{ width: "100%", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
                <div className="elab-block-interactive-side" style={{ width: "100%", flex: 1 }}>
                    <BlockHeader
                        type="roleplay_simulation"
                        title={displayTitle}
                        subtitle={scenario}
                    />

                    {error && (
                        <div className="elab-feedback error" style={{ marginBottom: "1rem" }}>
                            {error}
                        </div>
                    )}

                    {/* Chat Bubble Stream */}
                    <div className="roleplay-chat-stream" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem", width: "100%" }}>
                        {turns.map((turn, idx) => {
                            if (!isTurnVisible(idx)) return null;

                            const isSpeakerA = checkIsSpeakerA(turn, idx);
                            const currentName = isSpeakerA ? nameA : nameB;
                            const currentAvatar = isSpeakerA ? avatarA : avatarB;
                            const turnText = turn.text || turn.prompt || turn.dialogue || turn.expectedResponse || turn.expected_response || "";
                            const turnAudio = resolveMediaUrl(turn.audio || turn.audioUrl);
                            const userRecording = responses[idx];
                            const completed = isTurnCompleted(idx);
                            const allowRecord = turn.allowAudioRecord !== false && !isSpeakerA && !completed;

                            const showHint = (attempts[idx] || 0) >= 3;
                            const showText = isSpeakerA || completed || showHint;
                            const showListenButton = isSpeakerA || (!completed && showHint);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        flexDirection: isSpeakerA ? "row" : "row-reverse",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        maxWidth: "100%",
                                        width: "100%",
                                        animation: "fadeIn 0.35s ease-in-out"
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                                        {currentAvatar ? (
                                            <img
                                                src={currentAvatar}
                                                alt={currentName}
                                                style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #ffffff", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)" }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "50%",
                                                background: isSpeakerA ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                                color: "#ffffff",
                                                fontWeight: 800,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.1rem"
                                            }}>
                                                {currentName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble Content */}
                                    <div style={{
                                        maxWidth: "65%",
                                        background: isSpeakerA ? "#ffffff" : "#2563eb",
                                        color: isSpeakerA ? "#1e293b" : "#ffffff",
                                        borderRadius: isSpeakerA ? "0 1.25rem 1.25rem 1.25rem" : "1.25rem 0 1.25rem 1.25rem",
                                        padding: "0.85rem 1.15rem",
                                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                                        border: isSpeakerA ? "1px solid #e2e8f0" : "none"
                                    }}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: isSpeakerA ? "#7c3aed" : "#93c5fd", marginBottom: "0.25rem" }}>
                                            {currentName}
                                        </div>

                                        {/* Display prompt / text for Speaker A, completed turn, or after 3 failed attempts (Hint mode) */}
                                        {showText && turnText && (
                                            <div style={{ fontSize: "0.98rem", lineHeight: "1.5", fontWeight: 500 }}>
                                                "{completed ? (userRecording?.transcript || turnText) : turnText}"
                                            </div>
                                        )}

                                        {/* Display error feedback / hint banner if STT transcript did not match */}
                                        {!isSpeakerA && !completed && userRecording?.errorMessage && (
                                            <div style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: showHint ? "#fef08a" : "#fee2e2",
                                                backgroundColor: showHint ? "rgba(161, 98, 7, 0.45)" : "rgba(220, 38, 38, 0.4)",
                                                border: showHint ? "1px solid rgba(253, 224, 71, 0.5)" : "1px solid rgba(252, 165, 165, 0.5)",
                                                padding: "0.45rem 0.75rem",
                                                borderRadius: "0.5rem",
                                                marginTop: "0.35rem",
                                                marginBottom: "0.4rem"
                                            }}>
                                                {userRecording.errorMessage}
                                                {userRecording.transcript && showHint && (
                                                    <div style={{ fontSize: "0.8rem", fontWeight: 600, marginTop: "0.25rem", opacity: 0.9, color: "#ffffff" }}>
                                                        🗣️ You said: "{userRecording.transcript}"
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Styled Listen Button - shown for Speaker A or Speaker B in 3-attempt hint mode */}
                                        {showListenButton && (turnText || turnAudio) && (
                                            <div style={{ marginTop: "0.6rem" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleListen(turn, idx)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        padding: "5px 14px",
                                                        borderRadius: "20px",
                                                        backgroundColor: activeListenTurnIndex === idx ? "#7c3aed" : (isSpeakerA ? "#f3e8ff" : "rgba(255,255,255,0.25)"),
                                                        color: activeListenTurnIndex === idx ? "#ffffff" : (isSpeakerA ? "#7e22ce" : "#ffffff"),
                                                        border: isSpeakerA ? "1.5px solid #d8b4fe" : "1.5px solid rgba(255,255,255,0.4)",
                                                        fontWeight: 700,
                                                        fontSize: "0.85rem",
                                                        cursor: "pointer",
                                                        transition: "all 0.15s ease",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                                                    }}
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                                    </svg>
                                                    {activeListenTurnIndex === idx ? "Listening..." : "Listen"}
                                                </button>
                                            </div>
                                        )}

                                        {/* Interactive Student Choice Buttons */}
                                        {Array.isArray(turn.choices || turn.options || turn.choiceButtons) && (turn.choices || turn.options || turn.choiceButtons).length > 0 && (
                                            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                {(turn.choices || turn.options || turn.choiceButtons).map((choice, choiceIdx) => {
                                                    const choiceText = typeof choice === "string" ? choice : (choice.text || choice.label || choice.option);
                                                    const isSelectedChoice = responses[idx]?.selectedChoice === choiceIdx;

                                                    return (
                                                        <button
                                                            key={choiceIdx}
                                                            type="button"
                                                            onClick={() => {
                                                                setResponses(prev => {
                                                                    const next = {
                                                                        ...prev,
                                                                        [idx]: {
                                                                            ...prev[idx],
                                                                            selectedChoice: choiceIdx,
                                                                            choiceText: choiceText,
                                                                            transcript: choiceText,
                                                                            completed: true
                                                                        }
                                                                    };
                                                                    completion?.saveAnswer?.(block.id, next);

                                                                    const studentTurnIndices = turns.map((t, i) => (!checkIsSpeakerA(t, i) ? i : null)).filter(i => i !== null);
                                                                    const finishedCount = studentTurnIndices.filter(i => !!next[i]?.completed || !!next[i]?.audio || !!next[i]?.transcript || next[i]?.selectedChoice !== undefined).length;

                                                                    if (finishedCount >= studentTurnIndices.length && studentTurnIndices.length > 0) {
                                                                        completion?.reportAnswered(block.id);
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                            style={{
                                                                padding: "0.45rem 0.85rem",
                                                                borderRadius: "0.5rem",
                                                                border: isSelectedChoice ? "2px solid #2563eb" : (isSpeakerA ? "1.5px solid #cbd5e1" : "1.5px solid rgba(255,255,255,0.4)"),
                                                                backgroundColor: isSelectedChoice ? "#dbeafe" : (isSpeakerA ? "#f8fafc" : "rgba(255,255,255,0.1)"),
                                                                color: isSelectedChoice ? "#1e40af" : (isSpeakerA ? "#1e293b" : "#ffffff"),
                                                                fontWeight: isSelectedChoice ? 700 : 500,
                                                                fontSize: "0.88rem",
                                                                textAlign: "left",
                                                                cursor: "pointer",
                                                                transition: "all 0.15s ease"
                                                            }}
                                                        >
                                                            💬 {choiceText}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Recording controls & next turn actions for student response */}
                                        {allowRecord && (
                                            <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: isSpeakerA ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                {recordingTurnIndex !== idx ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => startRecording(idx)}
                                                        className="speaking-custom-btn voice"
                                                        style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
                                                    >
                                                        <img src={recordDot} alt="Start" style={{ borderRadius: "50%", width: "14px", height: "14px" }} />
                                                        {userRecording?.audio ? "Re-record Voice" : "Record Voice"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => stopRecording(idx)}
                                                        className="speaking-custom-btn danger"
                                                        style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
                                                    >
                                                        ⏹ Stop Recording
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div style={{ marginBottom: "28px" }} />
        </BlockCard>
    );
}

export default RoleplaySimulationBlock;
