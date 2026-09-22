import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        // Check token expiry
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) return null;
        return { email: decoded.email, role: decoded.role, id: decoded.user_id };
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userFromToken = getUserFromToken(token);
        if (userFromToken) {
            setUser(userFromToken);
        } else if (token) {
            // Token exists but is invalid/expired — clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        const payload = { email, password };
        if (role) payload.role = role;
        const response = await api.post('auth/login/', payload);
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        const decoded = jwtDecode(access);
        const userData = { email: decoded.email, role: decoded.role, id: decoded.user_id };
        setUser(userData);
        return decoded;
    };

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    // Called by api.js interceptor after a successful token refresh
    const updateUserFromToken = useCallback((token) => {
        const userData = getUserFromToken(token);
        if (userData) {
            setUser(userData);
        } else {
            logout();
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUserFromToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
