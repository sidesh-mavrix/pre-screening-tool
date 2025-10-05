import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '../utils/languages';
import { translateText } from '../utils/translator';

const QuestionBuilder = ({ 
  question, 
  onSave, 
  onCancel, 
  projectLanguages = [], 
  projectCountries = [],
  questionIndex = 0 
}) => {
  const [formData, setFormData] = useState({
    questionId: `S${questionIndex + 1}`,
    questionType: 'SingleSelect',
    textType: 'text',
    translations: { 'en-US': { questionText: '', instructionText: '' } },
    rows: [],
    columns: [],
    shuffleColumns: false,
    skipCountries: [],
    minLength: '',
    maxLength: '',
    minValue: '',
    maxValue: '',
    shuffleRows: false,
    logicType: 'qualifying',
    logic: { conditions: [] }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [translating, setTranslating] = useState(false);
  const [englishText, setEnglishText] = useState('');
  const [englishInstruction, setEnglishInstruction] = useState('');
  const [errors, setErrors] = useState({});

  // Auto-scroll to question builder when it opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.querySelector('.question-builder');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (question) {
      // Editing existing question
      setFormData({ ...question });
      if (question.translations?.['en-US']) {
        setEnglishText(question.translations['en-US'].questionText || '');
        setEnglishInstruction(question.translations['en-US'].instructionText || '');
      }
    } else {
      // Creating new question - initialize with project languages
      const initialTranslations = {};
      projectLanguages.forEach(lang => {
        initialTranslations[lang] = { questionText: '', instructionText: '' };
      });
      if (Object.keys(initialTranslations).length === 0) {
        initialTranslations['en-US'] = { questionText: '', instructionText: '' };
      }
      setFormData(prev => ({ ...prev, translations: initialTranslations }));
    }
  }, [question, projectLanguages]);

  // Separate effect to handle English text changes when editing
  useEffect(() => {
    if (question && question.translations?.['en-US']) {
      const englishTranslation = question.translations['en-US'];
      setEnglishText(englishTranslation.questionText || '');
      setEnglishInstruction(englishTranslation.instructionText || '');
    }
  }, [question]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.questionId.trim()) {
      newErrors.questionId = 'Question ID is required';
    }
    
    if (!englishText.trim()) {
      newErrors.englishText = 'English question text is required';
    }
    
    if (formData.questionType !== 'Text' && formData.rows.length === 0) {
      newErrors.options = 'At least one option is required for select questions';
    }
    
    if ((formData.questionType === 'SingleSelectGrid' || formData.questionType === 'MultiSelectGrid') && formData.columns.length === 0) {
      newErrors.columns = 'At least one column is required for grid questions';
    }
    
    if (formData.questionType === 'Text') {
      if (formData.minLength && formData.maxLength && parseInt(formData.minLength) > parseInt(formData.maxLength)) {
        newErrors.length = 'Min length cannot be greater than max length';
      }
      if (formData.minValue && formData.maxValue && parseFloat(formData.minValue) > parseFloat(formData.maxValue)) {
        newErrors.value = 'Min value cannot be greater than max value';
      }
    }

    // Validate options have English text
    if (formData.questionType !== 'Text') {
      formData.rows.forEach((row, index) => {
        if (!row.translations?.['en-US']?.rowText?.trim()) {
          newErrors[`option_${index}`] = `Option ${index + 1} needs English text`;
        }
      });
    }
    
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // When logicType changes for MultiSelect, update all existing options
      if (field === 'logicType' && prev.questionType === 'MultiSelect' && prev.rows.length > 0) {
        const updatedRows = prev.rows.map(row => ({
          ...row,
          isQualify: value === 'qualifying' // Reset all to qualify=true for qualifying, false for rejecting
        }));
        newData.rows = updatedRows;
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEnglishTextChange = (text, type = 'question') => {
    if (type === 'question') {
      setEnglishText(text);
    } else {
      setEnglishInstruction(text);
    }

    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        'en-US': {
          ...prev.translations['en-US'],
          [type === 'question' ? 'questionText' : 'instructionText']: text
        }
      }
    }));

    if (errors.englishText) {
      setErrors(prev => ({ ...prev, englishText: '' }));
    }
  };

  const autoTranslateFromEnglish = async () => {
    const currentEnglishText = englishText.trim();
    const currentEnglishInstruction = englishInstruction.trim();
    
    if (!currentEnglishText) {
      setErrors(prev => ({ ...prev, englishText: 'Please enter English question text first' }));
      return;
    }

    setTranslating(true);
    
    try {
      const translations = { 
        'en-US': { 
          questionText: currentEnglishText, 
          instructionText: currentEnglishInstruction 
        } 
      };
      
      console.log('Translating from English:', currentEnglishText);
      
      for (const lang of projectLanguages) {
        if (lang !== 'en-US') {
          console.log(`Translating to ${lang}...`);
          const translatedQuestion = await translateText(currentEnglishText, lang, 'en-US');
          const translatedInstruction = currentEnglishInstruction ? await translateText(currentEnglishInstruction, lang, 'en-US') : '';
          
          translations[lang] = {
            questionText: translatedQuestion,
            instructionText: translatedInstruction
          };
          
          console.log(`${lang} translation:`, translatedQuestion);
        }
      }
      
      setFormData(prev => ({ ...prev, translations }));
      alert('✅ Auto-translation completed!');
    } catch (error) {
      console.error('Auto-translation failed:', error);
      alert('❌ Auto-translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const addOption = () => {
    const newOption = {
      rowCode: (formData.rows.length + 1).toString(),
      translations: { 'en-US': { rowText: '' } },
      isQualify: true, // Always default to true, user can uncheck for rejecting
      hasOtherField: false,
      isNotShuffle: false,
      isExclusive: false
    };
    
    setFormData(prev => ({
      ...prev,
      rows: [...prev.rows, newOption]
    }));
  };

  const updateOptionText = (index, text) => {
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) => 
        i === index 
          ? {
              ...row,
              translations: {
                ...row.translations,
                'en-US': { rowText: text }
              }
            }
          : row
      )
    }));

    if (errors[`option_${index}`]) {
      setErrors(prev => ({ ...prev, [`option_${index}`]: '' }));
    }
  };

  const updateOptionProperty = (index, property, value) => {
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) => 
        i === index ? { ...row, [property]: value } : row
      )
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index).map((row, i) => ({
        ...row,
        rowCode: (i + 1).toString()
      }))
    }));
  };

  const translateAllOptions = async () => {
    if (formData.rows.some(row => !row.translations?.['en-US']?.rowText?.trim())) {
      alert('Please add English text to all options first');
      return;
    }

    setTranslating(true);
    
    try {
      const updatedRows = [];
      
      for (const row of formData.rows) {
        const englishText = row.translations['en-US'].rowText;
        const translations = { 'en-US': { rowText: englishText } };
        
        for (const lang of projectLanguages) {
          if (lang !== 'en-US') {
            const translatedText = await translateText(englishText, lang, 'en-US');
            translations[lang] = { rowText: translatedText };
          }
        }
        
        updatedRows.push({ ...row, translations });
      }
      
      setFormData(prev => ({ ...prev, rows: updatedRows }));
      alert('✅ All options translated!');
    } catch (error) {
      console.error('Option translation failed:', error);
      alert('❌ Option translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const addLogicCondition = () => {
    setFormData(prev => ({
      ...prev,
      logic: {
        ...prev.logic,
        conditions: [...prev.logic.conditions, {
          type: 'value',
          condition: '',
          value: '',
          action: 'skip',
          target: ''
        }]
      }
    }));
  };

  const updateLogicCondition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      logic: {
        ...prev.logic,
        conditions: prev.logic.conditions.map((cond, i) => 
          i === index ? { ...cond, [field]: value } : cond
        )
      }
    }));
  };

  const removeLogicCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      logic: {
        ...prev.logic,
        conditions: prev.logic.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="question-builder" style={{
      background: 'rgba(26, 26, 46, 0.9)',
      border: '1px solid #533483',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      backdropFilter: 'blur(20px)',
      color: 'white'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #533483'
      }}>
        <h3 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: 'white',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {translating ? '🔄 Translating...' : '✨ Question Builder'}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleSave} 
            disabled={translating}
            className="btn btn-primary"
            style={{ 
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Save Question
          </button>
          <button 
            onClick={onCancel}
            style={{ 
              padding: '8px 16px',
              background: '#374151', 
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cancel
          </button>
          
        </div>
      </div>
      

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
            Please fix the following errors:
          </div>
          {Object.values(errors).map((error, index) => (
            <div key={index} style={{ color: '#ef4444', fontSize: '12px' }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '20px',
        borderBottom: '1px solid #533483'
      }}>
        {['basic', 'question text', 'options', 'logic'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab 
                ? 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)' 
                : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                Question ID *
              </label>
              <input
                type="text"
                value={formData.questionId}
                onChange={(e) => handleInputChange('questionId', e.target.value)}
                placeholder="S1, S2, S3..."
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${errors.questionId ? '#ef4444' : '#533483'}`,
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              {errors.questionId && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.questionId}</div>}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                Question Type *
              </label>
              <select
                value={formData.questionType}
                onChange={(e) => handleInputChange('questionType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid #533483',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="SingleSelect">Single Select</option>
                <option value="MultiSelect">Multi Select</option>
                <option value="SingleSelectGrid">Single Select Grid</option>
                <option value="MultiSelectGrid">Multi Select Grid</option>
                <option value="Text">Open Ended</option>
              </select>
            </div>
          </div>

          {/* Multi-Select Logic Type */}
          {formData.questionType === 'MultiSelect' && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                Logic Application *
              </label>
              <select
                value={formData.logicType}
                onChange={(e) => handleInputChange('logicType', e.target.value)}
                style={{
                  width: '200px',
                  padding: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid #533483',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="qualifying">Qualifying Options</option>
                <option value="rejecting">Rejecting Options</option>
              </select>
              <small style={{ color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                {formData.logicType === 'qualifying' 
                  ? 'Logic applies when qualifying options are selected'
                  : 'Logic applies when rejecting options are selected (terminates if selected with qualifying options)'
                }
              </small>
            </div>
          )}

          {/* Shuffle Options for Select Questions */}
          {(formData.questionType === 'SingleSelect' || formData.questionType === 'MultiSelect') && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <input
                  type="checkbox"
                  checked={formData.shuffleRows}
                  onChange={(e) => handleInputChange('shuffleRows', e.target.checked)}
                />
                <span style={{ fontWeight: '600' }}>🔀 Shuffle Options</span>
              </label>
              <small style={{ color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                Options will be displayed in random order for each respondent
              </small>
            </div>
          )}

          {/* Shuffle Options for Grid Questions */}
          {(formData.questionType === 'SingleSelectGrid' || formData.questionType === 'MultiSelectGrid') && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <input
                    type="checkbox"
                    checked={formData.shuffleRows}
                    onChange={(e) => handleInputChange('shuffleRows', e.target.checked)}
                  />
                  <span style={{ fontWeight: '600' }}>🔀 Shuffle Rows</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <input
                    type="checkbox"
                    checked={formData.shuffleColumns}
                    onChange={(e) => handleInputChange('shuffleColumns', e.target.checked)}
                  />
                  <span style={{ fontWeight: '600' }}>🔀 Shuffle Columns</span>
                </label>
              </div>
              <small style={{ color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                Rows and columns will be displayed in random order for each respondent
              </small>
            </div>
          )}

          {/* Text Question Configuration */}
          {formData.questionType === 'Text' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                  Text Type *
                </label>
                <select
                  value={formData.textType}
                  onChange={(e) => handleInputChange('textType', e.target.value)}
                  style={{
                    width: '200px',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="text">Text</option>
                  <option value="numeric">Numeric</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {formData.textType === 'text' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                        Min Characters
                      </label>
                      <input
                        type="number"
                        value={formData.minLength}
                        onChange={(e) => handleInputChange('minLength', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${errors.length ? '#ef4444' : '#533483'}`,
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                        Max Characters
                      </label>
                      <input
                        type="number"
                        value={formData.maxLength}
                        onChange={(e) => handleInputChange('maxLength', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${errors.length ? '#ef4444' : '#533483'}`,
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                        Min Value
                      </label>
                      <input
                        type="number"
                        value={formData.minValue}
                        onChange={(e) => handleInputChange('minValue', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${errors.value ? '#ef4444' : '#533483'}`,
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                        Max Value
                      </label>
                      <input
                        type="number"
                        value={formData.maxValue}
                        onChange={(e) => handleInputChange('maxValue', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${errors.value ? '#ef4444' : '#533483'}`,
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </>
                )}
                {(errors.length || errors.value) && (
                  <div style={{ gridColumn: '1 / -1', color: '#ef4444', fontSize: '11px' }}>
                    {errors.length || errors.value}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Text Tab */}
      {activeTab === 'question text' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontWeight: '600', color: 'white' }}>
                Question Text *
              </label>
              {projectLanguages && projectLanguages.length > 0 && englishText.trim() && (
                <button
                  onClick={autoTranslateFromEnglish}
                  disabled={translating}
                  style={{
                    padding: '8px 16px',
                    background: translating ? '#374151' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: translating ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {translating ? '🔄 Translating...' : '🌐 Translate'}
                </button>
              )}
            </div>
            
            <textarea
              value={englishText}
              onChange={(e) => handleEnglishTextChange(e.target.value, 'question')}
              placeholder="Enter your question..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${errors.englishText ? '#ef4444' : '#533483'}`,
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            {errors.englishText && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.englishText}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
              Instruction Text (Optional)
            </label>
            <textarea
              value={englishInstruction}
              onChange={(e) => handleEnglishTextChange(e.target.value, 'instruction')}
              placeholder="Enter instruction text..."
              style={{
                width: '100%',
                minHeight: '60px',
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
          
          {/* Translated Text Display */}
          {Object.keys(formData.translations).length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid #533483',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                🌐 Translated Text
              </h4>
              {Object.entries(formData.translations).map(([lang, trans]) => (
                <div key={lang} style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid #374151'
                }}>
                  <div style={{ color: '#e0aaff', fontWeight: '500', marginBottom: '8px', fontSize: '12px' }}>
                    {lang}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#d1d5db' }}>
                      Question Text
                    </label>
                    <textarea
                      value={trans.questionText || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [lang]: {
                              ...prev.translations[lang],
                              questionText: e.target.value
                            }
                          }
                        }));
                      }}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '13px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#d1d5db' }}>
                      Instruction Text
                    </label>
                    <textarea
                      value={trans.instructionText || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [lang]: {
                              ...prev.translations[lang],
                              instructionText: e.target.value
                            }
                          }
                        }));
                      }}
                      style={{
                        width: '100%',
                        minHeight: '40px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '13px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Options Tab */}
      {activeTab === 'options' && formData.questionType !== 'Text' && (
        <div>
          {/* Hide regular options for Grid questions */}
          {(formData.questionType !== 'SingleSelectGrid' && formData.questionType !== 'MultiSelectGrid') && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600', color: 'white' }}>
                Options ({formData.rows.length})
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {formData.rows.length > 0 && projectLanguages.length > 1 && (
                  <button
                    onClick={translateAllOptions}
                    disabled={translating}
                    style={{
                      padding: '6px 12px',
                      background: translating ? '#374151' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: translating ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    {translating ? '🔄' : '🌐'} Translate All
                  </button>
                )}
                <button 
                  onClick={addOption}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  ➕ Add Option
                </button>
              </div>
            </div>
            
            {errors.options && <div style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{errors.options}</div>}
            
            {formData.rows.map((option, index) => (
              <div key={index} style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${errors[`option_${index}`] ? '#ef4444' : '#533483'}`,
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="question-id-badge" style={{ 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {option.rowCode}
                      </span>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          checked={option.isQualify}
                          onChange={(e) => updateOptionProperty(index, 'isQualify', e.target.checked)}
                        />
                        Qualify
                      </label>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          checked={option.hasOtherField}
                          onChange={(e) => updateOptionProperty(index, 'hasOtherField', e.target.checked)}
                        />
                        Other
                      </label>
                      {formData.shuffleRows && (
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '4px' }}>
                          <input
                            type="checkbox"
                            checked={option.isNotShuffle}
                            onChange={(e) => updateOptionProperty(index, 'isNotShuffle', e.target.checked)}
                          />
                          Not Shuffle
                        </label>
                      )}
                      {formData.questionType === 'MultiSelect' && (
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                          <input
                            type="checkbox"
                            checked={option.isExclusive}
                            onChange={(e) => updateOptionProperty(index, 'isExclusive', e.target.checked)}
                          />
                          Exclusive
                        </label>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Enter option text in English..."
                      value={option.translations?.['en-US']?.rowText || ''}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${errors[`option_${index}`] ? '#ef4444' : '#374151'}`,
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '13px'
                      }}
                    />
                    {errors[`option_${index}`] && (
                      <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>
                        {errors[`option_${index}`]}
                      </div>
                    )}
                    
                    {/* Show other language translations */}
                    {Object.entries(option.translations || {}).filter(([lang]) => lang !== 'en-US').map(([lang, trans]) => (
                      <div key={lang} style={{ marginTop: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>{lang}:</div>
                        <input
                          type="text"
                          value={trans.rowText || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              rows: prev.rows.map((row, i) => 
                                i === index 
                                  ? {
                                      ...row,
                                      translations: {
                                        ...row.translations,
                                        [lang]: { rowText: e.target.value }
                                      }
                                    }
                                  : row
                              )
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '6px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid #374151',
                            borderRadius: '3px',
                            color: '#d1d5db',
                            fontSize: '11px'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => removeOption(index)}
                    style={{
                      padding: '4px 8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      marginLeft: '8px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
          </div>
          )}
          
          {/* Grid Questions - Rows and Columns */}
          {(formData.questionType === 'SingleSelectGrid' || formData.questionType === 'MultiSelectGrid') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Rows Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '600', color: 'white' }}>
                    Rows ({formData.rows.length})
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {formData.rows.length > 0 && projectLanguages.length > 1 && (
                      <button
                        onClick={translateAllOptions}
                        disabled={translating}
                        style={{
                          padding: '6px 12px',
                          background: translating ? '#374151' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: translating ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        {translating ? '🔄' : '🌐'} Translate All
                      </button>
                    )}
                    <button 
                      onClick={addOption}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}
                    >
                      ➕ Add Row
                    </button>
                  </div>
                </div>
                
                {formData.rows.map((option, index) => (
                  <div key={index} style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span className="question-id-badge" style={{ 
                            padding: '2px 6px', 
                            borderRadius: '3px', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {option.rowCode}
                          </span>

                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '4px' }}>
                            <input
                              type="checkbox"
                              checked={option.hasOtherField}
                              onChange={(e) => updateOptionProperty(index, 'hasOtherField', e.target.checked)}
                            />
                            Other
                          </label>
                          {formData.questionType === 'MultiSelectGrid' && (
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                              <input
                                type="checkbox"
                                checked={option.isExclusive}
                                onChange={(e) => updateOptionProperty(index, 'isExclusive', e.target.checked)}
                              />
                              Exclusive
                            </label>
                          )}
                          {formData.shuffleRows && (
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'white', padding: '2px 6px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '4px' }}>
                              <input
                                type="checkbox"
                                checked={option.isNotShuffle}
                                onChange={(e) => updateOptionProperty(index, 'isNotShuffle', e.target.checked)}
                              />
                              Not Shuffle
                            </label>
                          )}
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Enter row text in English..."
                          value={option.translations?.['en-US']?.rowText || ''}
                          onChange={(e) => updateOptionText(index, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '13px'
                          }}
                        />
                        
                        {/* Show other language translations */}
                        {Object.entries(option.translations || {}).filter(([lang]) => lang !== 'en-US').map(([lang, trans]) => (
                          <div key={lang} style={{ marginTop: '6px' }}>
                            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>{lang}:</div>
                            <input
                              type="text"
                              value={trans.rowText || ''}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  rows: prev.rows.map((row, i) => 
                                    i === index 
                                      ? {
                                          ...row,
                                          translations: {
                                            ...row.translations,
                                            [lang]: { rowText: e.target.value }
                                          }
                                        }
                                      : row
                                  )
                                }));
                              }}
                              style={{
                                width: '100%',
                                padding: '6px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid #374151',
                                borderRadius: '3px',
                                color: '#d1d5db',
                                fontSize: '11px'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => removeOption(index)}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '8px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Columns Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '600', color: 'white' }}>
                    Columns ({formData.columns.length})
                  </label>
                  {errors.columns && <div style={{ color: '#ef4444', fontSize: '10px' }}>{errors.columns}</div>}
                  <button 
                    onClick={() => {
                      const newColumn = {
                        columnCode: (formData.columns.length + 1).toString(),
                        translations: { 'en-US': { rowText: '' } },
                        isNotShuffle: false
                      };
                      setFormData(prev => ({
                        ...prev,
                        columns: [...prev.columns, newColumn]
                      }));
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    ➕ Add Column
                  </button>
                </div>
                
                {formData.columns.map((column, index) => (
                  <div key={index} style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid #533483',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="question-id-badge" style={{ 
                            padding: '2px 6px', 
                            borderRadius: '3px', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {column.columnCode}
                          </span>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Enter column text in English..."
                          value={column.translations?.['en-US']?.rowText || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              columns: prev.columns.map((col, i) => 
                                i === index 
                                  ? {
                                      ...col,
                                      translations: {
                                        ...col.translations,
                                        'en-US': { rowText: e.target.value }
                                      }
                                    }
                                  : col
                              )
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            columns: prev.columns.filter((_, i) => i !== index).map((col, i) => ({
                              ...col,
                              columnCode: (i + 1).toString()
                            }))
                          }));
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '8px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logic Tab */}
      {activeTab === 'logic' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
              Skip Countries
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {projectCountries.map(country => (
                <label key={country} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'white' }}>
                  <input
                    type="checkbox"
                    checked={formData.skipCountries.includes(country)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('skipCountries', [...formData.skipCountries, country]);
                      } else {
                        handleInputChange('skipCountries', formData.skipCountries.filter(c => c !== country));
                      }
                    }}
                  />
                  {country}
                </label>
              ))}
            </div>
            <small style={{ color: '#9ca3af', marginTop: '8px', display: 'block' }}>
              Selected countries will skip this question
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600', color: 'white' }}>
                Advanced Logic Conditions
              </label>
              <button
                onClick={addLogicCondition}
                style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ➕ Add Condition
              </button>
            </div>

            {(formData.logic?.conditions || []).map((condition, index) => (
              <div key={index} style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid #533483',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={condition.type}
                    onChange={(e) => updateLogicCondition(index, 'type', e.target.value)}
                    style={{
                      padding: '6px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    <option value="value">Value Logic</option>
                    <option value="option">Option Logic</option>
                    {(formData.questionType === 'SingleSelectGrid' || formData.questionType === 'MultiSelectGrid') && (
                      <option value="grid">Grid Logic</option>
                    )}
                  </select>

                  <select
                    value={condition.condition}
                    onChange={(e) => updateLogicCondition(index, 'condition', e.target.value)}
                    style={{
                      padding: '6px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">Select condition</option>
                    {condition.type === 'value' && formData.questionType === 'Text' && (
                      <>
                        <option value="equals">Equals</option>
                        <option value="less_than">Less than</option>
                        <option value="greater_than">Greater than</option>
                        <option value="less_than_or_equal">Less than or equal</option>
                        <option value="greater_than_or_equal">Greater than or equal</option>
                        <option value="not_equals">Not equals</option>
                      </>
                    )}
                    {condition.type === 'option' && (formData.questionType === 'SingleSelect' || formData.questionType === 'MultiSelect') && (
                      <>
                        <option value="selected">Option selected</option>
                        <option value="not_selected">Option not selected</option>
                      </>
                    )}
                    {condition.type === 'grid' && (formData.questionType === 'SingleSelectGrid' || formData.questionType === 'MultiSelectGrid') && (
                      <>
                        <option value="row_equals">Row equals column</option>
                        <option value="row_contains">Row contains column</option>
                        <option value="row_not_equals">Row not equals column</option>
                        <option value="row_not_contains">Row not contains column</option>
                      </>
                    )}
                  </select>

                  {condition.type === 'value' ? (
                    <input
                      type="text"
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => updateLogicCondition(index, 'value', e.target.value)}
                      style={{
                        padding: '6px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    />
                  ) : condition.type === 'grid' ? (
                    <div style={{ display: 'flex', gap: '1px' }}>
                      <select
                        value={condition.gridRow || ''}
                        onChange={(e) => updateLogicCondition(index, 'gridRow', e.target.value)}
                        style={{
                          padding: '6px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid #374151',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '12px',
                          width: '80px'
                        }}
                      >
                        <option value="">Row</option>
                        {formData.rows.map(row => (
                          <option key={row.rowCode} value={row.rowCode}>
                            {row.rowCode}
                          </option>
                        ))}
                      </select>
                      <select
                        value={condition.gridColumn || ''}
                        onChange={(e) => updateLogicCondition(index, 'gridColumn', e.target.value)}
                        style={{
                          padding: '6px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid #374151',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '12px',
                          width: '70px'
                        }}
                      >
                        <option value="">Column</option>
                        {formData.columns.map(col => (
                          <option key={col.columnCode} value={col.columnCode}>
                            {col.columnCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <select
                      value={condition.value}
                      onChange={(e) => updateLogicCondition(index, 'value', e.target.value)}
                      style={{
                        padding: '6px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      <option value="">Select option</option>
                      {formData.rows.map(row => (
                        <option key={row.rowCode} value={row.rowCode}>
                          {row.translations['en-US']?.rowText || row.rowCode}
                        </option>
                      ))}
                    </select>
                  )}

                  <select
                    value={condition.action}
                    onChange={(e) => updateLogicCondition(index, 'action', e.target.value)}
                    style={{
                      
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '5px',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      color: 'white',
                      width: '100px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="skip">Skip to</option>
                    <option value="terminate">Terminate</option>
                    <option value="qualify">Qualify</option>
                  </select>

                  {condition.action === 'skip' && (
                    <input
                      type="text"
                      placeholder="Question ID (e.g., S3)"
                      value={condition.target}
                      onChange={(e) => updateLogicCondition(index, 'target', e.target.value)}
                      style={{
                        padding: '6px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    />
                  )}
                </div>

                <button
                  onClick={() => removeLogicCondition(index)}
                  style={{
                    padding: '4px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Remove Condition
                </button>
              </div>
            ))}

            {(formData.logic?.conditions?.length || 0) === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#9ca3af',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                border: '1px dashed #533483'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔀</div>
                <p style={{ fontSize: '12px' }}>No logic conditions added</p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>Add conditions to control survey flow based on responses</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBuilder;