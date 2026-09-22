import React, { useState, useEffect } from 'react';
import { Table, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await api.get(`applications/admin/all/?page=${page}`);
            const data = res.data?.results ?? res.data;
            setApplications(Array.isArray(data) ? data : []);
            setTotalPages(res.data.count ? Math.ceil(res.data.count / 10) : 1);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [page]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="mb-4">All Applications</h2>
            
            <Table striped bordered hover responsive className="bg-white shadow-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Job Title</th>
                        <th>HR Email</th>
                        <th>Candidate Email</th>
                        <th>Status</th>
                        <th>Applied On</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr key={app.id}>
                            <td>{app.id}</td>
                            <td>{app.job_details?.title || 'Unknown'}</td>
                            <td>{app.job_details?.hr_email || 'N/A'}</td>
                            <td>{app.candidate_email || app.resume_details?.candidate_email || 'N/A'}</td>
                            <td>
                                <span className={`badge bg-${app.status === 'Shortlisted' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                    {app.status}
                                </span>
                            </td>
                            <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {applications.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center">No applications found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <Pagination>
                    <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                    <Pagination.Item active>{page}</Pagination.Item>
                    <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                </Pagination>
            )}
        </div>
    );
};

export default ManageApplications;
