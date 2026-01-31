// src/components/ui/QuestionCard.jsx
import React, { useState } from 'react';
import { FaTrash, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa';

const QuestionCard = ({ 
    question, 
    index, 
    onUpdate, 
    onDelete 
}) => {
    const [localQuestion, setLocalQuestion] = useState(question);

    const handleQuestionTextChange = (e) => {
        const updated = { ...localQuestion, questionText: e.target.value };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handlePointsChange = (e) => {
        const updated = { ...localQuestion, points: parseFloat(e.target.value) };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handleOptionChange = (optionId, text) => {
        const updatedOptions = localQuestion.options.map(opt =>
            opt.id === optionId ? { ...opt, text } : opt
        );
        const updated = { ...localQuestion, options: updatedOptions };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handleCorrectOptionChange = (optionId) => {
        const updatedOptions = localQuestion.options.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId
        }));
        const updated = { ...localQuestion, options: updatedOptions };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const addOption = () => {
        const newOptionId = localQuestion.options.length + 1;
        const newOption = {
            id: newOptionId,
            text: '',
            isCorrect: false
        };
        const updatedOptions = [...localQuestion.options, newOption];
        const updated = { ...localQuestion, options: updatedOptions };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const removeOption = (optionId) => {
        if (localQuestion.options.length > 2) {
            const updatedOptions = localQuestion.options.filter(opt => opt.id !== optionId);
            const updated = { ...localQuestion, options: updatedOptions };
            setLocalQuestion(updated);
            onUpdate(updated);
        }
    };

    const handleTrueFalseChange = (value) => {
        const updated = { ...localQuestion, correctAnswer: value === 'true' };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handleShortAnswerChange = (e) => {
        const updated = { ...localQuestion, correctAnswer: e.target.value };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const getTypeBadge = () => {
        switch(localQuestion.type) {
            case 'multiple-choice':
                return { text: 'اختيار متعدد', className: 'type-multiple-choice' };
            case 'true-false':
                return { text: 'صح/خطأ', className: 'type-true-false' };
            case 'short-answer':
                return { text: 'إجابة قصيرة', className: 'type-short-answer' };
            default:
                return { text: 'غير محدد', className: '' };
        }
    };

    const typeBadge = getTypeBadge();

    return (
        <div className="question-card">
            <div className="question-header d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="mb-0">
                        سؤال {index + 1}
                        <span className={`question-type-badge ${typeBadge.className} me-2`}>
                            {typeBadge.text}
                        </span>
                    </h6>
                </div>
                <div className="question-actions">
                    <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(localQuestion.id)}
                        title="حذف السؤال"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
            
            <div className="question-body">
                <div className="mb-3">
                    <label className="form-label fw-semibold">نص السؤال</label>
                    <textarea 
                        className="form-control" 
                        rows="2"
                        value={localQuestion.questionText}
                        onChange={handleQuestionTextChange}
                        placeholder="أدخل نص السؤال..."
                        required
                    />
                </div>

                {localQuestion.type === 'multiple-choice' && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
                            <span>الخيارات</span>
                            <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary"
                                onClick={addOption}
                            >
                                <FaPlus className="me-1" />
                                إضافة خيار
                            </button>
                        </label>
                        <div className="options-container">
                            {localQuestion.options.map((option) => (
                                <div 
                                    key={option.id} 
                                    className={`option-item ${option.isCorrect ? 'correct' : ''}`}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="form-check me-2">
                                            <input 
                                                className="form-check-input option-checkbox" 
                                                type="radio" 
                                                name={`correct-${localQuestion.id}`}
                                                checked={option.isCorrect}
                                                onChange={() => handleCorrectOptionChange(option.id)}
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                            placeholder={`الخيار ${option.id}`}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-outline-danger me-2"
                                            onClick={() => removeOption(option.id)}
                                            disabled={localQuestion.options.length <= 2}
                                        >
                                            <FaMinus />
                                        </button>
                                        {option.isCorrect && (
                                            <FaCheckCircle className="text-success" title="الإجابة الصحيحة" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {localQuestion.type === 'true-false' && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold">الإجابة الصحيحة</label>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name={`true-false-${localQuestion.id}`}
                                    value="true"
                                    checked={localQuestion.correctAnswer === true}
                                    onChange={(e) => handleTrueFalseChange(e.target.value)}
                                />
                                <label className="form-check-label">صح</label>
                            </div>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name={`true-false-${localQuestion.id}`}
                                    value="false"
                                    checked={localQuestion.correctAnswer === false}
                                    onChange={(e) => handleTrueFalseChange(e.target.value)}
                                />
                                <label className="form-check-label">خطأ</label>
                            </div>
                        </div>
                    </div>
                )}

                {localQuestion.type === 'short-answer' && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold">الإجابة الصحيحة</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={localQuestion.correctAnswer || ''}
                            onChange={handleShortAnswerChange}
                            placeholder="أدخل الإجابة الصحيحة..."
                            required
                        />
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <label className="form-label mb-0 me-2">الدرجة:</label>
                        <input 
                            type="number" 
                            className="form-control points-input" 
                            min="0" 
                            step="0.5"
                            value={localQuestion.points}
                            onChange={handlePointsChange}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;