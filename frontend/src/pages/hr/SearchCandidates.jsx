import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Table, Form, InputGroup, Button, Spinner,
    Badge, Pagination, Card, Modal,
} from 'react-bootstrap';
import api from '../../services/api';

// ── constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: '',                    label: 'All Candidates' },
    { value: 'Pending',             label: 'Pending' },
    { value: 'Shortlisted',         label: 'Shortlisted' },
    { value: 'Interview Scheduled', label: 'Interview Scheduled' },
    { value: 'Selected',            label: 'Selected' },
    { value: 'Rejected',            label: 'Rejected' },
];

const STATUS_BADGE = {
    'Pending':             { bg: 'warning', text: 'dark'  },
    'Shortlisted':         { bg: 'info',    text: 'white' },
    'Interview Scheduled': { bg: 'primary', text: 'white' },
    'Selected':            { bg: 'success', text: 'white' },
    'Rejected':            { bg: 'danger',  text: 'white' },
};

// ── main component ────────────────────────────────────────────────────────────

const SearchCandidates = () => {
    const [inputValue, setInputValue]     = useState('');
    const [query, setQuery]               = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [candidates, setCandidates]     = useState([]);
    const [count, setCount]               = useState(0);
    const [page, setPage]                 = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState(null);

    // View Profile modal
    const [profileCandidate, setProfileCandidate] = useState(null);

    const debounceRef = useRef(null);

    // ── fetch ─────────────────────────────────────────────────────────────

    const fetchCandidates = useCallback(async (searchQuery, pageNum, statusVal) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: pageNum, page_size: PAGE_SIZE });
            if (searchQuery) params.set('q', searchQuery);
            if (statusVal)   params.set('status', statusVal);

            const res  = await api.get(`users/hr/search-candidates/?${params.toString()}`);
            const data = res.data?.results ?? res.data;
            setCandidates(Array.isArray(data) ? data : []);
            setCount(res.data?.count ?? (Array.isArray(data) ? data.length : 0));
            setTotalPages(res.data?.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1);
        } catch {
            setError('Failed to fetch candidates. Please try again.');
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCandidates('', 1, ''); }, [fetchCandidates]);

    // ── handlers ─────────────────────────────────────────────────────────

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatusFilter(val);
        setPage(1);
        fetchCandidates(query, 1, val);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const trimmed = val.trim();
            setQuery(trimmed);
            setPage(1);
            fetchCandidates(trimmed, 1, statusFilter);
        }, 300);
    };

    const handleClear = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setInputValue('');
        setQuery('');
        setPage(1);
        fetchCandidates('', 1, statusFilter);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchCandidates(query, newPage, statusFilter);
    };

    // ── pagination ────────────────────────────────────────────────────────

    const buildPagination = () => {
        const items = [];
        const delta = 2;
        const left  = Math.max(2, page - delta);
        const right = Math.min(totalPages - 1, page + delta);

        items.push(
            <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={page === 1} />,
            <Pagination.Prev  key="prev"  onClick={() => handlePageChange(page - 1)} disabled={page === 1} />,
            <Pagination.Item  key={1}     active={page === 1} onClick={() => handlePageChange(1)}>1</Pagination.Item>,
        );
        if (left > 2)  items.push(<Pagination.Ellipsis key="el1" disabled />);
        for (let n = left; n <= right; n++) {
            items.push(
                <Pagination.Item key={n} active={page === n} onClick={() => handlePageChange(n)}>{n}</Pagination.Item>
            );
        }
        if (right < totalPages - 1) items.push(<Pagination.Ellipsis key="el2" disabled />);
        if (totalPages > 1) {
            items.push(
                <Pagination.Item key={totalPages} active={page === totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }
        items.push(
            <Pagination.Next key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />,
            <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />,
        );
        return items;
    };

    // ── render ────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0">Search Candidates</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                        Search by name, email, phone, skills, education, experience, or job title
                    </p>
                </div>
                {!loading && (
                    <Badge bg="secondary" style={{ fontSize: '0.85rem' }}>
                        {count} candidate{count !== 1 ? 's' : ''} found
                    </Badge>
                )}
            </div>

            {/* Search bar + Status filter */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="py-3">
                    <div className="d-flex gap-3 align-items-start flex-wrap">
                        <div className="flex-grow-1">
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                                <Form.Control
                                    style={{ borderLeft: 'none', boxShadow: 'none' }}
                                    placeholder='Try "Python", "MBA", "+1 555", "React Developer"…'
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                                {inputValue && (
                                    <Button variant="outline-secondary" onClick={handleClear} title="Clear search">
                                        ✕ Clear
                                    </Button>
                                )}
                            </InputGroup>
                        </div>

                        <div style={{ minWidth: '190px' }}>
                            <Form.Select value={statusFilter} onChange={handleStatusChange} aria-label="Filter by status">
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>

                    {/* Search field hints */}
                    <div className="mt-2 d-flex flex-wrap gap-2">
                        {['Name', 'Email', 'Phone', 'Skills', 'Education', 'Experience', 'Job Title'].map(field => (
                            <span key={field} style={{
                                fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b',
                                borderRadius: '12px', padding: '2px 10px', border: '1px solid #e2e8f0',
                            }}>
                                {field}
                            </span>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* ── Table ── */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Job Title</th>
                                <th>Status</th>
                                <th>Applied On</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Searching…
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-muted">
                                        <div style={{ fontSize: '2rem' }}>🔍</div>
                                        <div className="mt-2 fw-semibold">No candidates found.</div>
                                        {(query || statusFilter) && (
                                            <div style={{ fontSize: '0.85rem' }}>
                                                {query && statusFilter
                                                    ? <>No <strong>{statusFilter}</strong> candidates matching <strong>"{query}"</strong>.</>
                                                    : query
                                                        ? <>No results for <strong>"{query}"</strong>. Try a different keyword.</>
                                                        : <>No candidates with status <strong>{statusFilter}</strong>.</>
                                                }
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                candidates.map(candidate => {
                                    const recStatus  = candidate.recruitment_status || 'Pending';
                                    const badgeStyle = STATUS_BADGE[recStatus] || { bg: 'secondary', text: 'white' };

                                    return (
                                        <tr key={candidate.id}>
                                            {/* Candidate Name */}
                                            <td className="fw-semibold">
                                                {candidate.full_name || candidate.email}
                                            </td>

                                            {/* Email */}
                                            <td style={{ color: '#475569' }}>{candidate.email}</td>

                                            {/* Phone */}
                                            <td>{candidate.phone || '—'}</td>

                                            {/* Job Title */}
                                            <td style={{ color: '#374151' }}>
                                                {candidate.latest_job_title || '—'}
                                            </td>

                                            {/* Status badge */}
                                            <td>
                                                <Badge bg={badgeStyle.bg} text={badgeStyle.text}>
                                                    {recStatus}
                                                </Badge>
                                            </td>

                                            {/* Applied On */}
                                            <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {candidate.applied_on || '—'}
                                            </td>

                                            {/* Action */}
                                            <td>
                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                    {/* View Profile */}
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => setProfileCandidate(candidate)}
                                                    >
                                                        View Profile
                                                    </Button>

                                                    {/* View Resume */}
                                                    {candidate.resume_url ? (
                                                        <a
                                                            href={`http://localhost:8000/media/${candidate.resume_url}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn btn-outline-secondary btn-sm"
                                                        >
                                                            View Resume
                                                        </a>
                                                    ) : (
                                                        <Button variant="outline-secondary" size="sm" disabled>
                                                            No Resume
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Page {page} of {totalPages} &nbsp;·&nbsp; {count} total
                    </span>
                    <Pagination className="mb-0" size="sm">
                        {buildPagination()}
                    </Pagination>
                </div>
            )}

            {/* ── View Profile Modal ── */}
            <Modal show={!!profileCandidate} onHide={() => setProfileCandidate(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Candidate Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {profileCandidate && (
                        <div>
                            <p><strong>Name:</strong> {profileCandidate.full_name}</p>
                            <p><strong>Email:</strong> {profileCandidate.email}</p>
                            <p><strong>Phone:</strong> {profileCandidate.phone || '—'}</p>
                            <p><strong>Job Applied:</strong> {profileCandidate.latest_job_title || '—'}</p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <Badge
                                    bg={(STATUS_BADGE[profileCandidate.recruitment_status] || {}).bg || 'secondary'}
                                    text={(STATUS_BADGE[profileCandidate.recruitment_status] || {}).text || 'white'}
                                >
                                    {profileCandidate.recruitment_status || 'Pending'}
                                </Badge>
                            </p>
                            <p><strong>Applied On:</strong> {profileCandidate.applied_on || '—'}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setProfileCandidate(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SearchCandidates;
