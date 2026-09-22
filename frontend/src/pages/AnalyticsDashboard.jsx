import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import api from '../services/api';
import ReportDownloadButton from '../components/reports/ReportDownloadButton';
import AnalysisReportModal from '../components/hr/AnalysisReportModal';
import './AnalyticsDashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('analytics/dashboard/');
            setData(response.data);
        } catch (err) {
            console.error("Error loading analytics data:", err);
            setError("Failed to load analytics dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const viewCandidateReport = async (appId) => {
        try {
            const res = await api.get(`reports/${appId}/`);
            setSelectedAnalysis(res.data);
        } catch (err) {
            alert('Failed to load candidate report.');
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner-border text-primary" role="status"></div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="analytics-error">
                <p>{error || "No data available."}</p>
                <button className="btn-secondary" onClick={fetchAnalytics}>Retry</button>
            </div>
        );
    }

    const {
        status_counts,
        avg_ats_score,
        total_analyzed,
        ats_distribution,
        skills_distribution,
        experience_distribution,
        education_distribution,
        top_skills,
        top_candidates,
    } = data;

    // 1. Application Status Doughnut Chart Data
    const statusChartData = {
        labels: ['Shortlisted', 'Rejected', 'Pending'],
        datasets: [
            {
                data: [
                    status_counts.shortlisted || 0,
                    status_counts.rejected || 0,
                    status_counts.pending || 0,
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                hoverBackgroundColor: ['#059669', '#dc2626', '#d97706'],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    // 2. ATS Score Distribution Bar Chart Data
    const atsLabels = Object.keys(ats_distribution || {});
    const atsValues = Object.values(ats_distribution || {});
    const atsChartData = {
        labels: atsLabels,
        datasets: [
            {
                label: 'Number of Candidates',
                data: atsValues,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#6366f1',
                    '#f59e0b',
                    '#ef4444',
                ],
                borderRadius: 6,
            },
        ],
    };

    // 3. Skills Distribution Horizontal Bar Chart Data
    const skillLabels = Object.keys(skills_distribution || {});
    const skillValues = Object.values(skills_distribution || {});
    const skillsChartData = {
        labels: skillLabels.length > 0 ? skillLabels : ['No Skills Data'],
        datasets: [
            {
                label: 'Candidate Occurrences',
                data: skillValues.length > 0 ? skillValues : [0],
                backgroundColor: '#8b5cf6',
                borderRadius: 6,
            },
        ],
    };

    // 4. Experience Distribution Pie Chart Data
    const expLabels = Object.keys(experience_distribution || {});
    const expValues = Object.values(experience_distribution || {});
    const experienceChartData = {
        labels: expLabels,
        datasets: [
            {
                data: expValues,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    // 5. Education Distribution Pie Chart Data
    const eduLabels = Object.keys(education_distribution || {});
    const eduValues = Object.values(education_distribution || {});
    const educationChartData = {
        labels: eduLabels,
        datasets: [
            {
                data: eduValues,
                backgroundColor: ['#6366f1', '#ec4899', '#14b8a6'],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { family: "'Inter', sans-serif", size: 12 } },
            },
        },
    };

    const horizontalBarOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h1>Analytics Dashboard</h1>
                    <p className="subtitle">Real-time candidate metrics, ATS score distribution, and skill analysis.</p>
                </div>
                <button className="btn-refresh" onClick={fetchAnalytics}>
                    🔄 Refresh Data
                </button>
            </div>

            {/* Top Metric Cards */}
            <div className="metrics-grid">
                <div className="metric-card card-total">
                    <div className="metric-icon">📋</div>
                    <div className="metric-info">
                        <span className="metric-label">Total Applications</span>
                        <h2 className="metric-value">{status_counts.total}</h2>
                    </div>
                </div>

                <div className="metric-card card-shortlisted">
                    <div className="metric-icon">✅</div>
                    <div className="metric-info">
                        <span className="metric-label">Shortlisted</span>
                        <h2 className="metric-value">{status_counts.shortlisted}</h2>
                    </div>
                </div>

                <div className="metric-card card-rejected">
                    <div className="metric-icon">❌</div>
                    <div className="metric-info">
                        <span className="metric-label">Rejected</span>
                        <h2 className="metric-value">{status_counts.rejected}</h2>
                    </div>
                </div>

                <div className="metric-card card-pending">
                    <div className="metric-icon">⏳</div>
                    <div className="metric-info">
                        <span className="metric-label">Pending</span>
                        <h2 className="metric-value">{status_counts.pending}</h2>
                    </div>
                </div>

                <div className="metric-card card-ats">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-info">
                        <span className="metric-label">Avg ATS Score</span>
                        <h2 className="metric-value">{avg_ats_score}%</h2>
                    </div>
                </div>
            </div>

            {/* Charts Section Grid */}
            <div className="charts-grid">
                {/* Chart 1: Application Status */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Application Status Breakdown</h3>
                        <span className="chart-badge">Shortlisted / Rejected / Pending</span>
                    </div>
                    <div className="chart-wrapper">
                        <Doughnut data={statusChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Chart 2: ATS Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>ATS Score Distribution</h3>
                        <span className="chart-badge">Candidate Compatibility Ranges</span>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={atsChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Chart 3: Skills Distribution */}
                <div className="chart-card col-span-2">
                    <div className="chart-header">
                        <h3>Skills Frequency Distribution</h3>
                        <span className="chart-badge">Top Candidate & Job Skills</span>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={skillsChartData} options={horizontalBarOptions} />
                    </div>
                </div>

                {/* Chart 4: Experience Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Experience Alignment</h3>
                        <span className="chart-badge">Experience Match Score</span>
                    </div>
                    <div className="chart-wrapper">
                        <Pie data={experienceChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Chart 5: Education Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Education Qualification Match</h3>
                        <span className="chart-badge">Education Alignment</span>
                    </div>
                    <div className="chart-wrapper">
                        <Doughnut data={educationChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Tables Grid Section */}
            <div className="tables-grid">
                {/* Top Skills Leaderboard */}
                <div className="table-card">
                    <div className="table-header">
                        <h3>Top In-Demand Skills</h3>
                        <span className="table-count">{top_skills.length} Skills</span>
                    </div>
                    <div className="table-responsive">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Skill</th>
                                    <th>Candidates</th>
                                    <th>Distribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_skills.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-3">No skills data recorded yet.</td></tr>
                                ) : (
                                    top_skills.map((item, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{idx + 1}</strong></td>
                                            <td><span className="skill-tag">{item.skill}</span></td>
                                            <td>{item.count} candidates</td>
                                            <td>
                                                <div className="progress-bar-wrap">
                                                    <div 
                                                        className="progress-bar-fill" 
                                                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                                                    ></div>
                                                    <span className="progress-pct">{item.percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Candidates Leaderboard */}
                <div className="table-card col-span-2">
                    <div className="table-header">
                        <h3>Top Performing Candidates</h3>
                        <span className="table-count">Highest ATS Matches</span>
                    </div>
                    <div className="table-responsive">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Candidate Name</th>
                                    <th>Position</th>
                                    <th>ATS Score</th>
                                    <th>Rank Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_candidates.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-3">No analyzed candidates found.</td></tr>
                                ) : (
                                    top_candidates.map((cand, idx) => (
                                        <tr key={cand.application_id}>
                                            <td>
                                                <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                                            </td>
                                            <td>
                                                <div className="candidate-cell">
                                                    <span className="candidate-name">{cand.candidate_name}</span>
                                                    <span className="candidate-email">{cand.email}</span>
                                                </div>
                                            </td>
                                            <td>{cand.job_title}</td>
                                            <td>
                                                <span className={`ats-pill ${cand.ats_score >= 80 ? 'high' : cand.ats_score >= 60 ? 'mid' : 'low'}`}>
                                                    {cand.ats_score}%
                                                </span>
                                            </td>
                                            <td><strong>{cand.candidate_ranking}/100</strong></td>
                                            <td>
                                                <span className={`status-pill status-${cand.status.toLowerCase()}`}>
                                                    {cand.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        className="btn-action view" 
                                                        onClick={() => viewCandidateReport(cand.application_id)}
                                                    >
                                                        View Report
                                                    </button>
                                                    <ReportDownloadButton 
                                                        applicationId={cand.application_id}
                                                        candidateName={cand.candidate_name}
                                                        buttonText="PDF"
                                                        variant="outline"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedAnalysis && (
                <AnalysisReportModal 
                    analysis={selectedAnalysis} 
                    onClose={() => setSelectedAnalysis(null)} 
                />
            )}
        </div>
    );
};

export default AnalyticsDashboard;
