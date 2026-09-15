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
    const [recordingTurnIndex, setRecordingTurnIndex] = useState(null);
    const [error, setError] = useState("");
    const completion = useScreenCompletion();

    async function startRecording(turnIdx) {
        try {
            await RecordingService.startRecording();
            setRecordingTurnIndex(turnIdx);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function stopRecording(turnIdx) {
        try {
            const result = await RecordingService.stopRecording();
            setRecordingTurnIndex(null);

            setResponses(prev => {
                const next = {
                    ...prev,
                    [turnIdx]: {
                        audio: result.url,
                        transcript: result.transcript || ""
                    }
                };
                completion?.saveAnswer?.(block.id, next);
                completion?.reportAnswered(block.id);
                return next;
            });
        } catch (err) {
            setError(err.message);
            setRecordingTurnIndex(null);
        }
    }

    return (
        <BlockCard type="roleplay_simulation">
            <div className="roleplay-redesign" style={{ width: "100%", marginTop: "1rem", marginBottom: "2rem" }}>
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
                            const isSpeakerA = turn.speaker === "npc" || turn.speaker === "speakerA" || turn.speaker === nameA || idx % 2 === 0;
                            const currentName = isSpeakerA ? nameA : nameB;
                            const currentAvatar = isSpeakerA ? avatarA : avatarB;
                            const turnText = turn.text || turn.prompt || turn.dialogue || "";
                            const turnAudio = resolveMediaUrl(turn.audio || turn.audioUrl);
                            const allowRecord = turn.allowAudioRecord !== false && (turn.speaker === "user" || turn.speaker === "speakerB" || !isSpeakerA || turn.recordingRequired);
                            const userRecording = responses[idx];

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        flexDirection: isSpeakerA ? "row" : "row-reverse",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        maxWidth: "100%",
                                        width: "100%"
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
                                        maxWidth: "60%",
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

                                        {/* Display prompt or student's transcribed/recorded text */}
                                        {userRecording?.transcript ? (
                                            <div style={{ fontSize: "0.98rem", lineHeight: "1.5", fontWeight: 600, background: isSpeakerA ? "#f8fafc" : "rgba(255,255,255,0.15)", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", marginBottom: "0.5rem" }}>
                                                "{userRecording.transcript}"
                                            </div>
                                        ) : (
                                            turnText && (
                                                <div style={{ fontSize: "0.98rem", lineHeight: "1.5", fontWeight: 500 }}>
                                                    "{turnText}"
                                                </div>
                                            )
                                        )}

                                        {/* Audio playback for turn audio */}
                                        {turnAudio && (
                                            <div style={{ marginTop: "0.5rem" }}>
                                                <audio controls controlsList="nodownload noplaybackrate" disablePictureInPicture src={turnAudio} style={{ width: "100%", height: "36px" }} />
                                            </div>
                                        )}

                                        {/* Recording controls for student response */}
                                        {allowRecord && (
                                            <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: isSpeakerA ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.2)" }}>
                                                {recordingTurnIndex !== idx ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => startRecording(idx)}
                                                        className="speaking-custom-btn voice"
                                                        style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
                                                    >
                                                        <img src={recordDot} alt="Start" style={{ borderRadius: "50%", width: "14px", height: "14px" }} />
                                                        {userRecording ? "Re-record Voice" : "Record Voice"}
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
