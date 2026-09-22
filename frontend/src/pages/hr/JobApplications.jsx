import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../../services/api';
import AnalysisReportModal from '../../components/hr/AnalysisReportModal';
import ReportDownloadButton from '../../components/reports/ReportDownloadButton';
import './JobApplications.css';

// ── constants ─────────────────────────────────────────────────────────────────

// Status options HR can set manually (Interview Scheduled is set automatically)
const HR_STATUS_OPTIONS = ['Pending', 'Shortlisted', 'Selected', 'Rejected'];

const STATUS_BADGE_CLASS = {
    'Pending':             'status-pending',
    'Shortlisted':         'status-shortlisted',
    'Interview Scheduled': 'status-interview',
    'Selected':            'status-selected',
    'Rejected':            'status-rejected',
};

const EMPTY_INTERVIEW = {
    interview_date: '',
    interview_time: '',
    interview_mode: '',
    location: '',
    meeting_link: '',
    interviewer_name: '',
    notes: '',
};

// ── helper: server-time-based visibility check ────────────────────────────────

/**
 * Returns true when server UTC time is at least 30 minutes after the
 * scheduled interview start.
 *
 * interview_date ("YYYY-MM-DD") and interview_time ("HH:MM" or "HH:MM:SS")
 * are wall-clock values in the HR schedule timezone (same as backend
 * INTERVIEW_SCHEDULE_TZ).  serverNow is parsed from the UTC "...Z" string
 * returned by ServerTimeView.
 *
 * @param {string} interviewDate  "YYYY-MM-DD"
 * @param {string} interviewTime  "HH:MM" or "HH:MM:SS"
 * @param {Date}   serverNow      JS Date parsed from server_time
 * @param {number} tzOffsetMin    UTC offset in minutes for schedule timezone
 */
const canCompleteInterview = (interviewDate, interviewTime, serverNow, tzOffsetMin) => {
    if (!interviewDate || !interviewTime || !serverNow || tzOffsetMin == null) return false;

    const [year, month, day] = interviewDate.split('-').map(Number);
    const [hh, mm] = interviewTime.split(':').map(Number);

    // Convert wall-clock schedule time to UTC, then add 30 minutes.
    const interviewUtcMs = Date.UTC(year, month - 1, day, hh, mm) - tzOffsetMin * 60 * 1000;
    const thresholdUtcMs = interviewUtcMs + 30 * 60 * 1000;

    return serverNow.getTime() >= thresholdUtcMs;
};

// ── component ─────────────────────────────────────────────────────────────────

const JobApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [applications, setApplications]     = useState([]);
    const [loading, setLoading]               = useState(true);
    const [runningAnalysis, setRunningAnalysis] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    // Server time — fetched once on mount, refreshed every 60 s so the
    // Complete Interview button appears automatically when the threshold is reached
    const [serverNow, setServerNow] = useState(null);
    const [scheduleTzOffsetMin, setScheduleTzOffsetMin] = useState(null);

    // Schedule / Edit Interview modal state (unchanged)
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [interviewMode, setInterviewMode]           = useState('create');
    const [activeAppId, setActiveAppId]               = useState(null);
    const [interviewForm, setInterviewForm]           = useState(EMPTY_INTERVIEW);
    const [interviewErrors, setInterviewErrors]       = useState({});
    const [interviewSaving, setInterviewSaving]       = useState(false);
    const [interviewApiError, setInterviewApiError]   = useState('');

    // Complete Interview modal state
    const [showCompleteModal, setShowCompleteModal]   = useState(false);
    const [completeAppId, setCompleteAppId]           = useState(null);
    const [finalResult, setFinalResult]               = useState('');
    const [completeSaving, setCompleteSaving]         = useState(false);
    const [completeApiError, setCompleteApiError]     = useState('');

    // ── server time ───────────────────────────────────────────────────────
    const fetchServerTime = async () => {
        try {
            const res = await api.get('applications/server-time/');
            // Backend returns UTC server time plus schedule timezone metadata.
            setServerNow(new Date(res.data.server_time));
            if (res.data.schedule_utc_offset_minutes != null) {
                setScheduleTzOffsetMin(res.data.schedule_utc_offset_minutes);
            }
        } catch {
            // Fallback: use client time converted to a UTC-equivalent Date.
            // The backend still enforces the real check on submit.
            setServerNow(new Date());
            setScheduleTzOffsetMin(-new Date().getTimezoneOffset());
        }
    };

    useEffect(() => {
        fetchServerTime();
        const timer = setInterval(fetchServerTime, 60_000);
        return () => clearInterval(timer);
    }, []);

    // ── applications ──────────────────────────────────────────────────────
    useEffect(() => {
        fetchApplications();
    }, [id]);

    const fetchApplications = async () => {
        try {
            const res = await api.get(`applications/hr/job/${id}/`);
            const data = res.data?.results ?? res.data;
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── AI analysis (unchanged) ───────────────────────────────────────────
    const runAnalysis = async (appId) => {
        setRunningAnalysis(appId);
        try {
            const res = await api.post(`reports/${appId}/generate/`);
            setSelectedAnalysis(res.data);
        } catch {
            try {
                await api.post(`analysis/run/${appId}/`);
                const reportRes = await api.get(`reports/${appId}/`);
                setSelectedAnalysis(reportRes.data);
            } catch {
                alert('Failed to run analysis');
            }
        } finally {
            setRunningAnalysis(null);
        }
    };

    const viewAnalysis = async (appId) => {
        try {
            const res = await api.get(`reports/${appId}/`);
            setSelectedAnalysis(res.data);
        } catch {
            try {
                const res = await api.get(`analysis/report/${appId}/`);
                setSelectedAnalysis(res.data);
            } catch {
                alert('No analysis report found. Please run the AI analysis first.');
            }
        }
    };

    // ── status dropdown (unchanged) ───────────────────────────────────────
    const updateStatus = async (appId, newStatus) => {
        try {
            await api.patch(`applications/hr/status/${appId}/`, { status: newStatus });
            fetchApplications();
        } catch {
            alert('Failed to update status');
        }
    };

    // ── schedule / edit interview (unchanged) ─────────────────────────────
    const openScheduleModal = (app) => {
        setInterviewMode('create');
        setActiveAppId(app.id);
        setInterviewForm(EMPTY_INTERVIEW);
        setInterviewErrors({});
        setInterviewApiError('');
        setShowInterviewModal(true);
    };

    const openEditModal = (app) => {
        const s = app.interview_schedule;
        setInterviewMode('edit');
        setActiveAppId(app.id);
        setInterviewForm({
            interview_date:   s.interview_date,
            interview_time:   s.interview_time,
            interview_mode:   s.interview_mode,
            location:         s.location     || '',
            meeting_link:     s.meeting_link || '',
            interviewer_name: s.interviewer_name,
            notes:            s.notes        || '',
        });
        setInterviewErrors({});
        setInterviewApiError('');
        setShowInterviewModal(true);
    };

    const closeInterviewModal = () => {
        setShowInterviewModal(false);
        setActiveAppId(null);
        setInterviewErrors({});
        setInterviewApiError('');
    };

    const handleInterviewFieldChange = (field, value) => {
        setInterviewForm(prev => ({ ...prev, [field]: value }));
        setInterviewErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateInterviewForm = () => {
        const errors = {};
        const today  = new Date().toISOString().split('T')[0];

        if (!interviewForm.interview_date) {
            errors.interview_date = 'Interview date is required.';
        } else if (interviewForm.interview_date < today) {
            errors.interview_date = 'Interview date cannot be in the past.';
        }
        if (!interviewForm.interview_time) {
            errors.interview_time = 'Interview time is required.';
        }
        if (!interviewForm.interview_mode) {
            errors.interview_mode = 'Interview mode is required.';
        }
        if (interviewForm.interview_mode === 'Online' && !interviewForm.meeting_link.trim()) {
            errors.meeting_link = 'Meeting link is required for online interviews.';
        }
        if (interviewForm.interview_mode === 'Offline' && !interviewForm.location.trim()) {
            errors.location = 'Location is required for offline interviews.';
        }
        if (!interviewForm.interviewer_name.trim()) {
            errors.interviewer_name = 'Interviewer name is required.';
        }
        return errors;
    };

    const handleInterviewSubmit = async (e) => {
        e.preventDefault();
        const errors = validateInterviewForm();
        if (Object.keys(errors).length > 0) { setInterviewErrors(errors); return; }

        setInterviewSaving(true);
        setInterviewApiError('');
        try {
            if (interviewMode === 'create') {
                await api.post(`applications/hr/interview/schedule/${activeAppId}/`, interviewForm);
            } else {
                await api.put(`applications/hr/interview/update/${activeAppId}/`, interviewForm);
            }
            closeInterviewModal();
            fetchApplications();
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const serverErrors = {};
                Object.entries(data).forEach(([key, val]) => {
                    serverErrors[key] = Array.isArray(val) ? val[0] : val;
                });
                if (serverErrors.non_field_errors || serverErrors.detail || serverErrors.error) {
                    setInterviewApiError(serverErrors.non_field_errors || serverErrors.detail || serverErrors.error);
                } else {
                    setInterviewErrors(serverErrors);
                }
            } else {
                setInterviewApiError('Failed to save interview. Please try again.');
            }
        } finally {
            setInterviewSaving(false);
        }
    };

    const handleCancelInterview = async (appId) => {
        if (!window.confirm('Cancel this interview? The candidate status will revert to Shortlisted.')) return;
        try {
            await api.delete(`applications/hr/interview/cancel/${appId}/`);
            fetchApplications();
        } catch {
            alert('Failed to cancel interview.');
        }
    };

    // ── complete interview ────────────────────────────────────────────────
    const openCompleteModal = (appId) => {
        setCompleteAppId(appId);
        setFinalResult('');
        setCompleteApiError('');
        setShowCompleteModal(true);
    };

    const closeCompleteModal = () => {
        setShowCompleteModal(false);
        setCompleteAppId(null);
        setFinalResult('');
        setCompleteApiError('');
    };

    const handleCompleteInterview = async () => {
        if (!finalResult) { setCompleteApiError('Please select a final result.'); return; }
        setCompleteSaving(true);
        setCompleteApiError('');
        try {
            await api.post(
                `applications/hr/interview/complete/${completeAppId}/`,
                { final_result: finalResult }
            );
            closeCompleteModal();
            fetchApplications();
        } catch (err) {
            setCompleteApiError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                'Failed to complete interview. Please try again.'
            );
        } finally {
            setCompleteSaving(false);
        }
    };

    // ── render ────────────────────────────────────────────────────────────
    if (loading) return <div>Loading...</div>;

    return (
        <div className="hr-applications-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Job Applicants</h2>
                <button className="btn-secondary" onClick={() => navigate('/hr/jobs')}>Back to Jobs</button>
            </div>

            <div className="applicants-grid">
                {applications.length === 0 ? (
                    <p>No applicants yet.</p>
                ) : (
                    applications.map(app => {
                        const isScheduled  = app.status === 'Interview Scheduled';
                        const isFinal      = app.status === 'Selected' || app.status === 'Rejected';
                        const schedule     = app.interview_schedule;
                        const canComplete  = isScheduled && schedule
                            ? (
                                schedule.can_complete_interview === true ||
                                canCompleteInterview(
                                    schedule.interview_date,
                                    schedule.interview_time,
                                    serverNow,
                                    scheduleTzOffsetMin
                                )
                              )
                            : false;

                        return (
                            <div key={app.id} className="premium-card applicant-card">

                                {/* ── Header ── */}
                                <div className="applicant-header">
                                    <h3>{app.candidate_email || app.resume_details?.candidate_email || 'Unknown Candidate'}</h3>
                                    <span className={`status-pill ${STATUS_BADGE_CLASS[app.status] || ''}`}>
                                        {app.status}
                                    </span>
                                </div>

                                {/* ── Meta ── */}
                                <div className="applicant-body">
                                    <p><strong>Applied On:</strong> {new Date(app.applied_at).toLocaleDateString()}</p>
                                    {app.resume_details?.file_path && (
                                        <a href={app.resume_details.file_path} target="_blank" rel="noreferrer" className="btn-link">
                                            View Resume
                                        </a>
                                    )}
                                </div>

                                {/* ── Interview details panel ── */}
                                {isScheduled && schedule && (
                                    <div className="interview-details mt-2 mb-2 p-2"
                                         style={{ background: '#f0f7ff', borderRadius: 6, fontSize: '0.88rem' }}>
                                        <strong>Interview Details</strong>
                                        <div className="mt-1">
                                            <span>📅 {schedule.interview_date}</span>
                                            {' · '}
                                            <span>🕐 {schedule.interview_time}</span>
                                            {' · '}
                                            <span>📍 {schedule.interview_mode}</span>
                                        </div>
                                        {schedule.interview_mode === 'Online' && schedule.meeting_link && (
                                            <div><a href={schedule.meeting_link} target="_blank" rel="noreferrer">Join Link</a></div>
                                        )}
                                        {schedule.interview_mode === 'Offline' && schedule.location && (
                                            <div>📌 {schedule.location}</div>
                                        )}
                                        <div>👤 {schedule.interviewer_name}</div>
                                        {schedule.notes && (
                                            <div className="text-muted">📝 {schedule.notes}</div>
                                        )}

                                        {/* ── Complete Interview: notice OR button ── */}
                                        {canComplete ? (
                                            <button
                                                className="btn-small success mt-2"
                                                style={{ width: '100%' }}
                                                onClick={() => openCompleteModal(app.id)}
                                            >
                                                ✅ Complete Interview
                                            </button>
                                        ) : (
                                            <div className="mt-2 p-2" style={{
                                                background: '#fff8e1',
                                                border: '1px solid #ffe082',
                                                borderRadius: 4,
                                                fontSize: '0.82rem',
                                                color: '#795548',
                                            }}>
                                                ⏳ Interview is scheduled. The interview must be completed before the final result can be submitted.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Recruitment status dropdown ── */}
                                <div className="status-actions mt-3 mb-2 d-flex gap-2 align-items-center flex-wrap">
                                    <label className="mb-0 me-1" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status:</label>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto', minWidth: 140 }}
                                        value={app.status}
                                        disabled={isScheduled || isFinal}
                                        onChange={e => updateStatus(app.id, e.target.value)}
                                    >
                                        {isFinal ? (
                                            <option value={app.status}>{app.status} (Final)</option>
                                        ) : isScheduled ? (
                                            <option value="Interview Scheduled">Interview Scheduled</option>
                                        ) : (
                                            HR_STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))
                                        )}
                                    </select>

                                    {/* Schedule Interview — only for Shortlisted */}
                                    {!isFinal && app.status === 'Shortlisted' && (
                                        <button className="btn-small primary" onClick={() => openScheduleModal(app)}>
                                            Schedule Interview
                                        </button>
                                    )}

                                    {/* Edit / Cancel — only when scheduled AND not yet completable */}
                                    {!isFinal && isScheduled && !canComplete && (
                                        <>
                                            <button className="btn-small warning" onClick={() => openEditModal(app)}>
                                                Edit Interview
                                            </button>
                                            <button className="btn-small danger" onClick={() => handleCancelInterview(app.id)}>
                                                Cancel Interview
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* ── AI analysis actions (unchanged) ── */}
                                <div className="applicant-actions mt-2 d-flex gap-2 flex-wrap">
                                    <button
                                        className="btn-ai"
                                        disabled={runningAnalysis === app.id}
                                        onClick={() => runAnalysis(app.id)}
                                    >
                                        {runningAnalysis === app.id ? 'Analyzing...' : 'Run AI Analysis'}
                                    </button>
                                    <button className="btn-outline" onClick={() => viewAnalysis(app.id)}>
                                        View Report
                                    </button>
                                    <ReportDownloadButton
                                        applicationId={app.id}
                                        candidateName={(app.candidate_email || app.resume_details?.candidate_email || '').split('@')[0]}
                                        buttonText="PDF"
                                        variant="outline"
                                    />
                                </div>

                            </div>
                        );
                    })
                )}
            </div>

            {/* ── AI Analysis modal (unchanged) ── */}
            {selectedAnalysis && (
                <AnalysisReportModal
                    analysis={selectedAnalysis}
                    onClose={() => setSelectedAnalysis(null)}
                />
            )}

            {/* ── Schedule / Edit Interview Modal (unchanged) ── */}
            <Modal show={showInterviewModal} onHide={closeInterviewModal} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {interviewMode === 'create' ? 'Schedule Interview' : 'Edit Interview'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {interviewApiError && <Alert variant="danger">{interviewApiError}</Alert>}
                    <Form onSubmit={handleInterviewSubmit} noValidate>
                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Interview Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="date"
                                    value={interviewForm.interview_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    isInvalid={!!interviewErrors.interview_date}
                                    onChange={e => handleInterviewFieldChange('interview_date', e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">{interviewErrors.interview_date}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Interview Time <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="time"
                                    value={interviewForm.interview_time}
                                    isInvalid={!!interviewErrors.interview_time}
                                    onChange={e => handleInterviewFieldChange('interview_time', e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">{interviewErrors.interview_time}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Interview Mode <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={interviewForm.interview_mode}
                                    isInvalid={!!interviewErrors.interview_mode}
                                    onChange={e => handleInterviewFieldChange('interview_mode', e.target.value)}
                                >
                                    <option value="">-- Select Mode --</option>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{interviewErrors.interview_mode}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Interviewer Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. John Smith"
                                    value={interviewForm.interviewer_name}
                                    isInvalid={!!interviewErrors.interviewer_name}
                                    onChange={e => handleInterviewFieldChange('interviewer_name', e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">{interviewErrors.interviewer_name}</Form.Control.Feedback>
                            </Form.Group>

                            {interviewForm.interview_mode === 'Online' && (
                                <Form.Group className="col-12 mb-3">
                                    <Form.Label>Meeting Link <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        value={interviewForm.meeting_link}
                                        isInvalid={!!interviewErrors.meeting_link}
                                        onChange={e => handleInterviewFieldChange('meeting_link', e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{interviewErrors.meeting_link}</Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {interviewForm.interview_mode === 'Offline' && (
                                <Form.Group className="col-12 mb-3">
                                    <Form.Label>Interview Location <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Office 3B, Main Street"
                                        value={interviewForm.location}
                                        isInvalid={!!interviewErrors.location}
                                        onChange={e => handleInterviewFieldChange('location', e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{interviewErrors.location}</Form.Control.Feedback>
                                </Form.Group>
                            )}

                            <Form.Group className="col-12 mb-3">
                                <Form.Label>Notes <span className="text-muted">(Optional)</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Any additional instructions for the candidate..."
                                    value={interviewForm.notes}
                                    onChange={e => handleInterviewFieldChange('notes', e.target.value)}
                                />
                            </Form.Group>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <Button variant="secondary" onClick={closeInterviewModal} disabled={interviewSaving}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={interviewSaving}>
                                {interviewSaving
                                    ? 'Saving...'
                                    : interviewMode === 'create' ? 'Schedule Interview' : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ── Complete Interview Modal ── */}
            <Modal show={showCompleteModal} onHide={closeCompleteModal} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Complete Interview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {completeApiError && <Alert variant="danger">{completeApiError}</Alert>}
                    <p className="mb-3">Select the final result for this candidate:</p>
                    <div className="d-flex gap-4">
                        <Form.Check
                            type="radio"
                            id="result-selected"
                            label="✅ Selected"
                            name="finalResult"
                            value="Selected"
                            checked={finalResult === 'Selected'}
                            onChange={e => { setFinalResult(e.target.value); setCompleteApiError(''); }}
                            className="fw-semibold"
                        />
                        <Form.Check
                            type="radio"
                            id="result-rejected"
                            label="❌ Rejected"
                            name="finalResult"
                            value="Rejected"
                            checked={finalResult === 'Rejected'}
                            onChange={e => { setFinalResult(e.target.value); setCompleteApiError(''); }}
                            className="fw-semibold"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeCompleteModal} disabled={completeSaving}>
                        Cancel
                    </Button>
                    <Button
                        variant={
                            finalResult === 'Selected' ? 'success' :
                            finalResult === 'Rejected' ? 'danger'  : 'primary'
                        }
                        onClick={handleCompleteInterview}
                        disabled={completeSaving || !finalResult}
                    >
                        {completeSaving ? 'Saving...' : 'Submit Result'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default JobApplications;
