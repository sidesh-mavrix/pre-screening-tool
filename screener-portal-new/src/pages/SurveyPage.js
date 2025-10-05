import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const SurveyPage = () => {
  const { projectCode } = useParams();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [responses, setResponses] = useState({});
  const [otherValues, setOtherValues] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState({});

  const rid = searchParams.get('rid');
  const country = searchParams.get('country');
  const lang = searchParams.get('lang') || 'en-US';

  useEffect(() => {
    // Set page title
    document.title = 'Mavrix Survey';
    
    if (!rid || !country) {
      alert('❌ Missing required parameters: country and rid');
      return;
    }

    const fetchProjectAndCreateRespondent = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/projects/public/${projectCode}`);
        const projectData = res.data;
        
        // Validate country and language using countryLanguages mapping
        const supportedCountries = Object.keys(projectData.countryLanguages || {});
        if (!supportedCountries.includes(country)) {
          alert(`❌ Country "${country}" is not supported for this survey. Supported countries: ${supportedCountries.join(', ') || 'None'}`);
          return;
        }
        
        const supportedLanguagesForCountry = projectData.countryLanguages[country] || [];
        if (!supportedLanguagesForCountry.includes(lang)) {
          alert(`❌ Language "${lang}" is not supported for country "${country}". Supported languages: ${supportedLanguagesForCountry.join(', ') || 'None'}`);
          return;
        }
        
        setProject(projectData);
        
        const respondentPayload = {
          projectCode,
          respondentCode: rid,
          countryCode: country,
          languageCode: lang
        };
        
        const createResponse = await axios.post(`${config.API_BASE_URL}/respondents/public`, respondentPayload);
        setLoading(false);
      } catch (err) {
        console.error('Error loading survey:', err);
        if (err.response?.status === 409) {
          alert(`❌ ${err.response?.data?.message || 'Cannot access survey - already completed or terminated'}`);
        } else {
          alert('❌ Survey not found or not available');
        }
      }
    };

    fetchProjectAndCreateRespondent();
  }, [projectCode, rid, country, lang]);

  const getTranslation = (translations, lang, fallback = '[Translation Missing]') => {
    if (!translations) return fallback;
    
    if (translations[lang]) {
      return translations[lang].questionText || translations[lang].rowText || translations[lang].instructionText || fallback;
    }
    
    // Try English as fallback
    if (translations['en-US']) {
      return translations['en-US'].questionText || translations['en-US'].rowText || translations['en-US'].instructionText || fallback;
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

  const shouldSkipQuestion = (question) => {
    return question.skipCountries && question.skipCountries.includes(country);
  };

  const findNextQuestion = (startIndex) => {
    for (let i = startIndex; i < project.questions.length; i++) {
      if (!shouldSkipQuestion(project.questions[i])) {
        return i;
      }
    }
    return -1; // No more questions
  };

  const checkLogicConditions = (question, answer) => {
    if (!question.logic?.conditions || question.logic.conditions.length === 0) {
      return null;
    }

    for (const condition of question.logic.conditions) {
      let conditionMet = false;

      if (condition.type === 'value' && question.questionType === 'Text') {
        const numAnswer = parseFloat(answer);
        const numValue = parseFloat(condition.value);
        
        switch (condition.condition) {
          case 'equals':
            conditionMet = answer === condition.value || (!isNaN(numAnswer) && !isNaN(numValue) && numAnswer === numValue);
            break;
          case 'less_than':
            conditionMet = !isNaN(numAnswer) && !isNaN(numValue) && numAnswer < numValue;
            break;
          case 'greater_than':
            conditionMet = !isNaN(numAnswer) && !isNaN(numValue) && numAnswer > numValue;
            break;
          case 'less_than_or_equal':
            conditionMet = !isNaN(numAnswer) && !isNaN(numValue) && numAnswer <= numValue;
            break;
          case 'greater_than_or_equal':
            conditionMet = !isNaN(numAnswer) && !isNaN(numValue) && numAnswer >= numValue;
            break;
          case 'not_equals':
            conditionMet = answer !== condition.value && (!isNaN(numAnswer) && !isNaN(numValue) && numAnswer !== numValue);
            break;
        }
      } else if (condition.type === 'option' && (question.questionType === 'SingleSelect' || question.questionType === 'MultiSelect')) {
        if (question.questionType === 'SingleSelect') {
          switch (condition.condition) {
            case 'selected':
              conditionMet = answer === condition.value;
              break;
            case 'not_selected':
              conditionMet = answer !== condition.value;
              break;
          }
        } else if (question.questionType === 'MultiSelect') {
          const answerArray = Array.isArray(answer) 
            ? answer.map(String) 
            : [];

          const qualifyingOptions = (question.rows || [])
            .filter(row => row.isQualify)
            .map(row => String(row.rowCode));

          const rejectingOptions = (question.rows || [])
            .filter(row => !row.isQualify)
            .map(row => String(row.rowCode));

          // Handle rejecting logic type - if any rejecting option is selected, terminate
          if (question.logicType === 'rejecting') {
            const hasRejectingOption = answerArray.some(opt => rejectingOptions.includes(opt));
            if (hasRejectingOption) {
              return { action: 'terminate', target: null };
            }
          }
          
          // Handle qualifying logic type - if no qualifying option is selected, terminate
          if (question.logicType === 'qualifying') {
            const hasQualifyingOption = answerArray.some(opt => qualifyingOptions.includes(opt));
            if (!hasQualifyingOption && answerArray.length > 0) {
              return { action: 'terminate', target: null };
            }
          }
          
          switch (condition.condition) {
            case 'selected':
              conditionMet = answerArray.includes(condition.value);
              break;
            case 'not_selected':
              conditionMet = !answerArray.includes(condition.value);
              break;
          }
        }
      } else if (condition.type === 'grid' && (question.questionType === 'SingleSelectGrid' || question.questionType === 'MultiSelectGrid')) {
        if (condition.gridRow && condition.gridColumn) {
          // For Grid questions, answer is the full responses object
          const gridResponse = typeof answer === 'object' && answer !== null ? 
            answer[`${question.questionId}_${condition.gridRow}`] : 
            responses[`${question.questionId}_${condition.gridRow}`];
          
          console.log('🔍 Grid Logic Check:', {
            questionId: question.questionId,
            gridRow: condition.gridRow,
            gridColumn: condition.gridColumn,
            condition: condition.condition,
            action: condition.action,
            gridResponse,
            expectedMatch: `Row ${condition.gridRow} ${condition.condition.replace('row_', '').replace('_', ' ')} Column ${condition.gridColumn}`,
            actualResult: `Row ${condition.gridRow} selected Column ${gridResponse}`,
            shouldTerminate: condition.action === 'terminate'
          });
          
          if (gridResponse) {
            switch (condition.condition) {
              case 'row_equals':
                if (question.questionType === 'SingleSelectGrid') {
                  conditionMet = gridResponse === condition.gridColumn;
                } else {
                  conditionMet = Array.isArray(gridResponse) && gridResponse.length === 1 && gridResponse[0] === condition.gridColumn;
                }
                break;
              case 'row_contains':
                if (question.questionType === 'SingleSelectGrid') {
                  conditionMet = gridResponse === condition.gridColumn;
                } else {
                  conditionMet = Array.isArray(gridResponse) && gridResponse.includes(condition.gridColumn);
                }
                break;
              case 'row_not_equals':
                if (question.questionType === 'SingleSelectGrid') {
                  conditionMet = gridResponse !== condition.gridColumn;
                } else {
                  conditionMet = !Array.isArray(gridResponse) || gridResponse.length !== 1 || gridResponse[0] !== condition.gridColumn;
                }
                break;
              case 'row_not_contains':
                if (question.questionType === 'SingleSelectGrid') {
                  conditionMet = gridResponse !== condition.gridColumn;
                } else {
                  conditionMet = !Array.isArray(gridResponse) || !gridResponse.includes(condition.gridColumn);
                }
                break;
            }
            
            console.log(`🎯 Grid Logic Result: ${conditionMet ? '✅ CONDITION MET' : '❌ CONDITION NOT MET'}`, {
              conditionMet,
              condition: condition.condition,
              action: condition.action,
              willTrigger: conditionMet ? `YES - Will ${condition.action}` : 'NO - Continue survey'
            });
          }
        }
      }

      if (conditionMet) {
        return {
          action: condition.action,
          target: condition.target
        };
      }
    }

    return null;
  };

  const checkTermination = (question, answer) => {
    console.log('🔍 Checking termination for:', {
      questionId: question.questionId,
      questionType: question.questionType,
      answer,
      textType: question.textType,
      minValue: question.minValue,
      maxValue: question.maxValue
    });
    
    // First check advanced logic conditions
    const logicResult = checkLogicConditions(question, answer);
    if (logicResult) {
      console.log('⚡ Logic condition triggered:', logicResult);
      if (logicResult.action === 'terminate') return { type: 'terminate' };
      if (logicResult.action === 'qualify') return { type: 'qualify' };
      if (logicResult.action === 'skip') return { type: 'skip', target: logicResult.target };
    }

    // Then check built-in validation rules
    if (question.questionType === 'Text') {
      const actualAnswer = typeof answer === 'object' ? answer[question.questionId] : answer;
      console.log('📝 Text question check:', { actualAnswer, textType: question.textType });
      
      if (question.textType === 'numeric') {
        const numAnswer = parseFloat(actualAnswer);
        console.log('🔢 Numeric validation:', { numAnswer, minValue: question.minValue, maxValue: question.maxValue });
        
        if (!isNaN(numAnswer)) {
          if (question.minValue !== null && question.minValue !== undefined && numAnswer < parseFloat(question.minValue)) {
            console.log('❌ Below minimum value - TERMINATE');
            return { type: 'terminate' };
          }
          if (question.maxValue !== null && question.maxValue !== undefined && numAnswer > parseFloat(question.maxValue)) {
            console.log('❌ Above maximum value - TERMINATE');
            return { type: 'terminate' };
          }
        }
      } else {
        if (question.minLength && actualAnswer && actualAnswer.length < question.minLength) {
          alert(`Minimum ${question.minLength} characters required`);
          return null;
        }
        if (question.maxLength && actualAnswer && actualAnswer.length > question.maxLength) {
          alert(`Maximum ${question.maxLength} characters allowed`);
          return null;
        }
      }
    }
    
    if (question.questionType === 'SingleSelect') {
      const actualAnswer = typeof answer === 'object' ? answer[question.questionId] : answer;
      const selectedOption = question.rows?.find(row => row.rowCode === actualAnswer);
      if (selectedOption && !selectedOption.isQualify) {
        console.log('❌ Non-qualifying option selected - TERMINATE');
        return { type: 'terminate' };
      }
    }
    
    // Updated MultiSelect termination check with debug logs

// Existing buggy code (simplified):
// const actualAnswer = typeof answer === 'object' ? answer[question.questionId] : answer;
// const answerArray = Array.isArray(actualAnswer) ? actualAnswer.map(String) : [];
//
// Revised code:
if (question.questionType === 'MultiSelect') {
  // Ensure answer is treated as array of strings
  const answerArray = Array.isArray(answer) 
    ? answer.map(String) 
    : [];

  const selectedOptions = (question.rows || [])
    .filter(row => answerArray.includes(String(row.rowCode)));

  console.log('🔍 MultiSelect Debug:', {
    answerArray,
    selectedOptions: selectedOptions.map(o => ({ rowCode: o.rowCode, isQualify: o.isQualify }))
  });

  if (question.logicType === 'qualifying') {
    const hasQualifyingOption = selectedOptions.some(opt => opt.isQualify);
    if (!hasQualifyingOption) {
      console.log('❌ No qualifying options selected - TERMINATE');
      return { type: 'terminate' };
    }
  }
  if (question.logicType === 'rejecting') {
    const hasRejectingOption = selectedOptions.some(opt => !opt.isQualify);
    if (hasRejectingOption) {
      console.log('❌ Rejecting option selected - TERMINATE');
      return { type: 'terminate' };
    }
  }

  console.log('✅ Passed MultiSelect logic check - CONTINUE');
}


// Continue with the rest of the survey logic

console.log('✅ No termination conditions met');
    return null;
  };

  const handleNext = async () => {
    const currentQuestion = project.questions[currentQuestionIndex];
    
    // Validate responses based on question type
    if (currentQuestion.questionType === 'SingleSelectGrid' || currentQuestion.questionType === 'MultiSelectGrid') {
      const rows = currentQuestion.rows || [];
      const hasAllResponses = rows.every(row => {
        const rowResponse = responses[`${currentQuestion.questionId}_${row.rowCode}`];
        return rowResponse && (Array.isArray(rowResponse) ? rowResponse.length > 0 : rowResponse);
      });
      
      if (!hasAllResponses) {
        alert('Please answer all rows before continuing');
        return;
      }
    } else {
      const currentAnswer = responses[currentQuestion.questionId];
      if (!currentAnswer) {
        alert('Please select an answer before continuing');
        return;
      }
      
      // Validate 'Other' fields for SingleSelect
      if (currentQuestion.questionType === 'SingleSelect') {
        const selectedOption = currentQuestion.rows.find(row => row.rowCode === currentAnswer);
        if (selectedOption && selectedOption.hasOtherField && !otherValues[currentQuestion.questionId]) {
          alert('Please fill in the "Please specify" field');
          return;
        }
      }
      
      // Validate 'Other' fields for MultiSelect
      if (currentQuestion.questionType === 'MultiSelect') {
        const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
        const hasInvalidOther = selectedOptions.some(optionCode => {
          const option = currentQuestion.rows.find(row => row.rowCode === optionCode);
          return option && option.hasOtherField && !otherValues[`${currentQuestion.questionId}_${optionCode}`];
        });
        
        if (hasInvalidOther) {
          alert('Please fill in all "Please specify" fields');
          return;
        }
      }
    }
    
    // Get current answer based on question type
    let currentAnswer;
    if (currentQuestion.questionType === 'SingleSelectGrid' || currentQuestion.questionType === 'MultiSelectGrid') {
      // For Grid questions, we need to check all row responses
      currentAnswer = responses; // Pass all responses for Grid logic check
    } else {
      currentAnswer = responses[currentQuestion.questionId];
    }
    
    // Always save current response first
    await saveCurrentResponse();
    
    // Check termination logic first (including for last question)
    const terminationResult = checkTermination(currentQuestion, currentAnswer);
    if (terminationResult) {
      if (terminationResult.type === 'terminate') {
        await handleTermination('Failed qualification criteria');
        return;
      } else if (terminationResult.type === 'qualify') {
        await handleQualification();
        return;
      } else if (terminationResult.type === 'skip') {
        await skipToQuestion(terminationResult.target);
        return;
      }
    }
    
    // Find next non-skipped question
    const nextIndex = findNextQuestion(currentQuestionIndex + 1);
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      // This is the last question and no logic triggered - complete survey
      await handleSubmit();
    }
  };

  const saveCurrentResponse = async () => {
    const currentQuestion = project.questions[currentQuestionIndex];
    
    let responseData = { responses: [] };
    
    if (currentQuestion.questionType === 'SingleSelectGrid' || currentQuestion.questionType === 'MultiSelectGrid') {
      // Save each row as separate response with S1_1, S1_2 format
      const rows = currentQuestion.rows || [];
      rows.forEach(row => {
        const rowResponse = responses[`${currentQuestion.questionId}_${row.rowCode}`];
        if (rowResponse && (Array.isArray(rowResponse) ? rowResponse.length > 0 : rowResponse)) {
          responseData.responses.push({
            qid: `${currentQuestion.questionId}_${row.rowCode}`,
            answer: rowResponse,
            otherTextValue: undefined
          });
        }
      });
    } else {
      // Regular question response
      const currentAnswer = responses[currentQuestion.questionId];
      if (!currentAnswer) return;
      
      responseData.responses.push({
        qid: currentQuestion.questionId,
        answer: currentAnswer,
        otherTextValue: otherValues[currentQuestion.questionId] || undefined
      });
    }
    
    if (responseData.responses.length === 0) return;
    
    console.log('Saving response:', responseData);
    
    try {
      const result = await axios.patch(`${config.API_BASE_URL}/respondents/public/${projectCode}/${rid}`, responseData);
      console.log('Response saved successfully:', result.data);
    } catch (err) {
      console.error('Error saving response:', err);
    }
  };

  const skipToQuestion = async (targetQuestionId) => {
    const targetIndex = project.questions.findIndex(q => q.questionId === targetQuestionId);
    if (targetIndex !== -1) {
      const nextValidIndex = findNextQuestion(targetIndex);
      if (nextValidIndex !== -1) {
        setCurrentQuestionIndex(nextValidIndex);
      } else {
        await handleSubmit();
      }
    } else {
      const nextIndex = findNextQuestion(currentQuestionIndex + 1);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleQualification = async () => {
    try {
      await axios.patch(`${config.API_BASE_URL}/respondents/public/${projectCode}/${rid}`, {
        status: 'completed',
        completionTimeSec: 60,
        endTime: new Date().toISOString()
      });
      
      if (project.qualifyLink) {
        window.location.href = project.qualifyLink;
      } else {
        alert('✅ Survey completed - You qualify!');
      }
    } catch (err) {
      console.error('Error qualifying:', err);
    }
  };

  const handleTermination = async (reason) => {
    const currentQuestion = project.questions[currentQuestionIndex];
    try {
      // Save current response before terminating
      const currentAnswer = responses[currentQuestion.questionId];
      const allResponses = Object.entries(responses).map(([qid, answer]) => {
        const question = project.questions.find(q => q.questionId === qid);
        let otherTextValue = undefined;
        
        if (question?.questionType === 'MultiSelect') {
          // Collect other texts for multi-select
          const otherTexts = {};
          const selectedAnswers = Array.isArray(answer) ? answer : [];
          selectedAnswers.forEach(optionCode => {
            const otherKey = `${qid}_${optionCode}`;
            if (otherValues[otherKey]) {
              otherTexts[optionCode] = otherValues[otherKey];
            }
          });
          if (Object.keys(otherTexts).length > 0) {
            otherTextValue = JSON.stringify(otherTexts);
          }
        } else {
          // Single select or text
          otherTextValue = otherValues[qid] || undefined;
        }
        
        return {
          qid,
          answer,
          otherTextValue
        };
      });
      
      await axios.patch(`${config.API_BASE_URL}/respondents/public/${projectCode}/${rid}`, {
        status: 'terminated',
        terminationReason: reason,
        terminatedAtQuestion: currentQuestion.questionId,
        responses: allResponses,
        endTime: new Date().toISOString()
      });
      
      if (project.terminateLink) {
        window.location.href = project.terminateLink;
      } else {
        alert('❌ Survey terminated: ' + reason);
      }
    } catch (err) {
      console.error('Error terminating:', err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const currentQuestion = project.questions[currentQuestionIndex];
      
      // Get current answer based on question type
      let currentAnswer;
      if (currentQuestion.questionType === 'SingleSelectGrid' || currentQuestion.questionType === 'MultiSelectGrid') {
        currentAnswer = responses; // Pass all responses for Grid logic check
      } else {
        currentAnswer = responses[currentQuestion.questionId];
      }
      
      // Save current response if exists
      if (currentQuestion && currentAnswer) {
        await saveCurrentResponse();
      }
      
      // CHECK TERMINATION LOGIC FIRST - even for last question!
      console.log('🔍 Final question termination check before completion');
      const terminationResult = checkTermination(currentQuestion, currentAnswer);
      if (terminationResult) {
        if (terminationResult.type === 'terminate') {
          console.log('❌ Last question triggered termination');
          await handleTermination('Failed qualification criteria on final question');
          return;
        } else if (terminationResult.type === 'qualify') {
          console.log('✅ Last question triggered early qualification');
          await handleQualification();
          return;
        }
      }
      
      // If no termination triggered, complete normally
      console.log('✅ Final question passed all checks - completing survey');
      
      const allResponses = Object.entries(responses).map(([qid, answer]) => {
        const question = project.questions.find(q => q.questionId === qid);
        let otherTextValue = undefined;
        
        if (question?.questionType === 'MultiSelect') {
          // Collect other texts for multi-select
          const otherTexts = {};
          const selectedAnswers = Array.isArray(answer) ? answer : [];
          selectedAnswers.forEach(optionCode => {
            const otherKey = `${qid}_${optionCode}`;
            if (otherValues[otherKey]) {
              otherTexts[optionCode] = otherValues[otherKey];
            }
          });
          if (Object.keys(otherTexts).length > 0) {
            otherTextValue = JSON.stringify(otherTexts);
          }
        } else {
          // Single select or text
          otherTextValue = otherValues[qid] || undefined;
        }
        
        return {
          qid,
          answer,
          otherTextValue
        };
      });
      
      console.log('Final submission with responses:', allResponses);

      await axios.patch(`${config.API_BASE_URL}/respondents/public/${projectCode}/${rid}`, {
        status: 'completed',
        responses: allResponses,
        completionTimeSec: 120,
        endTime: new Date().toISOString()
      });
      
      if (project.qualifyLink) {
        window.location.href = project.qualifyLink;
      } else {
        alert('✅ Survey completed successfully!');
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      alert('❌ Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  // Skip questions on load and shuffle options once
  useEffect(() => {
    if (project && project.questions && project.questions.length > 0) {
      const firstValidIndex = findNextQuestion(0);
      if (firstValidIndex !== -1 && firstValidIndex !== currentQuestionIndex) {
        setCurrentQuestionIndex(firstValidIndex);
      }
      
      // Shuffle options once for all questions
      const shuffled = {};
      project.questions.forEach(question => {
        if (question.questionType === 'SingleSelectGrid' || question.questionType === 'MultiSelectGrid') {
          // Shuffle rows
          if (question.shuffleRows && question.rows) {
            const shuffleableRows = question.rows.filter(opt => !opt.isNotShuffle);
            const notShuffleRows = question.rows.filter(opt => opt.isNotShuffle);
            const shuffledRows = [...shuffleableRows].sort(() => Math.random() - 0.5);
            shuffled[question.questionId] = [...shuffledRows, ...notShuffleRows];
          } else {
            shuffled[question.questionId] = question.rows || [];
          }
          
          // Shuffle columns
          if (question.shuffleColumns && question.columns) {
            const shuffleableColumns = question.columns.filter(col => !col.isNotShuffle);
            const notShuffleColumns = question.columns.filter(col => col.isNotShuffle);
            const shuffledColumns = [...shuffleableColumns].sort(() => Math.random() - 0.5);
            shuffled[`${question.questionId}_columns`] = [...shuffledColumns, ...notShuffleColumns];
          } else {
            shuffled[`${question.questionId}_columns`] = question.columns || [];
          }
        } else {
          // Regular questions
          if (question.shuffleRows && question.rows) {
            const shuffleableOptions = question.rows.filter(opt => !opt.isNotShuffle);
            const notShuffleOptions = question.rows.filter(opt => opt.isNotShuffle);
            const shuffledOptions = [...shuffleableOptions].sort(() => Math.random() - 0.5);
            shuffled[question.questionId] = [...shuffledOptions, ...notShuffleOptions];
          } else {
            shuffled[question.questionId] = question.rows || [];
          }
        }
      });
      setShuffledOptions(shuffled);
    }
  }, [project]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--primary-black) 0%, var(--secondary-black) 100%)',
        color: 'var(--white)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading Survey...</div>
        </div>
      </div>
    );
  }

  if (!project || !project.questions || project.questions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--error) 0%, #dc2626 100%)',
        color: 'var(--white)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>❌</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Survey Not Found</div>
        </div>
      </div>
    );
  }

  const currentQuestion = project.questions[currentQuestionIndex];
  const totalQuestions = project.questions.filter(q => !shouldSkipQuestion(q)).length;
  const answeredQuestions = Object.keys(responses).length;
  const isLastQuestion = findNextQuestion(currentQuestionIndex + 1) === -1;
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
        </div>

        {/* Progress Bar - Commented */}
        {/* <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e2e8f0', 
          borderRadius: '4px', 
          marginBottom: '40px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div> */}

        {/* Question */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#1e293b',
            lineHeight: '1.4'
          }}>
            {getTranslation(currentQuestion.translations, lang)}
          </div>

          {/* Single Select */}
          {currentQuestion.questionType === 'SingleSelect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(shuffledOptions[currentQuestion.questionId] || currentQuestion.rows || []).map((option) => (
                <label 
                  key={option.rowCode} 
                  className={`option-label ${responses[currentQuestion.questionId] === option.rowCode ? 'selected' : ''}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <input
                    type="radio"
                    name={currentQuestion.questionId}
                    value={option.rowCode}
                    checked={responses[currentQuestion.questionId] === option.rowCode}
                    onChange={(e) => setResponses(prev => ({ ...prev, [currentQuestion.questionId]: e.target.value }))}
                    style={{ width: '18px', height: '18px', accentColor: '#3b82f6', marginRight: '12px' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: '500', flex: 1, color: '#374151' }}>
                    {getTranslation(option.translations, lang)}
                  </span>
                  {option.hasOtherField && responses[currentQuestion.questionId] === option.rowCode && (
                    <input
                      type="text"
                      placeholder="Please specify..."
                      value={otherValues[currentQuestion.questionId] || ''}
                      onChange={(e) => setOtherValues(prev => ({ ...prev, [currentQuestion.questionId]: e.target.value }))}
                      className="survey-input"
                      style={{
                        width: '200px',
                        margin: 0,
                        fontSize: '14px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        color: 'black'
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Multi Select */}
          {currentQuestion.questionType === 'MultiSelect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(shuffledOptions[currentQuestion.questionId] || currentQuestion.rows || []).map((option) => (
                <label 
                  key={option.rowCode}
                  className={`option-label ${(responses[currentQuestion.questionId] || []).includes(option.rowCode) ? 'selected' : ''}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={(responses[currentQuestion.questionId] || []).includes(option.rowCode)}
                    onChange={(e) => {
                      const currentValues = responses[currentQuestion.questionId] || [];
                      if (e.target.checked) {
                        if (option.isExclusive) {
                          // If this is exclusive, select only this option
                          setResponses(prev => ({ ...prev, [currentQuestion.questionId]: [option.rowCode] }));
                        } else {
                          // Check if any exclusive option is currently selected
                          const hasExclusiveSelected = currentValues.some(val => {
                            const selectedOption = currentQuestion.rows?.find(row => row.rowCode === val);
                            return selectedOption?.isExclusive;
                          });
                          if (hasExclusiveSelected) {
                            // Replace exclusive with this option
                            setResponses(prev => ({ ...prev, [currentQuestion.questionId]: [option.rowCode] }));
                          } else {
                            // Add to existing selections
                            setResponses(prev => ({ ...prev, [currentQuestion.questionId]: [...currentValues, option.rowCode] }));
                          }
                        }
                      } else {
                        setResponses(prev => ({ ...prev, [currentQuestion.questionId]: currentValues.filter(val => val !== option.rowCode) }));
                      }
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#3b82f6', marginRight: '12px' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: '500', flex: 1, color: '#374151' }}>
                    {getTranslation(option.translations, lang)}
                  </span>
                  {option.hasOtherField && (responses[currentQuestion.questionId] || []).includes(option.rowCode) && (
                    <input
                      type="text"
                      placeholder="Please specify..."
                      value={otherValues[`${currentQuestion.questionId}_${option.rowCode}`] || ''}
                      onChange={(e) => setOtherValues(prev => ({ ...prev, [`${currentQuestion.questionId}_${option.rowCode}`]: e.target.value }))}
                      className="survey-input"
                      style={{
                        width: '200px',
                        margin: 0,
                        fontSize: '14px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        color: 'black'
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Single Select Grid */}
          {currentQuestion.questionType === 'SingleSelectGrid' && (
            <div style={{ overflowX: 'auto' }}>
              {console.log('SingleSelectGrid - Current Question:', currentQuestion)}
              {console.log('Rows:', currentQuestion.rows)}
              {console.log('Columns:', currentQuestion.columns)}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}></th>
                    {(shuffledOptions[`${currentQuestion.questionId}_columns`] || currentQuestion.columns || []).map((column) => (
                      <th key={column.columnCode} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                        {getTranslation(column.translations, lang)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(shuffledOptions[currentQuestion.questionId] || currentQuestion.rows || []).map((row) => (
                    <tr key={row.rowCode} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '500', fontSize: '14px' }}>
                        {getTranslation(row.translations, lang)}
                      </td>
                      {(shuffledOptions[`${currentQuestion.questionId}_columns`] || currentQuestion.columns || []).map((column) => (
                        <td key={column.columnCode} style={{ padding: '12px', textAlign: 'center' }}>
                          <input
                            type="radio"
                            name={`${currentQuestion.questionId}_${row.rowCode}`}
                            value={column.columnCode}
                            checked={responses[`${currentQuestion.questionId}_${row.rowCode}`] === column.columnCode}
                            onChange={(e) => setResponses(prev => ({ ...prev, [`${currentQuestion.questionId}_${row.rowCode}`]: e.target.value }))}
                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Multi Select Grid */}
          {currentQuestion.questionType === 'MultiSelectGrid' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}></th>
                    {(shuffledOptions[`${currentQuestion.questionId}_columns`] || currentQuestion.columns || []).map((column) => (
                      <th key={column.columnCode} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                        {getTranslation(column.translations, lang)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(shuffledOptions[currentQuestion.questionId] || currentQuestion.rows || []).map((row) => (
                    <tr key={row.rowCode} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '500', fontSize: '14px' }}>
                        {getTranslation(row.translations, lang)}
                      </td>
                      {(shuffledOptions[`${currentQuestion.questionId}_columns`] || currentQuestion.columns || []).map((column) => (
                        <td key={column.columnCode} style={{ padding: '12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={(responses[`${currentQuestion.questionId}_${row.rowCode}`] || []).includes(column.columnCode)}
                            onChange={(e) => {
                              const currentValues = responses[`${currentQuestion.questionId}_${row.rowCode}`] || [];
                              if (e.target.checked) {
                                setResponses(prev => ({ ...prev, [`${currentQuestion.questionId}_${row.rowCode}`]: [...currentValues, column.columnCode] }));
                              } else {
                                setResponses(prev => ({ ...prev, [`${currentQuestion.questionId}_${row.rowCode}`]: currentValues.filter(val => val !== column.columnCode) }));
                              }
                            }}
                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Text Input */}
          {currentQuestion.questionType === 'Text' && (
            <div>
              {currentQuestion.textType === 'numeric' ? (
                <input
                  type="number"
                  value={responses[currentQuestion.questionId] || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, [currentQuestion.questionId]: e.target.value }))}
                  placeholder="Please enter a number..."
                  className="survey-input"
                  style={{
                    fontSize: '16px',
                    padding: '12px'
                  }}
                />
              ) : (
                <textarea
                  value={responses[currentQuestion.questionId] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setResponses(prev => ({ ...prev, [currentQuestion.questionId]: value }));
                    
                    // Check character limits for text type
                    if (currentQuestion.minLength && value.length < currentQuestion.minLength) {
                      // Don't show alert immediately, just on blur or submit
                    } else if (currentQuestion.maxLength && value.length > currentQuestion.maxLength) {
                      alert(`Maximum ${currentQuestion.maxLength} characters allowed. Current: ${value.length}`);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (currentQuestion.minLength && value.length > 0 && value.length < currentQuestion.minLength) {
                      alert(`Minimum ${currentQuestion.minLength} characters required. Current: ${value.length}`);
                    }
                  }}
                  placeholder="Please enter your response..."
                  className="survey-textarea"
                  style={{
                    minHeight: '120px',
                    fontSize: '16px'
                  }}
                />
              )}

            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          paddingTop: '30px',
          borderTop: '1px solid #e2e8f0'
        }}>
          
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="btn btn-primary btn-lg"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? '⏳ Submitting...' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;