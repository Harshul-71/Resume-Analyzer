import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 60; // seconds

// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage — two-step: form → OTP verification
// ─────────────────────────────────────────────────────────────────────────────

const RegisterPage = () => {
    // step: 'form' | 'otp' | 'done'
    const [step, setStep] = useState('form');

    // Form fields
    const [formData, setFormData] = useState({
        first_name: '',
        last_name:  '',
        email:      '',
        password:   '',
        confirm:    '',
    });

    // OTP verification
    const [otp,      setOtp]      = useState('');
    const [otpEmail, setOtpEmail] = useState(''); // captured from formData on submit

    // UI state
    const [error,   setError]   = useState(null);
    const [loading, setLoading] = useState(false);

    // 60-second resend countdown
    const [countdown, setCountdown]     = useState(0);
    const countdownRef                   = useRef(null);

    const navigate = useNavigate();

    // Start / restart the resend countdown
    const startCountdown = () => {
        setCountdown(RESEND_COOLDOWN);
    };

    useEffect(() => {
        if (countdown <= 0) {
            clearInterval(countdownRef.current);
            return;
        }
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [countdown]);

    // ── Step 1: form submit → request OTP ────────────────────────

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('auth/register/request-otp/', {
                email:      formData.email.trim().toLowerCase(),
                password:   formData.password,
                first_name: formData.first_name.trim(),
                last_name:  formData.last_name.trim(),
            });
            setOtpEmail(formData.email.trim().toLowerCase());
            setOtp('');
            setStep('otp');
            startCountdown();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2a: verify OTP → create account ─────────────────────

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('auth/register/verify-otp/', {
                email: otpEmail,
                otp:   otp.trim(),
            });
            setStep('done');
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'OTP verification failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2b: resend OTP ───────────────────────────────────────

    const handleResend = async () => {
        if (countdown > 0) return;
        setError(null);
        setLoading(true);
        try {
            await api.post('auth/register/resend-otp/', { email: otpEmail });
            setOtp('');
            startCountdown();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Could not resend OTP. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '100vh' }}
        >
            <div className="w-100" style={{ maxWidth: '420px' }}>

                {/* ── STEP 1: Registration form ── */}
                {step === 'form' && (
                    <Card className="shadow-lg border-0 rounded-3">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4 fw-bold text-primary">
                                Candidate Sign Up
                            </h2>

                            {error && (
                                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleFormSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">First Name</Form.Label>
                                    <Form.Control
                                        type="text" required
                                        placeholder="First name"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Last Name</Form.Label>
                                    <Form.Control
                                        type="text" required
                                        placeholder="Last name"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                                    <Form.Control
                                        type="email" required
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Password</Form.Label>
                                    <Form.Control
                                        type="password" required
                                        placeholder="Create password (min. 8 characters)"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password" required
                                        placeholder="Confirm password"
                                        value={formData.confirm}
                                        onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                                    />
                                </Form.Group>
                                <Button
                                    className="w-100 py-2 fw-semibold border-0"
                                    style={{ background: '#6366f1', borderRadius: '8px' }}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? <><Spinner size="sm" className="me-2" animation="border" />Sending OTP…</>
                                        : 'Sign Up'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {/* ── STEP 2: OTP verification ── */}
                {step === 'otp' && (
                    <Card className="shadow-lg border-0 rounded-3">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <div style={{ fontSize: '2.5rem' }}>📧</div>
                                <h4 className="fw-bold mt-2" style={{ color: '#1e293b' }}>
                                    Verify Your Email
                                </h4>
                                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                    We sent a 6-digit OTP to<br />
                                    <strong>{otpEmail}</strong>
                                </p>
                            </div>

                            {error && (
                                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleVerifyOtp}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold text-center d-block">
                                        Enter OTP
                                        <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.82rem', marginLeft: '6px' }}>
                                            (valid for 5 minutes)
                                        </span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text" required
                                        maxLength={6}
                                        placeholder="••••••"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{
                                            textAlign: 'center',
                                            letterSpacing: '8px',
                                            fontSize: '1.6rem',
                                            fontWeight: 700,
                                            borderRadius: '10px',
                                            padding: '12px',
                                        }}
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-100 py-2 fw-semibold border-0 mb-3"
                                    style={{ background: '#10b981', borderRadius: '8px' }}
                                >
                                    {loading
                                        ? <><Spinner size="sm" className="me-2" animation="border" />Verifying…</>
                                        : 'Verify OTP'}
                                </Button>
                            </Form>

                            {/* Resend OTP with countdown */}
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                        Resend OTP in{' '}
                                        <strong style={{ color: '#6366f1' }}>{countdown}s</strong>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: '#6366f1', fontSize: '0.85rem',
                                            cursor: 'pointer', fontWeight: 600,
                                        }}
                                    >
                                        Didn't receive OTP? Resend
                                    </button>
                                )}
                            </div>

                            {/* Back to form */}
                            <div className="text-center mt-3">
                                <button
                                    type="button"
                                    onClick={() => { setStep('form'); setError(null); }}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer',
                                    }}
                                >
                                    ‹ Back to registration
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* ── STEP 3: Success ── */}
                {step === 'done' && (
                    <Card className="shadow-lg border-0 rounded-3">
                        <Card.Body className="p-4 text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                            <h4 className="fw-bold" style={{ color: '#065f46' }}>
                                Registration Successful.
                            </h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
                                Your account has been created. You can now log in.
                            </p>
                            <Button
                                onClick={() => navigate('/login')}
                                className="mt-3 fw-semibold border-0"
                                style={{ background: '#6366f1', borderRadius: '8px', padding: '10px 32px' }}
                            >
                                Go to Login
                            </Button>
                        </Card.Body>
                    </Card>
                )}

                {/* Login link (shown on form + otp steps) */}
                {step !== 'done' && (
                    <div className="w-100 text-center mt-3 text-secondary" style={{ fontSize: '0.88rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: '#6366f1' }}>
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default RegisterPage;
