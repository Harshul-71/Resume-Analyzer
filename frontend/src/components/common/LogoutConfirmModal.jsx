import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Reusable logout confirmation dialog.
 *
 * Props:
 *   show        {boolean}  — whether the modal is visible
 *   onCancel    {function} — called when the user clicks Cancel
 *   onConfirm   {function} — called when the user clicks Logout
 */
const LogoutConfirmModal = ({ show, onCancel, onConfirm }) => {
    return (
        <Modal
            show={show}
            onHide={onCancel}
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Confirm Logout</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to logout?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Logout
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LogoutConfirmModal;
