import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, respondentsRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${config.API_BASE_URL}/respondents?projectId=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setProject(projectRes.data);
        setRespondents(respondentsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const getStatusCount = (status) => {
    return respondents.filter(r => r.status === status).length;
  };

  const getCountryStats = () => {
    const stats = {};
    const countries = Object.keys(project?.countryLanguages || {});
    countries.forEach(country => {
      stats[country] = {
        completed: respondents.filter(r => r.countryCode === country && r.status === 'completed').length,
        terminated: respondents.filter(r => r.countryCode === country && r.status === 'terminated').length,
        inProgress: respondents.filter(r => r.countryCode === country && r.status === 'in-progress').length,
      };
    });
    return stats;
  };

  const getChartColors = () => {
    const root = document.documentElement;
    return {
      textColor: getComputedStyle(root).getPropertyValue('--chart-text-color').trim(),
      secondaryColor: getComputedStyle(root).getPropertyValue('--text-secondary').trim(),
      borderColor: getComputedStyle(root).getPropertyValue('--border-color').trim(),
      successColor: getComputedStyle(root).getPropertyValue('--chart-success-color').trim(),
      errorColor: getComputedStyle(root).getPropertyValue('--chart-error-color').trim(),
      infoColor: getComputedStyle(root).getPropertyValue('--chart-info-color').trim()
    };
  };

  const getChartData = () => {
    const dailyStats = {};
    
    respondents.forEach(r => {
      const date = new Date(r.endTime || r.updatedAt || r.createdAt).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { completed: 0, terminated: 0, total: 0 };
      }
      
      if (r.status === 'completed') dailyStats[date].completed++;
      if (r.status === 'terminated') dailyStats[date].terminated++;
      dailyStats[date].total++;
    });

    const sortedDates = Object.keys(dailyStats).sort((a, b) => new Date(a) - new Date(b));
    const colors = getChartColors();
    
    return {
      labels: sortedDates,
      datasets: [
        {
          label: '✅ Completed',
          data: sortedDates.map(date => dailyStats[date].completed),
          borderColor: colors.successColor,
          backgroundColor: colors.successColor + '20',
          tension: 0.4,
          fill: true,
        },
        {
          label: '❌ Terminated',
          data: sortedDates.map(date => dailyStats[date].terminated),
          borderColor: colors.errorColor,
          backgroundColor: colors.errorColor + '20',
          tension: 0.4,
          fill: true,
        },
        {
          label: '📊 Total Responses',
          data: sortedDates.map(date => dailyStats[date].total),
          borderColor: colors.infoColor,
          backgroundColor: colors.infoColor + '20',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getChartOptions = () => {
    const colors = getChartColors();
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '600'
            },
            color: '#374151'
          }
        },
        title: {
          display: true,
          text: '📈 Daily Response Trends',
          font: {
            size: 16,
            weight: '700'
          },
          color: '#374151'
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 11
            },
            color: '#6b7280'
          },
          grid: {
            color: colors.borderColor
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            color: '#6b7280'
          },
          grid: {
            color: colors.borderColor
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const countryStats = getCountryStats();

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          
          <h1 className="card-title" style={{ margin: 0 }}>
            📊 {project.projectCode}
          </h1>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>
            {project.projectDescription || 'No description available'}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
  gap: '15px', 
  marginBottom: '30px'
}}>
  {[
    {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.3)',
      label: '✅ Total Completed',
      value: getStatusCount('completed')
    },
    {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadow: 'rgba(239, 68, 68, 0.3)',
      label: '❌ Total Terminated',
      value: getStatusCount('terminated')
    },
    {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.3)',
      label: '⏳ In Survey',
      value: getStatusCount('in-progress')
    },
    {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      shadow: 'rgba(59, 130, 246, 0.3)',
      label: '📊 Total Responses',
      value: respondents.length
    }
  ].map((item, idx) => (
    <div
      key={idx}
      style={{
        background: item.bg,
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: `0 6px 15px ${item.shadow}`,
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '5px' }}>
        {item.value}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>{item.label}</div>
    </div>
  ))}
</div>


      {/* Chart */}
      <div className="card chart-container" style={{ marginBottom: '30px' }}>
        <div style={{ height: '300px' }}>
          <Line data={getChartData()} options={getChartOptions()} />
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          marginBottom: '25px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          🌍 Status by Country
        </h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>🌍 Country</th>
                <th style={{ textAlign: 'center', padding: '15px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>✅ Completed</th>
                <th style={{ textAlign: 'center', padding: '15px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>❌ Terminated</th>
                <th style={{ textAlign: 'center', padding: '15px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>⏳ In Survey</th>
                <th style={{ textAlign: 'center', padding: '15px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>📊 Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(countryStats).map(([country, stats]) => (
                <tr key={country}>
                  <td style={{ padding: '15px', fontSize: '14px' }}><strong>{country}</strong></td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: '600', padding: '15px', fontSize: '15px' }}>
                    {stats.completed}
                  </td>
                  <td style={{ textAlign: 'center', color: '#ef4444', fontWeight: '600', padding: '15px', fontSize: '15px' }}>
                    {stats.terminated}
                  </td>
                  <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: '600', padding: '15px', fontSize: '15px' }}>
                    {stats.inProgress}
                  </td>
                  <td style={{ textAlign: 'center', color: '#3b82f6', fontWeight: '700', padding: '15px', fontSize: '15px' }}>
                    {stats.completed + stats.terminated + stats.inProgress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {Object.keys(countryStats).length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌍</div>
            <p>No country data available</p>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="card">
        <h3 style={{ 
          marginBottom: '25px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          ℹ️ Project Information
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
            borderRadius: '10px',
            border: '1px solid #bae6fd'
          }}>
            <strong style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 Description:
            </strong>
            <p style={{ marginTop: '8px', color: '#374151', lineHeight: '1.5' }}>
              {project.projectDescription || 'No description provided'}
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
            borderRadius: '10px',
            border: '1px solid #bbf7d0'
          }}>
            <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌍 Countries:
            </strong>
            <p style={{ marginTop: '8px', color: '#374151' }}>
              {Object.keys(project.countryLanguages || {}).join(', ') || 'None specified'}
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', 
            borderRadius: '10px',
            border: '1px solid #fed7aa'
          }}>
            <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗣️ Languages:
            </strong>
            <p style={{ marginTop: '8px', color: '#374151' }}>
              {Object.values(project.countryLanguages || {}).flat().filter((lang, index, arr) => arr.indexOf(lang) === index).join(', ') || 'None specified'}
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', 
            borderRadius: '10px',
            border: '1px solid #f9a8d4'
          }}>
            <strong style={{ color: '#be185d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ Min Duration:
            </strong>
            <p style={{ marginTop: '8px', color: '#374151' }}>
              {project.minDurationSec ? `${project.minDurationSec} seconds` : 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;