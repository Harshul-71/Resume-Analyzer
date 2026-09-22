import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Badge, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const ManageCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(null);

    const fetchCandidates = async () => {
        try {
            const response = await api.get(`users/admin/candidates/?page=${page}&search=${search}`);
            const data = response.data?.results ?? response.data;
            setCandidates(Array.isArray(data) ? data : []);
            setTotalPages(response.data.count ? Math.ceil(response.data.count / 10) : 1);
        } catch (error) {
            console.error("Error fetching Candidates:", error);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [page, search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleViewDetails = (candidate) => {
        setCurrentCandidate(candidate);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentCandidate(null);
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`users/admin/candidates/${id}/status/`);
            fetchCandidates();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Candidate?")) {
            try {
                await api.delete(`users/admin/candidates/${id}/`);
                fetchCandidates();
            } catch (error) {
                console.error("Error deleting Candidate:", error);
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Candidates</h2>
            </div>

            <InputGroup className="mb-3 w-50">
                <Form.Control
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={handleSearch}
                />
            </InputGroup>

            <Table striped bordered hover responsive className="bg-white shadow-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((cand, index) => (
                        <tr key={cand.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td>{cand.first_name} {cand.last_name}</td>
                            <td>{cand.email}</td>
                            <td>
                                {cand.is_active ? 
                                    <Badge bg="success">Active</Badge> : 
                                    <Badge bg="danger">Blocked</Badge>
                                }
                            </td>
                            <td>{new Date(cand.date_joined).toLocaleDateString()}</td>
                            <td>
                                <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewDetails(cand)}>View Details</Button>
                                <Button 
                                    variant={cand.is_active ? "outline-warning" : "outline-success"} 
                                    size="sm" className="me-2" 
                                    onClick={() => handleToggleStatus(cand.id)}
                                >
                                    {cand.is_active ? "Block" : "Unblock"}
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cand.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                    {candidates.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center">No Candidates found.</td>
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

            {/* View Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Candidate Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentCandidate && (
                        <div>
                            <p><strong>ID:</strong> {currentCandidate.id}</p>
                            <p><strong>First Name:</strong> {currentCandidate.first_name}</p>
                            <p><strong>Last Name:</strong> {currentCandidate.last_name}</p>
                            <p><strong>Email:</strong> {currentCandidate.email}</p>
                            <p><strong>Status:</strong> {currentCandidate.is_active ? "Active" : "Blocked"}</p>
                            <p><strong>Joined:</strong> {new Date(currentCandidate.date_joined).toLocaleString()}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageCandidates;
