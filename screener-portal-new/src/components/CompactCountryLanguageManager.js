import React, { useState } from 'react';
import { LANGUAGES } from '../utils/languages';

const CompactCountryLanguageManager = ({ countryLanguages = {}, onChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newLanguage, setNewLanguage] = useState('en-US');

  const addCountryLanguage = () => {
    if (newCountry.trim() && !countryLanguages[newCountry.trim().toUpperCase()]) {
      const updatedMapping = {
        ...countryLanguages,
        [newCountry.trim().toUpperCase()]: [newLanguage]
      };
      onChange(updatedMapping);
      setNewCountry('');
      setNewLanguage('en-US');
      setShowAddForm(false);
    }
  };

  const removeCountry = (country) => {
    const updatedMapping = { ...countryLanguages };
    delete updatedMapping[country];
    onChange(updatedMapping);
  };

  const getLanguageName = (code) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name.split(' ')[0] : code; // Get first word only
  };

  return (
    <div>
      {/* Country-Language Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {Object.entries(countryLanguages).map(([country, languages]) => (
          <div key={country} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--maverick-primary)',
            borderRadius: '16px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <span style={{ color: 'var(--text-primary)' }}>
              {country}-{getLanguageName(languages[0])}
              {languages.length > 1 && ` +${languages.length - 1}`}
            </span>
            <button
              onClick={() => removeCountry(country)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '6px',
                opacity: 0.7,
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--maverick-primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Country Code
              </label>
              <input
                type="text"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                placeholder="US, GB, IN..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Language
              </label>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addCountryLanguage}
              disabled={!newCountry.trim()}
              style={{
                padding: '6px 12px',
                background: newCountry.trim() ? 'var(--maverick-primary)' : 'var(--gray-400)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: newCountry.trim() ? 'pointer' : 'not-allowed',
                fontSize: '11px'
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '6px 8px',
                background: 'var(--gray-600)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {Object.keys(countryLanguages).length === 0 && !showAddForm && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '6px',
          border: '1px dashed var(--border-color)',
          fontSize: '12px'
        }}>
          Click + to add countries and languages
        </div>
      )}
    </div>
  );
};

export default CompactCountryLanguageManager;