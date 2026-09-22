import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ResumeBuilder.css';

const EXPERIENCE_OPTIONS = [
    'Fresher',
    '6 Months',
    '1 Year',
    '2 Years',
    '3+ Years',
];

const EMPTY_PROJECT = {
    name: '',
    tech_stack: '',
    description: '',
};

const EMPTY_CERTIFICATE = {
    name: '',
    organization: '',
    issue_date: '',
    link: '',
};

const ResumeBuilder = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [downloading, setDownloading] = useState(false);

    const [alert, setAlert]   = useState({ show: false, variant: '', message: '' });
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        full_name: '',
        candidate_email: '',
        phone: '',
        address: '',
        preferred_location: '',
        university: '',
        education_degree: '',
        graduation_year: '',
        skills: '',
        experience: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        bio: '',
        projects: [],
        certificates: [],
    });

    useEffect(() => {
        fetchBuiltResume();
    }, []);

    const fetchBuiltResume = async () => {
        try {
            const res = await api.get('resume/builder/');
            setFormData({
                full_name:          res.data.full_name          || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
                candidate_email:    res.data.candidate_email    || user?.email || '',
                phone:              res.data.phone              || '',
                address:            res.data.address            || '',
                preferred_location: res.data.preferred_location || '',
                university:         res.data.university         || '',
                education_degree:   res.data.education_degree   || '',
                graduation_year:    res.data.graduation_year    || '',
                skills:             res.data.skills             || '',
                experience:         res.data.experience         || '',
                linkedin_url:       res.data.linkedin_url       || '',
                github_url:         res.data.github_url         || '',
                portfolio_url:      res.data.portfolio_url      || '',
                bio:                res.data.bio                || '',
                projects:           Array.isArray(res.data.projects) ? res.data.projects : [],
                certificates:       Array.isArray(res.data.certificates) ? res.data.certificates : [],
            });
        } catch (err) {
            console.error('Failed to load resume builder data', err);
            setAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to load existing resume data. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ── Projects Handlers ──────────────────────────────────────────────────
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { ...EMPTY_PROJECT }]
        }));
    };

    const updateProject = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.projects];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, projects: updated };
        });
    };

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, idx) => idx !== index)
        }));
    };

    // ── Certificates Handlers ──────────────────────────────────────────────
    const addCertificate = () => {
        setFormData(prev => ({
            ...prev,
            certificates: [...prev.certificates, { ...EMPTY_CERTIFICATE }]
        }));
    };

    const updateCertificate = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.certificates];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, certificates: updated };
        });
    };

    const removeCertificate = (index) => {
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.filter((_, idx) => idx !== index)
        }));
    };

    // ── Validation ────────────────────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim())          newErrors.full_name          = 'Full Name is required';
        if (!formData.address.trim())            newErrors.address            = 'Address is required';
        if (!formData.university.trim())         newErrors.university         = 'University / College Name is required';
        if (!formData.education_degree.trim())   newErrors.education_degree   = 'Education / Degree is required';
        if (!formData.graduation_year.trim())    newErrors.graduation_year    = 'Graduation Year is required';
        if (!formData.skills.trim())             newErrors.skills             = 'Skills are required';
        if (!formData.preferred_location.trim()) newErrors.preferred_location = 'Preferred Job Location is required';

        // Validate Projects
        formData.projects.forEach((proj, idx) => {
            if (!proj.name?.trim())        newErrors[`proj_name_${idx}`] = `Project #${idx + 1}: Name is required`;
            if (!proj.tech_stack?.trim())  newErrors[`proj_tech_${idx}`] = `Project #${idx + 1}: Technologies Used is required`;
            if (!proj.description?.trim()) newErrors[`proj_desc_${idx}`] = `Project #${idx + 1}: Description is required`;
        });

        // Validate Certificates
        formData.certificates.forEach((cert, idx) => {
            if (!cert.name?.trim())         newErrors[`cert_name_${idx}`] = `Certificate #${idx + 1}: Name is required`;
            if (!cert.organization?.trim()) newErrors[`cert_org_${idx}`]  = `Certificate #${idx + 1}: Issuing Organization is required`;
            if (!cert.issue_date?.trim())   newErrors[`cert_date_${idx}`] = `Certificate #${idx + 1}: Date is required`;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setAlert({ show: false, variant: '', message: '' });

        if (!validateForm()) {
            setAlert({
                show: true,
                variant: 'danger',
                message: 'Please complete all required fields for Personal Info, Education, Skills, Projects, and Certificates.',
            });
            setActiveTab('form');
            return false;
        }

        setSaving(true);
        try {
            await api.post('resume/builder/', formData);
            setAlert({
                show: true,
                variant: 'success',
                message: 'Resume saved successfully!',
            });
            return true;
        } catch (err) {
            console.error(err);
            setAlert({
                show: true,
                variant: 'danger',
                message: err.response?.data?.error || 'Failed to save resume. Please check your entries.',
            });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = async () => {
        setAlert({ show: false, variant: '', message: '' });

        const saved = await handleSave();
        if (!saved) return;

        setDownloading(true);
        try {
            const response = await api.get('resume/builder/download-pdf/', {
                responseType: 'blob',
            });

            const rawName = formData.full_name.trim() || 'Candidate';
            const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '') || 'Candidate';
            const filename = `${cleanName}_Resume.pdf`;

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setAlert({
                show: true,
                variant: 'success',
                message: `Successfully downloaded ${filename}!`,
            });
        } catch (err) {
            console.error('PDF download error:', err);
            setAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to download PDF. Please try saving your resume first.',
            });
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 fw-semibold">Loading Resume Builder...</span>
            </div>
        );
    }

    return (
        <div className="resume-builder-container">

            {/* Header */}
            <div className="resume-builder-header">
                <h2>Resume Builder</h2>
                <p>Create, edit, preview, and download your ATS-friendly professional resume.</p>
            </div>

            {/* Alert Notification */}
            {alert.show && (
                <Alert
                    variant={alert.variant}
                    onClose={() => setAlert({ ...alert, show: false })}
                    dismissible
                >
                    {alert.message}
                </Alert>
            )}

            {/* Actions Bar & Navigation Tabs */}
            <div className="builder-actions-bar">
                <div className="tab-btn-group">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => setActiveTab('form')}
                    >
                        ✏️ Edit Resume
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        👁️ Preview Resume
                    </button>
                </div>

                <div className="action-btn-group">
                    <button
                        type="button"
                        className="btn-builder btn-builder-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Spinner size="sm" animation="border" /> : '💾 Save Resume'}
                    </button>
                    <button
                        type="button"
                        className="btn-builder btn-builder-outline"
                        onClick={() => setActiveTab(activeTab === 'form' ? 'preview' : 'form')}
                    >
                        {activeTab === 'form' ? '👁️ Preview Resume' : '✏️ Edit Resume'}
                    </button>
                    <button
                        type="button"
                        className="btn-builder btn-builder-success"
                        onClick={handleDownloadPdf}
                        disabled={downloading || saving}
                    >
                        {downloading ? <Spinner size="sm" animation="border" /> : '📥 Download Resume as PDF'}
                    </button>
                </div>
            </div>

            {/* ── EDIT FORM TAB ── */}
            {activeTab === 'form' && (
                <Form onSubmit={handleSave}>

                    {/* Section 1: Personal Information */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>👤 Personal Information</span>
                        </div>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Full Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="full_name"
                                        placeholder="Enter your full name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        isInvalid={!!errors.full_name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.full_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Email Address (Read Only)</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.candidate_email || user?.email || ''}
                                        disabled
                                        readOnly
                                        style={{ backgroundColor: '#f8fafc' }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        placeholder="+1 555-0199"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Preferred Job Location *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="preferred_location"
                                        placeholder="e.g. Remote / New York, NY"
                                        value={formData.preferred_location}
                                        onChange={handleChange}
                                        isInvalid={!!errors.preferred_location}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.preferred_location}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Address *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        placeholder="Street Address, City, State, ZIP"
                                        value={formData.address}
                                        onChange={handleChange}
                                        isInvalid={!!errors.address}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.address}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 2: Education */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>🎓 Education</span>
                        </div>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">University / College Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="university"
                                        placeholder="e.g. Stanford University"
                                        value={formData.university}
                                        onChange={handleChange}
                                        isInvalid={!!errors.university}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.university}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Education / Degree *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="education_degree"
                                        placeholder="e.g. B.S. Computer Science"
                                        value={formData.education_degree}
                                        onChange={handleChange}
                                        isInvalid={!!errors.education_degree}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.education_degree}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Graduation Year *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="graduation_year"
                                        placeholder="e.g. 2024"
                                        value={formData.graduation_year}
                                        onChange={handleChange}
                                        isInvalid={!!errors.graduation_year}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.graduation_year}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 3: Professional Details / Skills */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>💡 Skills & Experience</span>
                        </div>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Skills (Comma-separated) *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="skills"
                                        placeholder="e.g. Python, React, Django, SQL, REST APIs"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        isInvalid={!!errors.skills}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.skills}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Experience Level (Optional)</Form.Label>
                                    <Form.Select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Experience...</option>
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 4: Projects */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>🚀 Projects</span>
                        </div>
                        {formData.projects.map((proj, idx) => (
                            <div key={idx} className="sub-item-card">
                                <div className="sub-item-header">
                                    <h5>Project #{idx + 1}</h5>
                                    <button
                                        type="button"
                                        className="btn-icon-danger"
                                        onClick={() => removeProject(idx)}
                                    >
                                        🗑️ Delete Project
                                    </button>
                                </div>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Project Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. AI Resume Analyzer"
                                                value={proj.name}
                                                onChange={e => updateProject(idx, 'name', e.target.value)}
                                                isInvalid={!!errors[`proj_name_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`proj_name_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Technologies Used *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. React.js, Django REST Framework, SQLite"
                                                value={proj.tech_stack}
                                                onChange={e => updateProject(idx, 'tech_stack', e.target.value)}
                                                isInvalid={!!errors[`proj_tech_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`proj_tech_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Project Description *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Describe project objectives, key features, and your contributions..."
                                                value={proj.description}
                                                onChange={e => updateProject(idx, 'description', e.target.value)}
                                                isInvalid={!!errors[`proj_desc_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`proj_desc_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn-add-subitem"
                            onClick={addProject}
                        >
                            ➕ Add Project
                        </button>
                    </div>

                    {/* Section 5: Certificates */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>📜 Certificates</span>
                        </div>
                        {formData.certificates.map((cert, idx) => (
                            <div key={idx} className="sub-item-card">
                                <div className="sub-item-header">
                                    <h5>Certificate #{idx + 1}</h5>
                                    <button
                                        type="button"
                                        className="btn-icon-danger"
                                        onClick={() => removeCertificate(idx)}
                                    >
                                        🗑️ Delete Certificate
                                    </button>
                                </div>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Certificate Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. AWS Certified Developer"
                                                value={cert.name}
                                                onChange={e => updateCertificate(idx, 'name', e.target.value)}
                                                isInvalid={!!errors[`cert_name_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`cert_name_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Issuing Organization *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Amazon Web Services"
                                                value={cert.organization}
                                                onChange={e => updateCertificate(idx, 'organization', e.target.value)}
                                                isInvalid={!!errors[`cert_org_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`cert_org_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Date *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. May 2024"
                                                value={cert.issue_date}
                                                onChange={e => updateCertificate(idx, 'issue_date', e.target.value)}
                                                isInvalid={!!errors[`cert_date_${idx}`]}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors[`cert_date_${idx}`]}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Certificate Link (Optional)</Form.Label>
                                            <Form.Control
                                                type="url"
                                                placeholder="https://credential-verification-link.com"
                                                value={cert.link}
                                                onChange={e => updateCertificate(idx, 'link', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn-add-subitem"
                            onClick={addCertificate}
                        >
                            ➕ Add Certificate
                        </button>
                    </div>

                    {/* Section 6: Online Profiles */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>🌐 Online Profiles (Optional)</span>
                        </div>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">LinkedIn Profile URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="linkedin_url"
                                        placeholder="https://linkedin.com/in/username"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">GitHub Profile URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="github_url"
                                        placeholder="https://github.com/username"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Portfolio Website URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="portfolio_url"
                                        placeholder="https://yourportfolio.dev"
                                        value={formData.portfolio_url}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 7: About / Bio */}
                    <div className="form-section-card">
                        <div className="form-section-title">
                            <span>📝 Bio / Professional Summary (Optional)</span>
                        </div>
                        <Form.Group>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="bio"
                                placeholder="Briefly describe your career objectives, achievements, and key background..."
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </div>

                    {/* Submit Bar */}
                    <div className="d-flex justify-content-end gap-3 mb-5">
                        <button
                            type="button"
                            className="btn-builder btn-builder-outline"
                            onClick={() => setActiveTab('preview')}
                        >
                            👁️ Preview Resume
                        </button>
                        <button
                            type="submit"
                            className="btn-builder btn-builder-primary"
                            disabled={saving}
                        >
                            {saving ? <Spinner size="sm" animation="border" /> : '💾 Save Resume'}
                        </button>
                    </div>

                </Form>
            )}

            {/* ── ATS PREVIEW TAB (Ordered 1-10) ── */}
            {activeTab === 'preview' && (
                <div className="ats-preview-card">

                    {/* 1. Personal Information */}
                    <div className="ats-header">
                        <h1>{formData.full_name || user?.email || 'Candidate Name'}</h1>
                        <div className="ats-contact-info">
                            {formData.candidate_email && <span>📧 {formData.candidate_email}</span>}
                            {formData.phone && <span>📞 {formData.phone}</span>}
                            {formData.address && <span>📍 {formData.address}</span>}
                            {formData.preferred_location && <span>🎯 Preferred Location: {formData.preferred_location}</span>}
                        </div>
                    </div>

                    {/* 2. Education */}
                    <div className="ats-section">
                        <div className="ats-section-title">2. Education</div>
                        <div className="ats-section-content">
                            <div className="fw-bold">{formData.education_degree || 'Degree'} — {formData.university || 'University / College'}</div>
                            <div className="text-muted">Graduation Year: {formData.graduation_year || 'Year'}</div>
                        </div>
                    </div>

                    {/* 3. Skills */}
                    {formData.skills && (
                        <div className="ats-section">
                            <div className="ats-section-title">3. Skills</div>
                            <div className="ats-section-content">
                                <div className="skills-tags">
                                    {formData.skills.split(',').map((skill, idx) => (
                                        <span key={idx} className="skill-pill">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Projects */}
                    {formData.projects.length > 0 && (
                        <div className="ats-section">
                            <div className="ats-section-title">4. Projects</div>
                            <div className="ats-section-content">
                                {formData.projects.map((proj, idx) => (
                                    <div key={idx} className="preview-project-item">
                                        <div className="fw-bold">{proj.name} <span className="text-muted font-normal">({proj.tech_stack})</span></div>
                                        <div>{proj.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. Certificates */}
                    {formData.certificates.length > 0 && (
                        <div className="ats-section">
                            <div className="ats-section-title">5. Certificates</div>
                            <div className="ats-section-content">
                                {formData.certificates.map((cert, idx) => (
                                    <div key={idx} className="preview-cert-item">
                                        <div className="fw-bold">{cert.name} — <span className="fw-normal">{cert.organization} ({cert.issue_date})</span></div>
                                        {cert.link && (
                                            <div>
                                                Link: <a href={cert.link} target="_blank" rel="noreferrer" className="preview-link">{cert.link}</a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Experience */}
                    {formData.experience && (
                        <div className="ats-section">
                            <div className="ats-section-title">6. Experience</div>
                            <div className="ats-section-content">
                                <div>Experience Level: {formData.experience}</div>
                            </div>
                        </div>
                    )}

                    {/* 7. LinkedIn Profile */}
                    {formData.linkedin_url && (
                        <div className="ats-section">
                            <div className="ats-section-title">7. LinkedIn Profile</div>
                            <div className="ats-section-content">
                                <a href={formData.linkedin_url} target="_blank" rel="noreferrer" className="preview-link">
                                    {formData.linkedin_url}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 8. GitHub Profile */}
                    {formData.github_url && (
                        <div className="ats-section">
                            <div className="ats-section-title">8. GitHub Profile</div>
                            <div className="ats-section-content">
                                <a href={formData.github_url} target="_blank" rel="noreferrer" className="preview-link">
                                    {formData.github_url}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 9. Portfolio Website */}
                    {formData.portfolio_url && (
                        <div className="ats-section">
                            <div className="ats-section-title">9. Portfolio Website</div>
                            <div className="ats-section-content">
                                <a href={formData.portfolio_url} target="_blank" rel="noreferrer" className="preview-link">
                                    {formData.portfolio_url}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 10. Bio / Professional Summary */}
                    {formData.bio && (
                        <div className="ats-section">
                            <div className="ats-section-title">10. Bio / Professional Summary</div>
                            <div className="ats-section-content">{formData.bio}</div>
                        </div>
                    )}

                    <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                        <button
                            type="button"
                            className="btn-builder btn-builder-outline"
                            onClick={() => setActiveTab('form')}
                        >
                            ✏️ Edit Resume
                        </button>
                        <button
                            type="button"
                            className="btn-builder btn-builder-success"
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                        >
                            {downloading ? <Spinner size="sm" animation="border" /> : '📥 Download Resume as PDF'}
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

export default ResumeBuilder;
