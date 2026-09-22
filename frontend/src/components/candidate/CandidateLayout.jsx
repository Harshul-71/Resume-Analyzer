import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './CandidateLayout.css';

const CandidateLayout = () => {
    return (
        <div className="candidate-layout">
            <Sidebar />
            <main className="candidate-main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CandidateLayout;
