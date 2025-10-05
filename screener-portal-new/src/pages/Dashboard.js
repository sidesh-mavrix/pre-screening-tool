import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [respondentCounts, setRespondentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedCountries, setExpandedCountries] = useState({});
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, respondentsRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${config.API_BASE_URL}/respondents`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setProjects(projectsRes.data);
        setFilteredProjects(projectsRes.data);
        
        // Count responses per project
        const counts = {};
        respondentsRes.data.forEach(respondent => {
          const projectId = respondent.projectId;
          if (!counts[projectId]) counts[projectId] = 0;
          counts[projectId]++;
        });
        setRespondentCounts(counts);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.projectDescription && project.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const toggleProjectStatus = async (projectId, currentStatus) => {
    try {
      await axios.patch(`${config.API_BASE_URL}/projects/${projectId}`, {
        isEnabled: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(prev => prev.map(p => 
        p._id === projectId ? { ...p, isEnabled: !currentStatus } : p
      ));
    } catch (err) {
      console.error('Error updating project status:', err);
      alert('Failed to update project status');
    }
  };

  const generateSurveyLink = (projectCode, country, lang) => {
    return `${window.location.origin}/survey/${projectCode}?country=${country}&lang=${lang}&rid=RESPONDENT_ID`;
  };

  const showProjectLinks = (project) => {
    setSelectedProject(project);
    setShowLinksModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 className="dashboard-title" style={{ 
            fontSize: '28px', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 Project Dashboard
          </h1>
          <p className="dashboard-title" style={{ marginTop: '5px', fontSize: '14px' }}>
            Manage survey projects and monitor responses
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/create')} 
          className="btn btn-primary"
          style={{ 
            fontSize: '14px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ New Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ 
              flex: 1,
              margin: 0,
              fontSize: '14px',
              padding: '10px 12px'
            }}
          />
        </div>
      </div>

      <div className="card dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 20px', fontSize: '13px', width: '15%' }}>Project Code</th>
                <th style={{ padding: '12px 20px', fontSize: '13px', width: '30%' }}>Description</th>
                <th style={{ padding: '12px 20px', fontSize: '13px', width: '15%' }}>Countries</th>
                <th style={{ padding: '12px 20px', fontSize: '13px', textAlign: 'center', width: '10%' }}>Responses</th>
                <th style={{ padding: '12px 20px', fontSize: '13px', textAlign: 'center', width: '10%' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: '13px', width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id}>
                  <td style={{ padding: '12px 20px' }}>
                    <button
                      onClick={() => navigate(`/project/${project._id}`)}
                      className="dashboard-stat-value"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        textDecoration: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {project.projectCode}
                    </button>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      fontSize: '13px'
                    }}>
                      {project.projectDescription || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {(() => {
                        const countries = Object.keys(project.countryLanguages || {});
                        if (countries.length === 0) return '-';
                        
                        const isExpanded = expandedCountries[project._id];
                        
                        if (countries.length <= 2) {
                          return countries.join(', ');
                        }
                        
                        if (isExpanded) {
                          return (
                            <span>
                              {countries.join(', ')}
                              <button
                                onClick={() => setExpandedCountries(prev => ({ ...prev, [project._id]: false }))}
                                style={{
                                  marginLeft: '4px',
                                  background: 'none',
                                  border: 'none',
                                  color: '#60a5fa',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  textDecoration: 'underline'
                                }}
                              >
                                show less
                              </button>
                            </span>
                          );
                        }
                        
                        return (
                          <span>
                            {countries.slice(0, 2).join(', ')}
                            <button
                              onClick={() => setExpandedCountries(prev => ({ ...prev, [project._id]: true }))}
                              style={{
                                marginLeft: '4px',
                                background: 'none',
                                border: 'none',
                                color: '#60a5fa',
                                cursor: 'pointer',
                                fontSize: '11px',
                                textDecoration: 'underline'
                              }}
                            >
                              +{countries.length - 2}
                            </button>
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="dashboard-stat-value" style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px' }}>
                    {respondentCounts[project._id] || 0}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleProjectStatus(project._id, project.isEnabled)}
                      className={`btn btn-sm ${project.isEnabled ? 'btn-success' : 'btn-secondary'}`}
                      style={{ 
                        fontSize: '10px',
                        padding: '4px 8px',
                        minWidth: '60px'
                      }}
                    >
                      {project.isEnabled ? '✅' : '❌'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate(`/edit/${project._id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => showProjectLinks(project)}
                        className="btn btn-success btn-sm"
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        🔗
                      </button>
                      <button
                        onClick={() => navigate(`/preview/${project.projectCode}`)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
            <h3 style={{ marginBottom: '8px', color: '#374151', fontSize: '16px' }}>
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
              {searchTerm 
                ? `No projects match "${searchTerm}"`
                : 'Create your first project to get started'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => navigate('/create')} 
                className="btn btn-primary"
                style={{ fontSize: '14px' }}
              >
                ➕ Create First Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Links Modal */}
      {showLinksModal && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: 'var(--text-primary)', 
                margin: 0
              }}>
                🔗 Survey Links - {selectedProject.projectCode}
              </h2>
              <button
                onClick={() => setShowLinksModal(false)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {selectedProject.countryLanguages && Object.keys(selectedProject.countryLanguages).length > 0 ? (
                Object.entries(selectedProject.countryLanguages).map(([country, languages]) => (
                  <div key={country} style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'var(--bg-input)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      🌍 {country}
                    </h3>
                    {languages.map(lang => {
                      const link = generateSurveyLink(selectedProject.projectCode, country, lang);
                      return (
                        <div key={`${country}-${lang}`} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px',
                          padding: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            minWidth: '60px'
                          }}>
                            {lang}
                          </span>
                          <input
                            type="text"
                            value={link}
                            readOnly
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)',
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(link);
                              alert('📋 Link copied!');
                            }}
                            style={{
                              padding: '6px 10px',
                              background: 'var(--maverick-primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌍</div>
                  <p>No countries and languages configured for this project.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;