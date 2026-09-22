import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CandidateDashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_applied: 0,
        pending: 0,
        shortlisted: 0,
        interview_scheduled: 0,
        selected: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('applications/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="page-title">Candidate Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Applied</h3>
                    <p className="stat-number">{stats.total_applied}</p>
                </div>
                <div className="stat-card pending">
                    <h3>Pending</h3>
                    <p className="stat-number">{stats.pending}</p>
                </div>
                <div className="stat-card success">
                    <h3>Shortlisted</h3>
                    <p className="stat-number">{stats.shortlisted}</p>
                </div>
                <div className="stat-card interview">
                    <h3>Interview Scheduled</h3>
                    <p className="stat-number">{stats.interview_scheduled}</p>
                </div>
                <div className="stat-card selected">
                    <h3>Selected</h3>
                    <p className="stat-number">{stats.selected}</p>
                </div>
                <div className="stat-card danger">
                    <h3>Rejected</h3>
                    <p className="stat-number">{stats.rejected}</p>
                </div>
            </div>

            <div className="premium-card">
                <h2>Welcome Back!</h2>
                <p>Track your job applications and update your profile from this portal. Make sure your primary resume is up to date.</p>
            </div>
        </div>
    );
};

export default Dashboard;
