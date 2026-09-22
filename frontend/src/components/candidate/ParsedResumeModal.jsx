import React from 'react';
import './ParsedResumeModal.css';

const ParsedResumeModal = ({ parsedData, onClose }) => {
    if (!parsedData) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content premium-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Extracted Resume Information</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-group">
                        <label>Name</label>
                        <p>{parsedData.name || 'Not found'}</p>
                    </div>
                    <div className="info-group">
                        <label>Email</label>
                        <p>{parsedData.email || 'Not found'}</p>
                    </div>
                    <div className="info-group">
                        <label>Phone</label>
                        <p>{parsedData.phone || 'Not found'}</p>
                    </div>
                    
                    {['education', 'skills', 'experience', 'projects', 'languages', 'certifications'].map(key => (
                        parsedData[key] && (
                            <div className="info-group" key={key}>
                                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <pre className="formatted-text">{parsedData[key]}</pre>
                            </div>
                        )
                    ))}
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ParsedResumeModal;
