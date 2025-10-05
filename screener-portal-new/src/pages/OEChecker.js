import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import config from '../config';

const OEChecker = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'application/vnd.ms-excel' || 
        uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        uploadedFile.name.endsWith('.csv'))) {
      setFile(uploadedFile);
      setResults(null);
    } else {
      alert('Please upload a valid Excel or CSV file');
    }
  };

  const processFile = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${config.API_BASE_URL}/respondents/check-oe`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = Papa.unparse(results.processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `oe_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, filename);
  };

  return (
    <div className="oe-checker-page">
      <div className="page-header">
        <h2>🔍 OE Response Checker</h2>
        <p>Upload Excel/CSV file to analyze open-ended responses for quality and bot detection</p>
      </div>

      <div className="upload-section">
        <div className="upload-area">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="upload-label">
            <div className="upload-content">
              <span className="upload-icon">📁</span>
              <span className="upload-text">
                {file ? file.name : 'Click to upload Excel/CSV file'}
              </span>
              <span className="upload-hint">
                Make sure OE responses are in the first column (excluding header)
              </span>
            </div>
          </label>
        </div>

        <button 
          onClick={processFile}
          disabled={!file || processing}
          className="btn-process"
        >
          {processing ? '⏳ Processing...' : '🔍 Analyze Responses'}
        </button>
      </div>

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h2>📊 Analysis Results</h2>
            <button onClick={downloadResults} className="btn-download">
              📥 Download Results
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Responses</h3>
              <span className="stat-number">{results.totalResponses}</span>
            </div>
            <div className="stat-card">
              <h3>Flagged as Bot</h3>
              <span className="stat-number danger">{results.botResponses}</span>
            </div>
            <div className="stat-card">
              <h3>Quality Issues</h3>
              <span className="stat-number warning">{results.qualityIssues}</span>
            </div>
            <div className="stat-card">
              <h3>Average Bot Score</h3>
              <span className="stat-number">{results.averageBotScore}%</span>
            </div>
          </div>

          <div className="flags-summary">
            <h3>🚩 Common Issues Found</h3>
            <div className="flags-list">
              {results.flagsSummary && Object.entries(results.flagsSummary).map(([flag, count]) => (
                <div key={flag} className="flag-item">
                  <span className="flag-name">{flag.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="flag-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default OEChecker;