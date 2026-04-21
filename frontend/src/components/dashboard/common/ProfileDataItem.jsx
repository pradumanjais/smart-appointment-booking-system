import React from 'react';

const ProfileDataItem = ({ label, value, icon: Icon, editMode, onChange, type = 'text', placeholder, options = [], colSpan = 1 }) => {
  return (
    <div className="data-item-modern" style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : 'auto' }}>
      <div className="modern-icon-wrapper">
        <Icon size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
          {!editMode && value && <div className="dot-indicator"></div>}
        </div>
        {editMode ? (
          // ... (keep same logic for inputs, but wrap in better style)
          <div className="edit-input-wrapper">
            {type === 'select' ? (
              <select className="field-input-clean" value={value} onChange={onChange}>
                <option value="">Select</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : type === 'textarea' ? (
              <textarea className="field-input-clean" value={value} onChange={onChange} placeholder={placeholder} />
            ) : (
              <input type={type} className="field-input-clean" value={value} onChange={onChange} placeholder={placeholder} />
            )}
          </div>
        ) : (
          <div className="value-display-clean">{value || 'Not Specified'}</div>
        )}
      </div>
    </div>
  );
};

export default ProfileDataItem;
