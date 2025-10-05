import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ 
  options = [], 
  selected = [], 
  onChange, 
  placeholder = "Select options...",
  displayKey = "name",
  valueKey = "code"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option) => {
    const value = option[valueKey];
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const getSelectedDisplay = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt[valueKey] === selected[0]);
      return option ? `${option.flag || ''} ${option[displayKey]}` : selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <div style={{ position: 'relative', zIndex: isOpen ? 9999 : 'auto' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid #533483',
          borderRadius: '6px',
          color: 'white',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{getSelectedDisplay()}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'relative',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #533483',
          borderRadius: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10000,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          marginTop: '4px'
        }}>
          <div style={{ padding: '8px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%',
                padding: '6px 8px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid #374151',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
          
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {filteredOptions.map(option => (
              <div
                key={option[valueKey]}
                onClick={() => handleToggleOption(option)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: selected.includes(option[valueKey]) ? '#10b981' : 'white',
                  background: selected.includes(option[valueKey]) ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!selected.includes(option[valueKey])) {
                    e.target.style.background = 'rgba(83, 52, 131, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected.includes(option[valueKey])) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option[valueKey])}
                  onChange={() => {}}
                  style={{ pointerEvents: 'none' }}
                />
                <span>{option.flag || ''} {option[displayKey]}</span>
              </div>
            ))}
            
            {filteredOptions.length === 0 && (
              <div style={{ 
                padding: '12px 16px', 
                color: '#9ca3af', 
                fontSize: '12px',
                textAlign: 'center'
              }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px', 
          marginTop: '8px' 
        }}>
          {selected.slice(0, 5).map(value => {
            const option = options.find(opt => opt[valueKey] === value);
            return option ? (
              <span key={value} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: 'rgba(83, 52, 131, 0.2)',
                color: '#e0aaff',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                border: '1px solid rgba(83, 52, 131, 0.3)'
              }}>
                {option.flag || ''} {option[displayKey]}
                <button
                  onClick={() => handleToggleOption(option)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '0',
                    marginLeft: '4px',
                    opacity: 0.7
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
          {selected.length > 5 && (
            <span style={{
              padding: '4px 8px',
              background: 'rgba(83, 52, 131, 0.2)',
              color: '#e0aaff',
              borderRadius: '16px',
              fontSize: '12px'
            }}>
              +{selected.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;