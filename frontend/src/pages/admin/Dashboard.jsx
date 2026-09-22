import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_hr: 0,
        total_candidates: 0,
        total_jobs: 0,
        total_resumes: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('users/admin/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="mb-4">Admin Dashboard</h2>
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-primary text-white">
                        <Card.Body>
                            <Card.Title>Total HR</Card.Title>
                            <h3>{stats.total_hr}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-success text-white">
                        <Card.Body>
                            <Card.Title>Total Candidates</Card.Title>
                            <h3>{stats.total_candidates}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-warning text-white">
                        <Card.Body>
                            <Card.Title>Total Jobs</Card.Title>
                            <h3>{stats.total_jobs}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-info text-white">
                        <Card.Body>
                            <Card.Title>Total Resumes</Card.Title>
                            <h3>{stats.total_resumes}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Card.Title>Analytics Overview</Card.Title>
                    <p className="text-muted mt-3">Welcome to the Admin Portal. Here you can monitor system activity, manage HR accounts, and oversee candidate profiles.</p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminDashboard;
