import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    useEffect(() => {
        if (window.bootstrap) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(el => new window.bootstrap.Tooltip(el));
        }
    }, []);

    return (
        <div className="main-wrapper">
            {!isFullscreen && <TopBar/>}
            {!isFullscreen && <Sidebar/>}
            <div className={isFullscreen ? '' : 'page-wrapper'}>
                <div className={isFullscreen ? 'p-0' : 'content pb-0'}>
                    <Outlet />
                </div>
                {!isFullscreen && (
                <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
                    <p className="mb-md-0 mb-1">
                        Copyright © {new Date().getFullYear()} <span className="link-primary">Twellium</span>
                    </p>
                    <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
                        <a href="#" onClick={(e) => e.preventDefault()}>About</a>
                        <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
                        <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
                    </div>
                </footer>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
