import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentJob, setCurrentJob] = useState({
        id: '', title: '', description: '', location: 'Remote', job_type: 'Full-time', requirements: ''
    });
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            const response = await api.get(`jobs/hr/manage/?page=${page}&search=${search}`);
            const data = response.data?.results ?? response.data;
            setJobs(Array.isArray(data) ? data : []);
            setTotalPages(response.data.count ? Math.ceil(response.data.count / 10) : 1);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleShowModal = (mode, job = { id: '', title: '', description: '', location: 'Remote', job_type: 'Full-time', requirements: '' }) => {
        setModalMode(mode);
        setCurrentJob(job);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('jobs/hr/manage/', currentJob);
            } else {
                await api.put(`jobs/hr/manage/${currentJob.id}/`, currentJob);
            }
            fetchJobs();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving job:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await api.delete(`jobs/hr/manage/${id}/`);
                fetchJobs();
            } catch (error) {
                console.error("Error deleting job:", error);
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Jobs</h2>
                <Button variant="primary" onClick={() => handleShowModal('add')}>Post New Job</Button>
            </div>

            <InputGroup className="mb-3 w-50">
                <Form.Control
                    placeholder="Search by title, location, or type..."
                    value={search}
                    onChange={handleSearch}
                />
            </InputGroup>

            <Table striped bordered hover responsive className="bg-white shadow-sm">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>{job.location}</td>
                            <td>{job.job_type}</td>
                            <td>{new Date(job.created_at).toLocaleDateString()}</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => navigate(`/hr/jobs/${job.id}/applications`)}>View Applicants</Button>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal('edit', job)}>Edit</Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(job.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                    {jobs.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">No Jobs found.</td>
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

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Post New Job' : 'Edit Job'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Job Title</Form.Label>
                            <Form.Control required type="text" value={currentJob.title} onChange={e => setCurrentJob({...currentJob, title: e.target.value})} />
                        </Form.Group>
                        <div className="d-flex gap-3 mb-3">
                            <Form.Group className="flex-grow-1">
                                <Form.Label>Location</Form.Label>
                                <Form.Control required type="text" value={currentJob.location} onChange={e => setCurrentJob({...currentJob, location: e.target.value})} />
                            </Form.Group>
                            <Form.Group className="flex-grow-1">
                                <Form.Label>Job Type</Form.Label>
                                <Form.Select value={currentJob.job_type} onChange={e => setCurrentJob({...currentJob, job_type: e.target.value})}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control required as="textarea" rows={4} value={currentJob.description} onChange={e => setCurrentJob({...currentJob, description: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Requirements</Form.Label>
                            <Form.Control as="textarea" rows={3} value={currentJob.requirements} onChange={e => setCurrentJob({...currentJob, requirements: e.target.value})} />
                        </Form.Group>
                        
                        <Button variant="primary" type="submit" className="w-100">
                            {modalMode === 'add' ? 'Publish Job' : 'Update Job'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageJobs;
