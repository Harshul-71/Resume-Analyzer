import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Badge, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const ManageHR = () => {
    const [hrs, setHrs] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentHr, setCurrentHr] = useState({ id: '', first_name: '', last_name: '', email: '', password: '' });

    const fetchHRs = async () => {
        try {
            const response = await api.get(`users/admin/hr/?page=${page}&search=${search}`);
            const data = response.data?.results ?? response.data;
            setHrs(Array.isArray(data) ? data : []);
            setTotalPages(response.data.count ? Math.ceil(response.data.count / 10) : 1);
        } catch (error) {
            console.error("Error fetching HRs:", error);
        }
    };

    useEffect(() => {
        fetchHRs();
    }, [page, search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleShowModal = (mode, hr = { id: '', first_name: '', last_name: '', email: '', password: '' }) => {
        setModalMode(mode);
        setCurrentHr(hr);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('users/admin/hr/', currentHr);
            } else {
                const { password, ...updateData } = currentHr;
                await api.put(`users/admin/hr/${currentHr.id}/`, updateData);
            }
            fetchHRs();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving HR:", error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`users/admin/hr/${id}/status/`);
            fetchHRs();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this HR?")) {
            try {
                await api.delete(`users/admin/hr/${id}/`);
                fetchHRs();
            } catch (error) {
                console.error("Error deleting HR:", error);
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage HR</h2>
                <Button variant="primary" onClick={() => handleShowModal('add')}>Add HR</Button>
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hrs.map((hr, index) => (
                        <tr key={hr.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td>{hr.first_name} {hr.last_name}</td>
                            <td>{hr.email}</td>
                            <td>
                                {hr.is_active ? 
                                    <Badge bg="success">Active</Badge> : 
                                    <Badge bg="danger">Inactive</Badge>
                                }
                            </td>
                            <td>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal('edit', hr)}>Edit</Button>
                                <Button 
                                    variant={hr.is_active ? "outline-warning" : "outline-success"} 
                                    size="sm" className="me-2" 
                                    onClick={() => handleToggleStatus(hr.id)}
                                >
                                    {hr.is_active ? "Deactivate" : "Activate"}
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(hr.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                    {hrs.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">No HRs found.</td>
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Add HR' : 'Edit HR'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control required type="text" value={currentHr.first_name} onChange={e => setCurrentHr({...currentHr, first_name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control required type="text" value={currentHr.last_name} onChange={e => setCurrentHr({...currentHr, last_name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control required type="email" value={currentHr.email} onChange={e => setCurrentHr({...currentHr, email: e.target.value})} disabled={modalMode === 'edit'} />
                        </Form.Group>
                        {modalMode === 'add' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control required type="password" value={currentHr.password} onChange={e => setCurrentHr({...currentHr, password: e.target.value})} />
                            </Form.Group>
                        )}
                        <Button variant="primary" type="submit" className="w-100">
                            {modalMode === 'add' ? 'Create HR' : 'Update HR'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageHR;
