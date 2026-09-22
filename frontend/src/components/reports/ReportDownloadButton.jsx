import React, { useState } from 'react';
import './ReportDownloadButton.css';

const ReportDownloadButton = ({
    applicationId,
    candidateName = '',
    buttonText = 'Download PDF Report',
    className = '',
    variant = 'success',
    onSuccess,
    onError
}) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!applicationId) {
            alert('Application ID missing.');
            return;
        }

        setDownloading(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/reports/${applicationId}/download/`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Download failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const sanitizedName = candidateName ? candidateName.replace(/[^a-zA-Z0-9]/g, '_') : 'Candidate';
            a.download = `Report_${sanitizedName}_App${applicationId}.pdf`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error downloading PDF report:', error);
            alert(`Failed to download PDF report: ${error.message}`);
            if (onError) onError(error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            type="button"
            className={`btn-report-download btn-${variant} ${className} ${downloading ? 'loading' : ''}`}
            onClick={handleDownload}
            disabled={downloading}
            title="Download full PDF ATS analysis report"
        >
            {downloading ? (
                <>
                    <span className="spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span> Generating PDF...</span>
                </>
            ) : (
                <>
                    <svg className="download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>{buttonText}</span>
                </>
            )}
        </button>
    );
};

export default ReportDownloadButton;
