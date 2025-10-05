import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const QuestionList = ({ questions, onReorder, onEdit, onDelete }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  const getQuestionPreview = (question) => {
    const englishTranslation = question.translations?.['en-US'];
    return englishTranslation?.questionText || 'No English translation available';
  };

  const getOptionCount = (question) => {
    if (question.questionType === 'Text') return 'Open Ended';
    return `${question.rows?.length || 0} options`;
  };

  const getLogicSummary = (question) => {
    const badges = [];
    
    if (question.skipCountries?.length > 0) {
      badges.push({
        text: `Skip: ${question.skipCountries.join(', ')}`,
        color: '#f59e0b',
        icon: '🌍'
      });
    }
    
    if (question.logic?.conditions?.length > 0) {
      badges.push({
        text: `${question.logic.conditions.length} logic rule${question.logic.conditions.length > 1 ? 's' : ''}`,
        color: '#10b981',
        icon: '🔀'
      });
    }
    
    if (question.shuffleRows) {
      badges.push({
        text: 'Shuffled',
        color: '#3b82f6',
        icon: '🔀'
      });
    }

    // Validation badges
    if (question.questionType === 'Text') {
      const validations = [];
      if (question.minLength) validations.push(`Min: ${question.minLength}`);
      if (question.maxLength) validations.push(`Max: ${question.maxLength}`);
      if (question.minValue) validations.push(`Min val: ${question.minValue}`);
      if (question.maxValue) validations.push(`Max val: ${question.maxValue}`);
      
      if (validations.length > 0) {
        badges.push({
          text: validations.join(', '),
          color: '#8b5cf6',
          icon: '✓'
        });
      }
    }
    
    return badges;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions" type="QUESTION">
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            style={{
              minHeight: '100px',
              background: snapshot.isDraggingOver ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
          >
            {questions.map((question, index) => (
              <Draggable 
                key={`question-${question.questionId}-${index}`} 
                draggableId={`question-${question.questionId}-${index}`} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      background: snapshot.isDragging 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      backdropFilter: 'blur(10px)',
                      transform: snapshot.isDragging 
                        ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                        : provided.draggableProps.style?.transform
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Question Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              cursor: 'grab',
                              padding: '4px',
                              color: '#9ca3af',
                              fontSize: '16px',
                              userSelect: 'none'
                            }}
                          >
                            ⋮⋮
                          </div>
                          
                          <span className="question-id-badge" style={{ 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            fontSize: '13px',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                          }}>
                            {question.questionId}
                          </span>
                          
                          <span style={{ 
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            {question.questionType}
                          </span>
                          
                          <span style={{ 
                            color: '#9ca3af', 
                            fontSize: '11px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>
                            {getOptionCount(question)}
                          </span>
                        </div>
                        
                        {/* Question Text */}
                        <div style={{ 
                          color: 'white', 
                          marginBottom: '12px', 
                          marginLeft: '32px',
                          fontSize: '15px',
                          lineHeight: '1.4',
                          fontWeight: '500'
                        }}>
                          {getQuestionPreview(question)}
                        </div>
                        
                        {/* Logic and Status Badges */}
                        <div style={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginLeft: '32px',
                          marginBottom: '8px'
                        }}>
                          {getLogicSummary(question).map((badge, badgeIndex) => (
                            <span
                              key={badgeIndex}
                              style={{
                                background: badge.color,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <span>{badge.icon}</span>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                        
                        {/* Translation and Option Summary */}
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6b7280',
                          display: 'flex',
                          gap: '16px',
                          marginLeft: '32px'
                        }}>
                          <span>
                            🌐 {Object.keys(question.translations || {}).length} language{Object.keys(question.translations || {}).length !== 1 ? 's' : ''}
                          </span>
                          
                          {question.questionType !== 'Text' && (
                            <span>
                              📝 {question.rows?.filter(row => row.translations?.['en-US']?.rowText?.trim()).length || 0} completed options
                            </span>
                          )}
                          
                          {question.questionType !== 'Text' && question.rows?.some(row => row.isQualify === false) && (
                            <span style={{ color: '#ef4444' }}>
                              ⚠️ Has terminate options
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <button
                          onClick={() => onEdit(index)}
                          style={{
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => onDelete(index)}
                          style={{
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default QuestionList;