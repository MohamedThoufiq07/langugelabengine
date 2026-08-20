import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";
import RecordingService from "../../services/recording/RecordingService";

import badgeUrl from "../../../../assets/images/speaking_masks_badge.png";
import illustrationUrl from "../../../../assets/images/speaking_puppet_show.png";

function RoleplaySimulationBlock({ block }) {
    const {
        title = "2-Way Roleplay",
        scenario = "Have a conversation",
        character1Name = "Person A",
        character2Name = "Person B",
        character1Role = "Speaker",
        character2Role = "You",
        conversationTurns,
        conversation = [],
        instructions = "Listen and respond as indicated"
    } = block.content;
    const turns = conversationTurns || conversation;

    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [recording, setRecording] = useState(false);
    const [responses, setResponses] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);

    const completion = useScreenCompletion();

    async function startRecording() {
        try {
            await RecordingService.startRecording();
            setRecording(true);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function stopRecording() {
        try {
            const result = await RecordingService.stopRecording();
            setRecording(false);

            const newResponse = {
                turnIndex: currentTurnIndex,
                audio: result.url,
                transcript: result.transcript || "",
                timestamp: new Date().toISOString()
            };

            setResponses([...responses, newResponse]);
            setConversationHistory([
                ...conversationHistory,
                {
                    speaker: character2Name,
                    role: character2Role,
                    audio: result.url,
                    transcript: result.transcript || ""
                }
            ]);

            // Move to next turn
            if (currentTurnIndex < turns.length - 1) {
                setCurrentTurnIndex(currentTurnIndex + 1);
            } else {
                setCompleted(true);
                completion?.reportAnswered(block.id);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    function handleSkipTurn() {
        if (currentTurnIndex < turns.length - 1) {
            setCurrentTurnIndex(currentTurnIndex + 1);
        } else {
            setCompleted(true);
            completion?.reportAnswered(block.id);
        }
    }

    function handleRestart() {
        setCurrentTurnIndex(0);
        setResponses([]);
        setConversationHistory([]);
        setError("");
        setCompleted(false);
    }

    const currentTurn = turns[currentTurnIndex];
    const progress = Math.round(
        ((currentTurnIndex + 1) / Math.max(turns.length, 1)) * 100
    );

    return (
        <BlockCard type="roleplay_simulation">
            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="roleplay_simulation"
                        title={title}
                        subtitle={scenario}
                    />

                    <div className="roleplay-progress">
                        <span className="progress-text">
                            Turn {currentTurnIndex + 1} of {turns.length}
                        </span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="roleplay-characters">
                        <div className="character-badge">
                            <div className="character-name">
                                {character1Name}
                            </div>
                            <div className="character-role">
                                {character1Role}
                            </div>
                        </div>
                        <div className="roleplay-divider">↔️</div>
                        <div className="character-badge your-role">
                            <div className="character-name">
                                {character2Name}
                            </div>
                            <div className="character-role">
                                {character2Role}
                            </div>
                        </div>
                    </div>

                    {!completed ? (
                        <div className="roleplay-turn-section">
                            <div className="turn-label">
                                Turn {currentTurnIndex + 1} -{" "}
                                {currentTurn?.speaker}
                            </div>

                            {currentTurn && (
                                <>
                                    {currentTurn.audio ? (
                                        <div className="elab-media-frame">
                                            <audio
                                                src={currentTurn.audio}
                                                controls
                                                className="elab-media-player"
                                            />
                                        </div>
                                    ) : (
                                        <div className="roleplay-text-display">
                                            "{currentTurn.text}"
                                        </div>
                                    )}

                                    {(currentTurn.expectedResponse || currentTurn.expectedStudentResponses?.[0]?.text) && (
                                        <div className="roleplay-instructions">
                                            <strong>📝 Your task:</strong>
                                            <p>{currentTurn.expectedResponse || currentTurn.expectedStudentResponses[0].text}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="recording-section">
                                {!recording ? (
                                    <button
                                        onClick={startRecording}
                                        className="elab-recording-btn"
                                    >
                                        🎤 Record Your Response
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="elab-recording-btn is-recording"
                                    >
                                        ⏹️ Stop Recording
                                    </button>
                                )}

                                <button
                                    onClick={handleSkipTurn}
                                    className="elab-skip-btn"
                                >
                                    Skip This Turn
                                </button>
                            </div>

                            {error && (
                                <div className="elab-error-message">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="roleplay-completion">
                            <div className="completion-header">
                                ✅ Roleplay Completed!
                            </div>
                            <div className="completion-stats">
                                <div className="stat-item">
                                    <span className="stat-label">
                                        Total Turns:
                                    </span>
                                    <span className="stat-value">
                                        {turns.length}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">
                                        Your Responses:
                                    </span>
                                    <span className="stat-value">
                                        {responses.length}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleRestart}
                                className="elab-btn elab-btn-secondary"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                <div className="elab-block-content-side">
                    <div className="conversation-history">
                        <h4>Conversation History</h4>

                        {conversationHistory.length === 0 ? (
                            <div className="history-empty">
                                Conversation will appear here
                            </div>
                        ) : (
                            <div className="history-list">
                                {turns.map((turn, idx) => (
                                    <div
                                        key={idx}
                                        className="history-turn"
                                    >
                                        <div className="turn-speaker">
                                            <strong>{turn.speaker}</strong>
                                        </div>
                                        <div className="turn-text">
                                            {turn.text || "Audio response"}
                                        </div>

                                        {responses.some(r => r.turnIndex === idx) && (
                                            <div className="your-response">
                                                <strong>
                                                    {character2Name}
                                                    (You)
                                                </strong>
                                                <div className="response-audio">
                                                    <audio
                                                        src={
                                                            responses.find(
                                                                r =>
                                                                    r.turnIndex ===
                                                                    idx
                                                            )?.audio
                                                        }
                                                        controls
                                                        className="elab-media-player"
                                                    />
                                                </div>
                                                {responses.find(
                                                    r => r.turnIndex === idx
                                                )?.transcript && (
                                                    <div className="response-transcript">
                                                        {
                                                            responses.find(
                                                                r =>
                                                                    r.turnIndex ===
                                                                    idx
                                                            )?.transcript
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default RoleplaySimulationBlock;
