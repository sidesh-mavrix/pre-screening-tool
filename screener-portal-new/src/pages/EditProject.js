import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../utils/languages';
import QuestionBuilder from '../components/QuestionBuilder';
import QuestionList from '../components/QuestionList';
import TemplateSidebar from '../components/TemplateSidebar';
import MultiSelect from '../components/MultiSelect';
import CompactCountryLanguageManager from '../components/CompactCountryLanguageManager';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' }
];

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [errors, setErrors] = useState({});

  // Auto-scroll when question builder opens
  useEffect(() => {
    if (showQuestionBuilder) {
      setTimeout(() => {
        const questionBuilder = document.querySelector('.question-builder');
        if (questionBuilder) {
          questionBuilder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [showQuestionBuilder]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Ensure proper data structure and convert to new format
        const projectData = {
          ...res.data,
          countryLanguages: res.data.countryLanguages || {},
          questions: res.data.questions || []
        };
        
        // Convert old format to new if needed
        if (!res.data.countryLanguages && res.data.countries && res.data.languages) {
          const mapping = {};
          res.data.countries.forEach(country => {
            mapping[country] = res.data.languages || ['en-US'];
          });
          projectData.countryLanguages = mapping;
        }
        
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        alert('❌ Failed to load project');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token, navigate]);

  const validateProject = () => {
    const newErrors = {};
    
    if (!project.projectCode?.trim()) {
      newErrors.projectCode = 'Project code is required';
    }
    
    if (!project.countryLanguages || Object.keys(project.countryLanguages).length === 0) {
      newErrors.countryLanguages = 'At least one country with languages is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProjectChange = (field, value) => {
    setProject(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveQuestion = (questionData) => {
    if (editingQuestion !== null) {
      setProject(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => i === editingQuestion ? questionData : q)
      }));
    } else {
      setProject(prev => ({
        ...prev,
        questions: [...(prev.questions || []), questionData]
      }));
    }
    
    setShowQuestionBuilder(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestion(index);
    setShowQuestionBuilder(true);
  };

  const handleDeleteQuestion = (index) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setProject(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleReorderQuestions = (reorderedQuestions) => {
    setProject(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  };

  const handleTemplateSelect = (templateQuestion) => {
    const nextQuestionId = `S${(project.questions?.length || 0) + 1}`;
    const questionWithId = {
      ...templateQuestion,
      questionId: nextQuestionId
    };
    
    setProject(prev => ({
      ...prev,
      questions: [...(prev.questions || []), questionWithId]
    }));
    
    if (errors.questions) {
      setErrors(prev => ({ ...prev, questions: '' }));
    }
  };

  const handleSave = async () => {
    // Check if there are unsaved question changes
    if (showQuestionBuilder) {
      alert('⚠️ Please save or cancel the current question before updating the project.');
      return;
    }
    
    if (!validateProject()) {
      alert('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      await axios.patch(`${config.API_BASE_URL}/projects/${id}`, project, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Project updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error updating project:', err);
      alert('❌ Failed to update project: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading Project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>❌</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Project Not Found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <TemplateSidebar 
        onSelectTemplate={handleTemplateSelect}
        onRemoveTemplate={(templateId) => {
          // Remove questions created from this template
          setProject(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.templateId !== templateId)
          }));
        }}
        projectLanguages={project.languages || []}
      />
      
      <div style={{ flex: 1, padding: '24px' }}>
        <div className="fade-in">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'white', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              ✏️ Edit Project: {project.projectCode}
            </h1>
            <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>
              Modify project settings, questions, and translations
            </p>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
                Please fix the following errors:
              </div>
              {Object.values(errors).map((error, index) => (
                <div key={index} style={{ color: '#ef4444', fontSize: '14px' }}>
                  • {error}
                </div>
              ))}
            </div>
          )}
          
          {/* Project Details */}
          <div className="card project-config-card" style={{
            padding: '16px',
            marginBottom: '16px'
          }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  ⚙️ Project Configuration
                </h3>
              </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                  Project Code
                </label>
                <input
                  type="text"
                  value={project.projectCode}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#9ca3af', fontSize: '12px' }}>Project code cannot be changed</small>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                  Min Duration (seconds)
                </label>
                <input
                  type="number"
                  value={project.minDurationSec || 0}
                  onChange={(e) => handleProjectChange('minDurationSec', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                Project Description
              </label>
              <textarea
                value={project.projectDescription || ''}
                onChange={(e) => handleProjectChange('projectDescription', e.target.value)}
                placeholder="Describe your survey project..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid #533483',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                  Terminate Link
                </label>
                <input
                  type="url"
                  value={project.terminateLink || ''}
                  onChange={(e) => handleProjectChange('terminateLink', e.target.value)}
                  placeholder="https://example.com/terminate"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                  Qualify Link
                </label>
                <input
                  type="url"
                  value={project.qualifyLink || ''}
                  onChange={(e) => handleProjectChange('qualifyLink', e.target.value)}
                  placeholder="https://example.com/qualify"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <input
                  type="checkbox"
                  checked={project.isEnabled}
                  onChange={(e) => handleProjectChange('isEnabled', e.target.checked)}
                />
                <span style={{ fontWeight: '600' }}>✅ Project Enabled</span>
              </label>
            </div>
          </div>

          {/* Countries & Languages */}
          <div className="card target-audience-card" style={{
            padding: '16px',
            marginBottom: '16px'
          }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  🌍 Target Audience
                </h3>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Countries & Languages * ({Object.keys(project.countryLanguages || {}).length} countries)
                </label>
                <CompactCountryLanguageManager
                  countryLanguages={project.countryLanguages || {}}
                  onChange={(mapping) => handleProjectChange('countryLanguages', mapping)}
                />
                {errors.countryLanguages && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.countryLanguages}</div>}
              </div>
          </div>

          {/* Questions */}
          <div className="card questions-card" style={{
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                ❓ Survey Questions ({project.questions?.length || 0})
              </h3>
              <button 
onClick={() => setShowQuestionBuilder(true)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ➕ Add Question
              </button>
            </div>
            
            {project.questions && project.questions.length > 0 ? (
              <QuestionList
                questions={project.questions}
                onReorder={handleReorderQuestions}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                color: '#9ca3af',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '2px dashed #533483'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
                <h3 style={{ marginBottom: '8px', color: '#d1d5db' }}>No questions yet</h3>
                <p style={{ marginBottom: '20px', fontSize: '14px' }}>
                  Add questions manually or select from templates on the left
                </p>
                <button 
onClick={() => setShowQuestionBuilder(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Create First Question
                </button>
              </div>
            )}
          </div>

          {/* Question Builder */}
          {showQuestionBuilder && (
            <QuestionBuilder
              question={editingQuestion !== null ? project.questions[editingQuestion] : null}
              onSave={handleSaveQuestion}
              onCancel={() => {
                setShowQuestionBuilder(false);
                setEditingQuestion(null);
              }}
              projectLanguages={Object.values(project.countryLanguages || {}).flat().filter((lang, index, arr) => arr.indexOf(lang) === index)}
              projectCountries={Object.keys(project.countryLanguages || {})}
              questionIndex={project.questions?.length || 0}
            />
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
            <button 
              onClick={() => navigate(`/preview/${project.projectCode}`)}
              style={{
                padding: '12px 24px',
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              👁️ Preview
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              style={{
                padding: '16px 32px',
                background: saving ? '#374151' : 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? '⏳ Saving Changes...' : '💾 Save Changes'}
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ❌ Cancel
            </button>
          </div>
          
          {/* Simple Scroll Buttons */}
          <div style={{
            position: 'fixed',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            zIndex: 100
          }}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                width: '30px',
                height: '30px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ↑
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              style={{
                width: '30px',
                height: '30px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProject;