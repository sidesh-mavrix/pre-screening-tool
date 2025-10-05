import React, { useState, useRef, useEffect } from 'react';

const EditableMultiSelect = ({ 
  options = [], 
  selected = [], 
  onChange, 
  placeholder = "Type to add or select...",
  displayKey = "name",
  valueKey = "code",
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option[displayKey].toLowerCase().includes(searchTerm.toLowerCase()) ||
    option[valueKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option) => {
    const value = option[valueKey];
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleAddCustom = () => {
    if (inputValue.trim() && !selected.includes(inputValue.trim())) {
      onChange([...selected, inputValue.trim()]);
      setInputValue('');
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && allowCustom && inputValue.trim()) {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleRemoveItem = (item) => {
    onChange(selected.filter(s => s !== item));
  };

  const getDisplayName = (value) => {
    const option = options.find(opt => opt[valueKey] === value);
    return option ? option[displayKey] : value;
  };

  return (
    <div style={{ position: 'relative', zIndex: isOpen ? 9999 : 'auto' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(true)}
        style={{ 
          width: '100%',
          minHeight: '45px',
          padding: '8px 12px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          cursor: 'text',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center'
        }}
      >
        {/* Selected Items */}
        {selected.map(value => (
          <span key={value} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: 'var(--text-primary)',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            border: '1px solid var(--maverick-primary)'
          }}>
            {getDisplayName(value)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(value);
              }}
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
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyPress={handleKeyPress}
          placeholder={selected.length === 0 ? placeholder : ''}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            flex: 1,
            minWidth: '120px'
          }}
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10000,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          marginTop: '4px'
        }}>
          {/* Add Custom Option */}
          {allowCustom && inputValue.trim() && !selected.includes(inputValue.trim()) && (
            <div
              onClick={handleAddCustom}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'var(--maverick-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(16, 185, 129, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span>➕</span>
              Add "{inputValue.trim()}"
            </div>
          )}
          
          {/* Options List */}
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
                  color: selected.includes(option[valueKey]) ? 'var(--maverick-primary)' : 'var(--text-primary)',
                  background: selected.includes(option[valueKey]) ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!selected.includes(option[valueKey])) {
                    e.target.style.background = 'rgba(83, 52, 131, 0.1)';
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
                <div>
                  <div style={{ fontWeight: '500' }}>{option[displayKey]}</div>
                  {option[valueKey] !== option[displayKey] && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{option[valueKey]}</div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredOptions.length === 0 && searchTerm && (
              <div style={{ 
                padding: '12px 16px', 
                color: 'var(--text-muted)', 
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {allowCustom ? `Type "${searchTerm}" and press Enter to add` : 'No options found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableMultiSelect;