import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Jobs.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingJobId, setApplyingJobId] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, resumesRes] = await Promise.all([
                api.get('jobs/candidate/list/'),
                api.get('resume/')
            ]);
            // Handle both paginated ({results: [...]}) and non-paginated array responses
            const jobsData = jobsRes.data?.results ?? jobsRes.data;
            const resumesData = resumesRes.data?.results ?? resumesRes.data;
            setJobs(Array.isArray(jobsData) ? jobsData : []);
            setResumes(Array.isArray(resumesData) ? resumesData : []);
            const primaryResume = (Array.isArray(resumesData) ? resumesData : []).find(r => r.is_primary);
            if (primaryResume) {
                setSelectedResumeId(primaryResume.id);
            } else if (Array.isArray(resumesData) && resumesData.length > 0) {
                setSelectedResumeId(resumesData[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (jobId) => {
        if (resumes.length === 0) {
            setMessage('Please upload a resume first before applying.');
            return;
        }
        setApplyingJobId(jobId);
        setMessage('');
    };

    const submitApplication = async (jobId) => {
        try {
            await api.post('applications/apply/', {
                job: jobId,
                resume: selectedResumeId
            });
            setMessage('Successfully applied to the job!');
            setApplyingJobId(null);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to apply. You might have already applied.');
            setApplyingJobId(null);
        }
    };

    if (loading) return <div>Loading jobs...</div>;

    return (
        <div className="jobs-container">
            <h1 className="page-title">Browse Jobs</h1>
            {message && <div className="alert-message">{message}</div>}

            <div className="job-list">
                {jobs.map(job => (
                    <div key={job.id} className="premium-card job-card">
                        <div className="job-header">
                            <h2>{job.title}</h2>
                            <span className="job-type">{job.job_type}</span>
                        </div>
                        <div className="job-details">
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Posted on:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="job-description">
                            <p>{job.description}</p>
                        </div>
                        
                        {applyingJobId === job.id ? (
                            <div className="apply-section">
                                <label>Select Resume:</label>
                                <select 
                                    value={selectedResumeId} 
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                    className="resume-select"
                                >
                                    {resumes.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.file_path.split('/').pop()} {r.is_primary ? '(Primary)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="apply-actions">
                                    <button onClick={() => submitApplication(job.id)} className="btn-primary">Confirm Apply</button>
                                    <button onClick={() => setApplyingJobId(null)} className="btn-secondary">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => handleApplyClick(job.id)} className="btn-primary mt-3">
                                Apply Now
                            </button>
                        )}
                    </div>
                ))}
                {jobs.length === 0 && <p>No jobs available at the moment.</p>}
            </div>
        </div>
    );
};

export default Jobs;
