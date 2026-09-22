import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Role definitions
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
    {
        key: 'Admin',
        label: 'Admin',
        icon: '🛡️',
        description: 'Manage HR, candidates & system',
        color: '#6366f1',
        bg: '#eef2ff',
        border: '#c7d2fe',
    },
    {
        key: 'HR',
        label: 'HR Manager',
        icon: '💼',
        description: 'Post jobs & review applications',
        color: '#0ea5e9',
        bg: '#e0f2fe',
        border: '#bae6fd',
    },
    {
        key: 'Candidate',
        label: 'Candidate',
        icon: '👤',
        description: 'Browse jobs & apply with resume',
        color: '#10b981',
        bg: '#d1fae5',
        border: '#a7f3d0',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password sub-component  (3-step inline flow)
// ─────────────────────────────────────────────────────────────────────────────

const ForgotPasswordFlow = ({ onBack, onSuccess, role }) => {
    // step: 'request' → 'verify' → 'done'
    const [step,       setStep]       = useState('request');
    const [fpEmail,    setFpEmail]    = useState('');
    const [otp,        setOtp]        = useState('');
    const [newPwd,     setNewPwd]     = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [info,       setInfo]       = useState('');

    // ── Step 1: send OTP ─────────────────────────────────────────
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError(''); setInfo(''); setLoading(true);
        try {
            await api.post('auth/forgot-password/', { email: fpEmail, role: role || '' });
            setInfo('OTP sent! Check your email inbox (also check Spam).');
            setStep('verify');
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to send OTP. Please check your email address and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: verify OTP + reset password ──────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (newPwd !== confirmPwd) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('auth/forgot-password/verify/', {
                email:        fpEmail,
                otp:          otp,
                new_password: newPwd,
            });
            if (onSuccess) {
                onSuccess('Password changed successfully. Please login.');
            } else {
                setStep('done');
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to reset password. Please check your OTP and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const backBtn = (
        <button
            type="button"
            onClick={onBack}
            style={{
                background: 'none', border: '1px solid #e2e8f0',
                borderRadius: '8px', padding: '4px 12px',
                cursor: 'pointer', color: '#64748b', fontSize: '0.85rem',
            }}
        >
            ‹ Back to Login
        </button>
    );

    return (
        <div>
            <div className="mb-4">{backBtn}</div>
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Reset Password</h5>

            {error && <Alert variant="danger"  onClose={() => setError('')} dismissible>{error}</Alert>}
            {info  && <Alert variant="info"    onClose={() => setInfo('')}  dismissible>{info}</Alert>}

            {/* ── Step 1 ── */}
            {step === 'request' && (
                <Form onSubmit={handleRequestOtp}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                            Your Registered Email
                        </Form.Label>
                        <Form.Control
                            type="email" required
                            placeholder="Enter your email address"
                            value={fpEmail}
                            onChange={e => setFpEmail(e.target.value)}
                            style={{ borderRadius: '10px', padding: '10px 14px' }}
                        />
                    </Form.Group>
                    <Button
                        type="submit" disabled={loading}
                        className="w-100 py-2 fw-semibold border-0"
                        style={{ borderRadius: '10px', background: '#6366f1' }}
                    >
                        {loading
                            ? <><Spinner size="sm" className="me-2" animation="border" />Sending OTP…</>
                            : 'Send OTP'}
                    </Button>
                </Form>
            )}

            {/* ── Step 2 ── */}
            {step === 'verify' && (
                <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                            Enter OTP
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.82rem', marginLeft: '6px' }}>
                                (valid for 5 minutes)
                            </span>
                        </Form.Label>
                        <Form.Control
                            type="text" required maxLength={6}
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            style={{
                                borderRadius: '10px', padding: '10px 14px',
                                letterSpacing: '6px', fontSize: '1.3rem',
                                textAlign: 'center', fontWeight: 700,
                            }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                            New Password
                        </Form.Label>
                        <Form.Control
                            type="password" required
                            placeholder="Enter new password"
                            value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                            style={{ borderRadius: '10px', padding: '10px 14px' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                            Confirm New Password
                        </Form.Label>
                        <Form.Control
                            type="password" required
                            placeholder="Confirm new password"
                            value={confirmPwd}
                            onChange={e => setConfirmPwd(e.target.value)}
                            style={{ borderRadius: '10px', padding: '10px 14px' }}
                        />
                    </Form.Group>
                    <Button
                        type="submit" disabled={loading}
                        className="w-100 py-2 fw-semibold border-0 mb-2"
                        style={{ borderRadius: '10px', background: '#10b981' }}
                    >
                        {loading
                            ? <><Spinner size="sm" className="me-2" animation="border" />Verifying…</>
                            : 'Reset Password'}
                    </Button>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => { setStep('request'); setError(''); setInfo(''); setOtp(''); }}
                            style={{
                                background: 'none', border: 'none',
                                color: '#6366f1', fontSize: '0.83rem', cursor: 'pointer',
                            }}
                        >
                            Didn't receive OTP? Resend
                        </button>
                    </div>
                </Form>
            )}

            {/* ── Step 3: done ── */}
            {step === 'done' && (
                <div className="text-center py-3">
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                    <h6 className="fw-bold" style={{ color: '#065f46' }}>
                        Password Reset Successful!
                    </h6>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        You can now log in with your new password.
                    </p>
                    <Button
                        onClick={onBack}
                        className="border-0 fw-semibold mt-2"
                        style={{ background: '#6366f1', borderRadius: '10px' }}
                    >
                        Back to Login
                    </Button>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main LoginPage component
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage = () => {
    const [selectedRole,       setSelectedRole]       = useState(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState(null);
    const [info,     setInfo]     = useState(null);
    const [loading,  setLoading]  = useState(false);
    const { login }  = useContext(AuthContext);
    const navigate   = useNavigate();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError(null);
        setInfo(null);
        setEmail('');
        setPassword('');
        setShowForgotPassword(false);
    };

    const handleBack = () => {
        setSelectedRole(null);
        setError(null);
        setInfo(null);
        setEmail('');
        setPassword('');
        setShowForgotPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        setLoading(true);
        try {
            const user = await login(email, password, selectedRole);
            if (user.role === 'Admin')    navigate('/admin');
            else if (user.role === 'HR') navigate('/hr');
            else                         navigate('/candidate');
        } catch (err) {
            const detail =
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                'Invalid email or password. Please try again.';
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    const activeRole = ROLE_OPTIONS.find(r => r.key === selectedRole);

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)' }}
        >
            <div className="w-100" style={{ maxWidth: '480px', padding: '0 16px' }}>

                {/* Header */}
                <div className="text-center mb-4">
                    <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>🤖</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        AI Resume Analyzer
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        {showForgotPassword
                            ? 'Reset your password'
                            : selectedRole
                                ? `Sign in as ${activeRole.label}`
                                : 'Select your role to continue'}
                    </p>
                </div>

                <Card className="shadow border-0 rounded-4">
                    <Card.Body className="p-4">

                        {/* ── Forgot Password flow ── */}
                        {showForgotPassword && (
                            <ForgotPasswordFlow
                                onBack={() => setShowForgotPassword(false)}
                                onSuccess={(msg) => {
                                    setShowForgotPassword(false);
                                    setInfo(msg || 'Password changed successfully. Please login.');
                                }}
                                role={selectedRole}
                            />
                        )}

                        {/* ── STEP 1: Role selector ── */}
                        {!showForgotPassword && !selectedRole && (
                            <>
                                <h5 className="fw-semibold text-center mb-4" style={{ color: '#1e293b' }}>
                                    Who are you?
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    {ROLE_OPTIONS.map(role => (
                                        <button
                                            key={role.key}
                                            onClick={() => handleRoleSelect(role.key)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                                padding: '14px 18px',
                                                border: `2px solid ${role.border}`,
                                                borderRadius: '12px', background: role.bg,
                                                cursor: 'pointer',
                                                transition: 'transform 0.15s, box-shadow 0.15s',
                                                textAlign: 'left', width: '100%',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{role.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: role.color, fontSize: '1rem' }}>
                                                    {role.label}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                                                    {role.description}
                                                </div>
                                            </div>
                                            <span style={{ marginLeft: 'auto', color: role.color, fontSize: '1.2rem' }}>›</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── STEP 2: Login form ── */}
                        {!showForgotPassword && selectedRole && (
                            <>
                                <div className="d-flex align-items-center mb-4 gap-2">
                                    <button
                                        onClick={handleBack}
                                        style={{
                                            background: 'none', border: '1px solid #e2e8f0',
                                            borderRadius: '8px', padding: '4px 10px',
                                            cursor: 'pointer', color: '#64748b', fontSize: '0.85rem',
                                        }}
                                    >
                                        ‹ Back
                                    </button>
                                    <span style={{
                                        background: activeRole.bg, border: `1px solid ${activeRole.border}`,
                                        color: activeRole.color, borderRadius: '20px',
                                        padding: '3px 12px', fontSize: '0.82rem', fontWeight: 600,
                                    }}>
                                        {activeRole.icon} {activeRole.label}
                                    </span>
                                </div>

                                <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Welcome back</h5>

                                {info && (
                                    <Alert variant="info" onClose={() => setInfo(null)} dismissible>
                                        {info}
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                            Email Address
                                        </Form.Label>
                                        <Form.Control
                                            type="email" required
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            style={{ borderRadius: '10px', padding: '10px 14px' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password" required
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            style={{ borderRadius: '10px', padding: '10px 14px' }}
                                        />
                                    </Form.Group>
                                    <Button
                                        type="submit" disabled={loading}
                                        className="w-100 py-2 fw-semibold border-0"
                                        style={{ borderRadius: '10px', background: activeRole.color, fontSize: '0.95rem' }}
                                    >
                                        {loading
                                            ? <><Spinner size="sm" className="me-2" animation="border" />Signing in…</>
                                            : `Sign in as ${activeRole.label}`}
                                    </Button>
                                </Form>

                                {/* Forgot password link */}
                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        onClick={() => { setError(null); setShowForgotPassword(true); }}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: '#64748b', fontSize: '0.83rem', cursor: 'pointer',
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>

                {/* Register link */}
                <div className="text-center mt-3" style={{ color: '#64748b', fontSize: '0.88rem' }}>
                    New candidate?{' '}
                    <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#10b981' }}>
                        Create an account
                    </Link>
                </div>
            </div>
        </Container>
    );
};

export default LoginPage;
