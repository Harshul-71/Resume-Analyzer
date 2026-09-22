import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageHR from './pages/admin/ManageHR';
import ManageCandidates from './pages/admin/ManageCandidates';
import ManageApplications from './pages/admin/ManageApplications';
import HRLayout from './components/hr/HRLayout';
import HRDashboard from './pages/hr/Dashboard';
import ManageJobs from './pages/hr/ManageJobs';
import JobApplications from './pages/hr/JobApplications';
import SearchCandidates from './pages/hr/SearchCandidates';
import CandidateLayout from './components/candidate/CandidateLayout';
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateResumes from './pages/candidate/Resumes';
import ResumeBuilder from './pages/candidate/ResumeBuilder';
import CandidateJobs from './pages/candidate/Jobs';
import CandidateApplications from './pages/candidate/Applications';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppNavbar />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="analytics" element={<AnalyticsDashboard />} />
                            <Route path="hr" element={<ManageHR />} />
                            <Route path="candidates" element={<ManageCandidates />} />
                            <Route path="applications" element={<ManageApplications />} />
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['HR', 'Admin']} />}>
                        <Route path="/hr" element={<HRLayout />}>
                            <Route index element={<HRDashboard />} />
                            <Route path="analytics" element={<AnalyticsDashboard />} />
                            <Route path="jobs" element={<ManageJobs />} />
                            <Route path="jobs/:id/applications" element={<JobApplications />} />
                            <Route path="search-candidates" element={<SearchCandidates />} />
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['Candidate']} />}>
                        <Route path="/candidate" element={<CandidateLayout />}>
                            <Route index element={<CandidateDashboard />} />
                            <Route path="profile" element={<CandidateProfile />} />
                            <Route path="resumes" element={<CandidateResumes />} />
                            <Route path="resume-builder" element={<ResumeBuilder />} />
                            <Route path="jobs" element={<CandidateJobs />} />
                            <Route path="applications" element={<CandidateApplications />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
