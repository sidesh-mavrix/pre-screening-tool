import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const TemplateSidebar = ({ onSelectTemplate, onRemoveTemplate, projectLanguages = [] }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
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
      
      const uniqueCategories = [...new Set(res.data.map(t => t.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
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

  const handleAddTemplate = (template) => {
    const adaptedQuestion = {
      ...template.questionTemplate,
      templateId: template._id,
      templateName: template.name,
      translations: adaptTranslations(template.questionTemplate.translations)
    };
    onSelectTemplate(adaptedQuestion);
    setSelectedTemplates(prev => new Set([...prev, template._id]));
  };

  const handleRemoveTemplate = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (confirm(`Remove "${template?.name}" template? This will also remove any questions created from this template.`)) {
      setSelectedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
      // Notify parent to remove associated questions
      if (onRemoveTemplate) {
        onRemoveTemplate(templateId);
      }
    }
  };

  const adaptTranslations = (templateTranslations) => {
    const adapted = {};
    projectLanguages.forEach(lang => {
      if (templateTranslations[lang]) {
        adapted[lang] = templateTranslations[lang];
      } else if (templateTranslations['en-US']) {
        // Use English as fallback and mark for translation
        adapted[lang] = { 
          ...templateTranslations['en-US'],
          needsTranslation: true 
        };
      }
    });
    return adapted;
  };

  if (loading) {
    return (
      <div className="template-sidebar">
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)' }}>
          Loading templates...
        </div>
      </div>
    );
  }

  return (
    <div className="template-sidebar">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: 'var(--white)', 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          
        }}>
          📋 Question Templates
        </h3>
        
        <input
          type="text"
          placeholder="🔍 Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid #533483',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            marginBottom: '12px'
          }}
        />
        
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ fontSize: '12px' }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Selected Templates */}
      {selectedTemplates.size > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ✅ Selected ({selectedTemplates.size})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {templates.filter(t => selectedTemplates.has(t._id)).map(template => (
              <div key={template._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--maverick-primary)',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {template.name}
                </span>
                <button
                  onClick={() => handleRemoveTemplate(template._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '0',
                    opacity: 0.7
                  }}
                >
                  −
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {filteredTemplates.map(template => (
          <div
            key={template._id}
            className="template-item"
            style={{ position: 'relative' }}
          >
            <div style={{ marginBottom: '8px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--white)',
                marginBottom: '4px'
              }}>
                {template.name}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'var(--accent-blue)',
                marginBottom: '6px'
              }}>
                {template.category} • {template.questionTemplate.questionType}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'var(--gray-400)',
                lineHeight: '1.3'
              }}>
                {template.description || 'No description'}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--gray-500)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                {Object.keys(template.questionTemplate.translations || {}).length} languages
              </span>
              <span>
                {template.questionTemplate.rows?.length || 0} options
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedTemplates.has(template._id)) {
                  handleRemoveTemplate(template._id);
                } else {
                  handleAddTemplate(template);
                }
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: selectedTemplates.has(template._id) ? 'var(--error)' : 'var(--maverick-primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedTemplates.has(template._id) ? '−' : '+'}
            </button>
          </div>
        ))}
        
        {filteredTemplates.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: 'var(--gray-400)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontSize: '12px' }}>
              {selectedCategory === 'all' ? 'No templates available' : `No ${selectedCategory} templates`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSidebar;