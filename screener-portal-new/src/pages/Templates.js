import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import QuestionBuilder from '../components/QuestionBuilder';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState(['Demographics', 'Screening', 'Satisfaction', 'Behavior', 'Custom']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'Custom'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (questionData) => {
    if (!templateForm.name) {
      alert('Please enter template name');
      return;
    }

    try {
      await axios.post(`${config.API_BASE_URL}/templates`, {
        ...templateForm,
        questionTemplate: questionData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowBuilder(false);
      setTemplateForm({ name: '', description: '', category: 'Custom' });
      fetchTemplates();
      alert('✅ Template created successfully!');
    } catch (err) {
      console.error('Error saving template:', err);
      alert('❌ Failed to save template');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    
    try {
      await axios.delete(`${config.API_BASE_URL}/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in" >
      <div className="mb-8"style={{ padding: '20px' }}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📋 Question Templates</h1>
          <p className="text-gray-400">Create reusable question templates for faster survey building</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid #533483',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                width: '250px'
              }}
            />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: 'auto', minWidth: '120px', padding: '6px 8px', fontSize: '13px' }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="text-sm text-gray-400" style={{ fontSize: '12px' }}>
              {filteredTemplates.length} templates
            </div>
          </div>
          <button 
            onClick={() => setShowBuilder(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            ✨ Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map(template => (
          <div key={template._id} className="card hover:border-blue-500 transition-all duration-200" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', minHeight: 'auto' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap' }}>
                {template.name}
              </span>
              <span style={{ padding: '2px 4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '3px', fontSize: '9px', whiteSpace: 'nowrap' }}>
                {template.category}
              </span>
              <span style={{ padding: '2px 4px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: '3px', fontSize: '9px', whiteSpace: 'nowrap' }}>
                {template.questionTemplate.questionType}
              </span>
              <span style={{ color: '#d1d5db', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {template.description || 'No description'}
              </span>
              <span style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {Object.keys(template.questionTemplate.translations || {}).length} languages
              </span>
              <span style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {template.questionTemplate.rows?.length || 0} options
              </span>
            </div>
            <button
              onClick={() => deleteTemplate(template._id)}
              style={{
                padding: '4px 6px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                flexShrink: 0
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {selectedCategory === 'all' ? 'No templates yet' : `No ${selectedCategory} templates`}
          </h3>
          <p className="text-gray-400 mb-6">Create your first template to speed up survey creation</p>
          <button 
            onClick={() => setShowBuilder(true)}
            className="btn btn-primary"
          >
            Create First Template
          </button>
        </div>
      )}

      {/* Template Builder Modal */}
      {showBuilder && (
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
            background: 'rgba(26, 26, 46, 0.95)',
            border: '1px solid #533483',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #533483'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: 'white', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✨</span> Create Question Template
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Age Screening Question"
                    style={{
                      width: '100%',
                      padding: '10px',
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
                    Category
                  </label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
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
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'white' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid #533483',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ padding: '24px', marginTop: '20px' }}>
              <QuestionBuilder
                onSave={handleSaveTemplate}
                onCancel={() => setShowBuilder(false)}
                projectLanguages={['en-US']}
                projectCountries={[]}
                questionIndex={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;