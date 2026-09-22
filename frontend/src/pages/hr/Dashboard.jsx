import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const HRDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('jobs/hr/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching HR stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    return (
        <div>
            <h2 className="mb-4">HR Dashboard</h2>
            <Row className="g-4 mb-4">
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-primary text-white h-100">
                        <Card.Body>
                            <Card.Title>Total Jobs</Card.Title>
                            <h3>{stats?.total_jobs || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-secondary text-white h-100">
                        <Card.Body>
                            <Card.Title>Applicants</Card.Title>
                            <h3>{stats?.total_applicants || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-warning text-dark h-100">
                        <Card.Body>
                            <Card.Title>Pending</Card.Title>
                            <h3>{stats?.pending || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-info text-white h-100">
                        <Card.Body>
                            <Card.Title>Shortlisted</Card.Title>
                            <h3>{stats?.shortlisted || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-primary text-white h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Card.Body>
                            <Card.Title style={{ fontSize: '0.85rem' }}>Interview</Card.Title>
                            <h3>{stats?.interview_scheduled || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-success text-white h-100">
                        <Card.Body>
                            <Card.Title>Selected</Card.Title>
                            <h3>{stats?.selected || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2}>
                    <Card className="shadow-sm border-0 bg-danger text-white h-100">
                        <Card.Body>
                            <Card.Title>Rejected</Card.Title>
                            <h3>{stats?.rejected || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Card.Title>Recent Activity Overview</Card.Title>
                    <p className="text-muted mt-3">Track and manage your job postings and applicant pipelines directly from this portal.</p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default HRDashboard;
