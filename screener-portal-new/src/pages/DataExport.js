import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import config from '../config';

const DataExport = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Responses' },
    { value: 'completed', label: 'Completed' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'in-progress', label: 'In Progress' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format) => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        projectId: selectedProject,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      };

      const response = await axios.get(`${config.API_BASE_URL}/respondents/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const data = response.data;
      const project = projects.find(p => p._id === selectedProject);
      const filename = `${project?.name || 'survey'}_responses_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${filename}.csv`);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Responses');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${filename}.xlsx`);
      }

      alert(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="data-export-page">
      <div className="page-header">
        <h2>📊 Data Export</h2>
        <p>Export survey responses in CSV or Excel format</p>
      </div>

      <div className="export-form">
        <div className="form-group">
          <label>Select Project</label>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a project...</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name} ({project.projectCode})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Response Status</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="export-buttons">
          <button 
            onClick={() => exportData('csv')}
            disabled={!selectedProject || exporting}
            className="btn-export csv"
          >
            {exporting ? '⏳ Exporting...' : '📄 Export as CSV'}
          </button>
          
          <button 
            onClick={() => exportData('excel')}
            disabled={!selectedProject || exporting}
            className="btn-export excel"
          >
            {exporting ? '⏳ Exporting...' : '📊 Export as Excel'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .data-export-page {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #2563eb;
        }

        .export-form {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .export-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn-export {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-export.csv {
          background: #10b981;
          color: white;
        }

        .btn-export.csv:hover:not(:disabled) {
          background: #059669;
        }

        .btn-export.excel {
          background: #3b82f6;
          color: white;
        }

        .btn-export.excel:hover:not(:disabled) {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default DataExport;