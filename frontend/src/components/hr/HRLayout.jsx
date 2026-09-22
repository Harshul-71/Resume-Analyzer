import React, { useContext, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Container, Toast, ToastContainer } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const HRLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleLogoutClick = () => setShowModal(true);
    const handleCancel = () => setShowModal(false);

    const handleConfirmLogout = () => {
        setShowModal(false);
        logout();
        localStorage.clear();
        sessionStorage.clear();
        setShowToast(true);
        setTimeout(() => {
            navigate('/login', { replace: true });
        }, 1200);
    };

    const navLinkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '8px 12px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
        color: isActive ? '#0d6efd' : '#374151',
        background: isActive ? '#eff6ff' : 'transparent',
        marginBottom: '4px',
        transition: 'background 0.15s, color 0.15s',
    });

    return (
        <div className="d-flex flex-column vh-100">
            {/* Top Navbar — email display only, no logout button */}
            <Navbar bg="primary" variant="dark" expand="lg" className="flex-shrink-0 shadow-sm">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/hr">HR Portal</Navbar.Brand>
                    <Navbar.Toggle aria-controls="hr-navbar" />
                    <Navbar.Collapse id="hr-navbar" className="justify-content-end">
                        <Navbar.Text className="me-3 text-light">
                            {user?.email}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Sidebar */}
                <div
                    className="bg-white border-end shadow-sm d-flex flex-column"
                    style={{ width: '220px', flexShrink: 0 }}
                >
                    <nav className="p-3 d-flex flex-column flex-grow-1">
                        {/* Nav links */}
                        <div className="flex-grow-1">
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '12px' }}>
                                Main
                            </div>
                            <NavLink to="/hr" end style={navLinkStyle}>
                                🏠 Dashboard
                            </NavLink>
                            <NavLink to="/hr/analytics" style={navLinkStyle}>
                                📊 Analytics
                            </NavLink>

                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 8px', paddingLeft: '12px' }}>
                                Recruitment
                            </div>
                            <NavLink to="/hr/jobs" style={navLinkStyle}>
                                💼 Manage Jobs
                            </NavLink>
                            <NavLink to="/hr/search-candidates" style={navLinkStyle}>
                                🔍 Search Candidates
                            </NavLink>
                        </div>

                        {/* Logout pinned to bottom */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}>
                            <button
                                onClick={handleLogoutClick}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#e53e3e',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow-1 p-4 overflow-auto" style={{ background: '#f8fafc' }}>
                    <Outlet />
                </div>
            </div>

            {/* Confirmation dialog */}
            <LogoutConfirmModal
                show={showModal}
                onCancel={handleCancel}
                onConfirm={handleConfirmLogout}
            />

            {/* Success toast */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={2000}
                    autohide
                    bg="success"
                >
                    <Toast.Body className="text-white fw-semibold">
                        Logged out successfully.
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default HRLayout;
