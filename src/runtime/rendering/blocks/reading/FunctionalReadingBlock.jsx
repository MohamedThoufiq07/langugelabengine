import { useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import BlockHeader from "../../../ui/components/BlockHeader";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import badgeUrl from "../../../../assets/images/badge_reading.png";

function FunctionalReadingBlock({ block }) {
    const {
        documentType = "poster", // poster, ticket, notice, flyer, menu, form
        title = "Read the Document",
        documentImage,
        documentUrl,
        instructions = "Read and answer the following questions",
        sections = [],
        questions = []
    } = block.content;
    const resolvedDocumentImage = documentImage || documentUrl;

    const [expandedSection, setExpandedSection] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const completion = useScreenCompletion();

    function handleAnswerChange(questionId, value) {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    }

    function handleSubmit() {
        const allAnswered = questions.every(q => answers[q.id]);
        if (allAnswered) {
            setSubmitted(true);
            completion?.saveAnswer?.(block.id, answers);
            completion?.reportAnswered(block.id);
        }
    }

    const getDocumentTypeLabel = () => {
        const labels = {
            poster: "📰 Poster",
            ticket: "🎫 Ticket",
            notice: "📌 Notice Board",
            flyer: "📄 Flyer",
            menu: "🍽️ Menu",
            form: "📋 Form"
        };
        return labels[documentType] || "Document";
    };

    return (
        <BlockCard type="functional_reading">
            <div className="elab-block-two-column">
                <div className="elab-block-interactive-side">
                    <BlockHeader
                        type="functional_reading"
                        title={title}
                        subtitle={getDocumentTypeLabel()}
                    />

                    {resolvedDocumentImage && (
                        <div className="functional-document-container">
                            <img
                                src={resolvedDocumentImage}
                                alt={title}
                                className="functional-document-image"
                            />
                        </div>
                    )}

                    {sections.length > 0 && (
                        <div className="functional-sections">
                            <h4 className="functional-subtitle">Document Sections</h4>
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="functional-section-item"
                                >
                                    <button
                                        className="functional-section-header"
                                        onClick={() =>
                                            setExpandedSection(
                                                expandedSection === idx ? null : idx
                                            )
                                        }
                                    >
                                        <span className="section-title">
                                            {section.title}
                                        </span>
                                        <span className="section-toggle">
                                            {expandedSection === idx ? "▼" : "▶"}
                                        </span>
                                    </button>
                                    {expandedSection === idx && (
                                        <div className="functional-section-content">
                                            <p>{section.content}</p>
                                            {section.details && (
                                                <ul className="section-details">
                                                    {section.details.map((detail, i) => (
                                                        <li key={i}>{detail}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="elab-block-content-side">
                    <div className="functional-questions-section">
                        <h4 className="functional-questions-title">
                            {instructions}
                        </h4>

                        {questions.map((question, idx) => (
                            <div
                                key={question.id || idx}
                                className="functional-question-item"
                            >
                                <label className="question-label">
                                    <span className="question-number">
                                        {idx + 1}.
                                    </span>
                                    <span className="question-text">
                                        {question.text}
                                    </span>
                                </label>

                                {question.type === "multiple_choice" ? (
                                    <div className="question-options">
                                        {question.options.map((option, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className="option-label"
                                            >
                                                <input
                                                    type="radio"
                                                    name={question.id}
                                                    value={option}
                                                    checked={
                                                        answers[question.id] ===
                                                        option
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={submitted}
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="question-input"
                                        placeholder="Enter your answer"
                                        value={answers[question.id] || ""}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        disabled={submitted}
                                    />
                                )}
                            </div>
                        ))}

                        {!submitted ? (
                            <button
                                onClick={handleSubmit}
                                className="functional-submit-btn"
                                disabled={
                                    !questions.every(q => answers[q.id])
                                }
                            >
                                Submit Answers
                            </button>
                        ) : (
                            <div className="elab-submission-success">
                                <div className="elab-success-icon">✅</div>
                                <p>All answers submitted successfully!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BlockCard>
    );
}

export default FunctionalReadingBlock;
