import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ParsedResumeModal from '../../components/candidate/ParsedResumeModal';
import './Resumes.css';

const Resumes = () => {
    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedParsedData, setSelectedParsedData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await api.get('resume/');
            // Handle both paginated ({results: [...]}) and direct array responses
            const data = res.data?.results ?? res.data;
            setResumes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch resumes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file_path', file);
        // By default make the first resume primary
        if (resumes.length === 0) {
            formData.append('is_primary', 'true');
        }

        setUploading(true);
        try {
            await api.post('resume/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Resume uploaded successfully!');
            setFile(null);
            e.target.reset();
            fetchResumes();
        } catch (err) {
            setMessage('Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    const setPrimary = async (id) => {
        try {
            await api.patch(`resume/${id}/`, { is_primary: true });
            fetchResumes();
        } catch (err) {
            setMessage('Failed to set primary resume.');
        }
    };

    const deleteResume = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resume?")) return;
        try {
            await api.delete(`resume/${id}/`);
            fetchResumes();
        } catch (err) {
            setMessage('Failed to delete resume.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="resumes-container">
            <h1 className="page-title">Manage Resumes</h1>
            {message && <div className="alert-message">{message}</div>}

            <div className="premium-card">
                <h2>Upload New Resume</h2>
                <form onSubmit={handleUpload} className="upload-form">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                    <button type="submit" className="btn-primary" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>

            <div className="premium-card">
                <h2>My Resumes</h2>
                {resumes.length === 0 ? (
                    <p>No resumes uploaded yet.</p>
                ) : (
                    <div className="resume-list">
                        {resumes.map(resume => (
                            <div key={resume.id} className={`resume-item ${resume.is_primary ? 'primary' : ''}`}>
                                <div className="resume-info">
                                    <span className="resume-name">{resume.file_path.split('/').pop()}</span>
                                    <span className="resume-date">{new Date(resume.uploaded_at).toLocaleDateString()}</span>
                                    {resume.is_primary && <span className="badge primary-badge">Primary</span>}
                                </div>
                                <div className="resume-actions">
                                    {resume.parsed_data && (
                                        <button onClick={() => { setSelectedParsedData(resume.parsed_data); setIsModalOpen(true); }} className="btn-small">View Parsed Info</button>
                                    )}
                                    <a href={resume.file_path} target="_blank" rel="noopener noreferrer" className="btn-link">View File</a>
                                    {!resume.is_primary && (
                                        <button onClick={() => setPrimary(resume.id)} className="btn-small">Set Primary</button>
                                    )}
                                    <button onClick={() => deleteResume(resume.id)} className="btn-small danger">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ParsedResumeModal parsedData={selectedParsedData} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

export default Resumes;
