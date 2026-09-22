import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleLogoutClick = () => setShowModal(true);
    const handleCancel = () => setShowModal(false);

    const handleConfirmLogout = () => {
        setShowModal(false);
        // Clear all auth data
        logout();
        localStorage.clear();
        sessionStorage.clear();
        setShowToast(true);
        // Small delay so the toast is briefly visible before redirect
        setTimeout(() => {
            navigate('/login', { replace: true });
        }, 1200);
    };

    return (
        <>
            <div className="candidate-sidebar">
                <div className="sidebar-header">
                    <h2>Candidate Portal</h2>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/candidate" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/candidate/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Profile
                    </NavLink>
                    <NavLink to="/candidate/resumes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        My Resumes
                    </NavLink>
                    <NavLink to="/candidate/resume-builder" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Resume Builder
                    </NavLink>
                    <NavLink to="/candidate/jobs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Browse Jobs
                    </NavLink>
                    <NavLink to="/candidate/applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        My Applications
                    </NavLink>
                    <button onClick={handleLogoutClick} className="nav-item logout-btn">
                        Logout
                    </button>
                </nav>
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
        </>
    );
};

export default Sidebar;
