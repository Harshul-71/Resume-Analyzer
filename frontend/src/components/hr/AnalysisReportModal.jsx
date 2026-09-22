import React from 'react';
import ReportDownloadButton from '../reports/ReportDownloadButton';
import './AnalysisReportModal.css';

const CircularProgress = ({ score, label, color }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const safeScore = Math.min(100, Math.max(0, score || 0));
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;

    return (
        <div className="circular-progress-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#edf2f7" strokeWidth="8" />
                <circle 
                    cx="50" cy="50" r={radius} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="8" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="progress-text">
                <span className="score">{Math.round(safeScore)}%</span>
            </div>
            <div className="progress-label">{label}</div>
        </div>
    );
};

const AnalysisReportModal = ({ analysis, onClose }) => {
    if (!analysis) return null;

    const candDetails = analysis.candidate_details || {};
    const appId = analysis.application;
    const candidateName = candDetails.name || 'Candidate';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content report-modal premium-card" onClick={e => e.stopPropagation()}>
                <div className="report-header">
                    <div className="header-content">
                        <h2>AI Resume & ATS Report</h2>
                        <div className="d-flex align-items-center gap-3">
                            <span className="candidate-rank">Ranking Score: <strong>{analysis.candidate_ranking || 0}/100</strong></span>
                            <ReportDownloadButton 
                                applicationId={appId} 
                                candidateName={candidateName} 
                                buttonText="Download PDF Report"
                            />
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Close">&times;</button>
                </div>
                
                <div className="report-body">
                    {/* Candidate Details Section */}
                    <div className="candidate-details-card">
                        <h3>Candidate Details</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Name:</span>
                                <span className="detail-val">{candDetails.name || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-val">{candDetails.email || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-val">{candDetails.phone || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Position:</span>
                                <span className="detail-val">{candDetails.job_title || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className="detail-val badge-status">{candDetails.status || 'Pending'}</span>
                            </div>
                            {candDetails.applied_at && (
                                <div className="detail-item">
                                    <span className="detail-label">Applied Date:</span>
                                    <span className="detail-val">{candDetails.applied_at}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Resume Summary Section */}
                    <div className="summary-section">
                        <h3>AI Resume Summary</h3>
                        <p>{analysis.summary || 'No summary generated yet.'}</p>
                    </div>

                    {/* ATS Score & Breakdown Section */}
                    <div className="scores-section">
                        <h3>ATS Compatibility & Match Scores</h3>
                        <div className="scores-grid">
                            <CircularProgress score={analysis.ats_score} label="ATS Score" color="#2563eb" />
                            <CircularProgress score={analysis.resume_score} label="Overall Match" color="#10b981" />
                            <CircularProgress score={analysis.skill_score} label="Skills Match" color="#f59e0b" />
                            <CircularProgress score={analysis.experience_score} label="Experience" color="#8b5cf6" />
                        </div>
                    </div>

                    {/* Skills Breakdown: Matching vs Missing Skills */}
                    <div className="skills-comparison">
                        <div className="skills-box matching">
                            <h3>Matching Skills</h3>
                            <div className="pill-container">
                                {analysis.matching_skills?.length > 0 ? (
                                    analysis.matching_skills.map((skill, i) => <span key={i} className="skill-pill match">{skill}</span>)
                                ) : <p className="no-items">No matching skills identified.</p>}
                            </div>
                        </div>
                        <div className="skills-box missing">
                            <h3>Missing Skills</h3>
                            <div className="pill-container">
                                {analysis.missing_skills?.length > 0 ? (
                                    analysis.missing_skills.map((skill, i) => <span key={i} className="skill-pill miss">{skill}</span>)
                                ) : <p className="no-items">All required skills present!</p>}
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions Section */}
                    <div className="suggestions-section">
                        <h3>AI Actionable Suggestions</h3>
                        {analysis.suggestions?.length > 0 ? (
                            <ul>
                                {analysis.suggestions.map((sug, i) => (
                                    <li key={i}>{sug}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-items">No specific suggestions at this time.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisReportModal;
