import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    /**
     * Prevent back-button re-entry after logout.
     * On every mount of a protected page we push a fresh history entry so
     * the browser has nowhere "useful" to go back to; if the user does press
     * Back, ProtectedRoute will re-evaluate — user will be null (tokens gone)
     * and redirect to /login.
     */
    useEffect(() => {
        const handlePopState = () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login', { replace: true });
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const roleRedirect = user.role === 'Admin' ? '/admin' : user.role === 'HR' ? '/hr' : '/candidate';
        return <Navigate to={roleRedirect} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
