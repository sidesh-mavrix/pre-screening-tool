import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const PreviewPage = () => {
  const { projectCode } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en-US');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/projects/code/${projectCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
        
        // Set default language to first available
        if (res.data.languages && res.data.languages.length > 0) {
          setSelectedLang(res.data.languages[0]);
        }
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectCode, token]);

  const getTranslation = (translations, lang, fallback = '[Translation Missing]') => {
    if (!translations) return fallback;
    
    if (translations[lang]) {
      return translations[lang].questionText || translations[lang].rowText || translations[lang].instructionText || fallback;
    }
    
    const baseLang = lang.split('-')[0];
    const baseMatch = Object.keys(translations).find(key => key.startsWith(baseLang));
    if (baseMatch && translations[baseMatch]) {
      return translations[baseMatch].questionText || translations[baseMatch].rowText || translations[baseMatch].instructionText || fallback;
    }
    
    const firstKey = Object.keys(translations)[0];
    if (firstKey && translations[firstKey]) {
      return translations[firstKey].questionText || translations[firstKey].rowText || translations[firstKey].instructionText || fallback;
    }
    
    return fallback;
  };

  if (loading) {
    return <div>Loading preview...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="survey-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #1e3a8a',
          
        }}>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '28px', marginBottom: '5px' }}>
              Preview: {project.projectCode}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {project.projectDescription}
            </p>
          </div>
          
          {project.languages && project.languages.length > 1 && (
            <div>
              <label style={{ marginRight: '10px', fontWeight: '500' }}>Language:</label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="form-select"
                style={{ width: 'auto', minWidth: '120px' }}
              >
                {project.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ 
          
          border: '1px solid #f59e0b', 
          borderRadius: '6px', 
          padding: '15px', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <strong>🔍 Preview Mode</strong> - This is how the survey will appear to respondents
        </div>

        {project.questions?.map((question, index) => {
          return (
            <div key={question.questionId} className="survey-question">
            <div className="question-title">
              {index + 1}. {getTranslation(question.translations, selectedLang)}
            </div>
            
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
              QID: {question.questionId} | Type: {question.questionType}
              {question.shuffleRows && ' | Shuffled'}
            </div>

            {/* Single Select */}
            {question.questionType === 'SingleSelect' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.rows?.map((option) => (
                  <div key={option.rowCode} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <input type="radio" name={question.questionId} disabled style={{ marginRight: '12px' }} />
                    <span style={{ flex: 1 }}>
                      {getTranslation(option.translations, selectedLang)}
                      {option.isQualify ? (
                        <span style={{ color: '#059669', marginLeft: '8px', fontSize: '12px' }}>
                          ✓ Qualify
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '12px' }}>
                          ✗ Reject
                        </span>
                      )}
                      {option.hasOtherField && (
                        <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '12px' }}>
                          📝 Other
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Multi Select */}
            {question.questionType === 'MultiSelect' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.rows?.map((option) => (
                  <div key={option.rowCode} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <input type="checkbox" disabled style={{ marginRight: '12px' }} />
                    <span style={{ flex: 1 }}>
                      {getTranslation(option.translations, selectedLang)}
                      {option.isQualify ? (
                        <span style={{ color: '#059669', marginLeft: '8px', fontSize: '12px' }}>
                          ✓ Qualify
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '12px' }}>
                          ✗ Reject
                        </span>
                      )}
                      {option.hasOtherField && (
                        <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '12px' }}>
                          📝 Other
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Single Select Grid */}
            {question.questionType === 'SingleSelectGrid' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}></th>
                      {(question.columns || []).map((column) => (
                        <th key={column.columnCode} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                          {getTranslation(column.translations, selectedLang)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(question.rows || []).map((row) => (
                      <tr key={row.rowCode} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '500', fontSize: '14px' }}>
                          {getTranslation(row.translations, selectedLang)}
                        </td>
                        {(question.columns || []).map((column) => (
                          <td key={column.columnCode} style={{ padding: '12px', textAlign: 'center' }}>
                            <input type="radio" name={`${question.questionId}_${row.rowCode}`} disabled style={{ width: '18px', height: '18px' }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Multi Select Grid */}
            {question.questionType === 'MultiSelectGrid' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}></th>
                      {(question.columns || []).map((column) => (
                        <th key={column.columnCode} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                          {getTranslation(column.translations, selectedLang)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(question.rows || []).map((row) => (
                      <tr key={row.rowCode} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '500', fontSize: '14px' }}>
                          {getTranslation(row.translations, selectedLang)}
                        </td>
                        {(question.columns || []).map((column) => (
                          <td key={column.columnCode} style={{ padding: '12px', textAlign: 'center' }}>
                            <input type="checkbox" disabled style={{ width: '18px', height: '18px' }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Text Input */}
            {question.questionType === 'Text' && (
              <textarea
                className="form-input form-textarea"
                placeholder="Respondent will type their answer here..."
                disabled
                style={{ 
                  
                  color: '#6b7280',
                  minHeight: '80px'
                }}
              />
            )}

            {/* Question Metadata */}
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              
              borderRadius: '4px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <div><strong>Available Translations:</strong> {Object.keys(question.translations || {}).join(', ') || 'None'}</div>
              {question.minLength && <div><strong>Min Length:</strong> {question.minLength}</div>}
              {question.maxLength && <div><strong>Max Length:</strong> {question.maxLength}</div>}
              {question.minValue && <div><strong>Min Value:</strong> {question.minValue}</div>}
              {question.maxValue && <div><strong>Max Value:</strong> {question.maxValue}</div>}
              {question.textType && <div><strong>Text Type:</strong> {question.textType}</div>}
              {question.logicType && <div><strong>Logic Type:</strong> {question.logicType}</div>}
              
              {/* Advanced Logic Conditions */}
              {question.logic?.conditions && question.logic.conditions.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Advanced Logic:</strong>
                  {question.logic.conditions.map((condition, idx) => {
                    let conditionText = '';
                    
                    if (condition.type === 'grid') {
                      conditionText = `If Row ${condition.gridRow} ${condition.condition.replace('row_', '').replace('_', ' ')} Column ${condition.gridColumn} → ${condition.action}`;
                    } else if (condition.type === 'option') {
                      conditionText = `If option ${condition.value} is ${condition.condition} → ${condition.action}`;
                    } else if (condition.type === 'value') {
                      conditionText = `If value ${condition.condition} ${condition.value} → ${condition.action}`;
                    }
                    
                    if (condition.action === 'skip' && condition.target) {
                      conditionText += ` to ${condition.target}`;
                    }
                    
                    return (
                      <div key={idx} style={{ 
                        marginLeft: '10px', 
                        padding: '4px 8px', 
                        background: '#f1f5f9', 
                        borderRadius: '3px', 
                        marginTop: '4px',
                        fontSize: '11px',
                        color: '#475569'
                      }}>
                        {conditionText}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
        })}

        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          padding: '20px',
          
          borderRadius: '8px'
        }}>
          <button
            disabled
            className="btn btn-primary"
            style={{ 
              padding: '15px 40px', 
              fontSize: '16px',
              opacity: 0.6,
              display:'none'
            }}
          >
            Submit Survey (Preview Mode)
          </button>
          <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>
            In live mode, this will redirect to qualify/terminate links
          </p>
        </div>

        
        
      </div>
    </div>
  );
};

export default PreviewPage;