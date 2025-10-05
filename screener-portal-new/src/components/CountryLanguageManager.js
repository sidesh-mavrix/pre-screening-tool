import React, { useState } from 'react';
import { LANGUAGES } from '../utils/languages';

const CountryLanguageManager = ({ 
  countryLanguages = {}, 
  onChange,
  placeholder = "Enter country code (e.g., US, GB, IN)..."
}) => {
  const [newCountry, setNewCountry] = useState('');

  const addCountry = () => {
    if (newCountry.trim() && !countryLanguages[newCountry.trim().toUpperCase()]) {
      const updatedMapping = {
        ...countryLanguages,
        [newCountry.trim().toUpperCase()]: ['en-US'] // Default to English
      };
      onChange(updatedMapping);
      setNewCountry('');
    }
  };

  const removeCountry = (country) => {
    const updatedMapping = { ...countryLanguages };
    delete updatedMapping[country];
    onChange(updatedMapping);
  };

  const addLanguageToCountry = (country, language) => {
    if (!countryLanguages[country].includes(language)) {
      const updatedMapping = {
        ...countryLanguages,
        [country]: [...countryLanguages[country], language]
      };
      onChange(updatedMapping);
    }
  };

  const removeLanguageFromCountry = (country, language) => {
    if (countryLanguages[country].length > 1) { // Keep at least one language
      const updatedMapping = {
        ...countryLanguages,
        [country]: countryLanguages[country].filter(lang => lang !== language)
      };
      onChange(updatedMapping);
    }
  };

  const getLanguageName = (code) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Add New Country */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && addCountry()}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}
        />
        <button
          onClick={addCountry}
          disabled={!newCountry.trim()}
          style={{
            padding: '8px 16px',
            background: newCountry.trim() 
              ? 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)'
              : 'var(--gray-400)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: newCountry.trim() ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          ➕ Add Country
        </button>
      </div>

      {/* Country-Language Mapping */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(countryLanguages).map(([country, languages]) => (
          <div
            key={country}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            {/* Country Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'var(--maverick-primary)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {country}
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px' 
                }}>
                  {languages.length} language{languages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => removeCountry(country)}
                style={{
                  padding: '4px 8px',
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                🗑️ Remove
              </button>
            </div>

            {/* Languages */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px',
                marginBottom: '8px'
              }}>
                {languages.map(lang => (
                  <span
                    key={lang}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--text-primary)',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '500',
                      border: '1px solid var(--maverick-primary)'
                    }}
                  >
                    {getLanguageName(lang)}
                    {languages.length > 1 && (
                      <button
                        onClick={() => removeLanguageFromCountry(country, lang)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '0',
                          marginLeft: '4px',
                          opacity: 0.7
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Add Language */}
            <div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addLanguageToCountry(country, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  padding: '6px 8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  minWidth: '150px'
                }}
              >
                <option value="">➕ Add Language</option>
                {LANGUAGES
                  .filter(lang => !languages.includes(lang.code))
                  .map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(countryLanguages).length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌍</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            No countries added yet
          </h3>
          <p style={{ fontSize: '14px' }}>
            Add countries and their supported languages for your survey
          </p>
        </div>
      )}
    </div>
  );
};

export default CountryLanguageManager;