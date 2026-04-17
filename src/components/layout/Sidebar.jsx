import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (window.bootstrap) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(el => new window.bootstrap.Tooltip(el));
        }
    }, []);

    return (
        <div className="sidebar" id="sidebar">
            <div className="sidebar-logo">
                <div>
                    <Link to="/dashboard" className="logo logo-normal">
                        <img src="/logo.jpeg" width={100} alt="Logo" />
                    </Link>
                    <Link to="/dashboard" className="logo-small">
                        <img src="/logo.jpeg" width={100} alt="Logo" />
                    </Link>
                    <Link to="/dashboard" className="dark-logo">
                        <img src="/logo.jpeg" width={100} alt="Logo" />
                    </Link>
                </div>
                <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn">
                    <i className="ti ti-arrow-bar-to-left"></i>
                </button>
                <button className="sidebar-close" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <i className="ti ti-x align-middle"></i>
                </button>
            </div>
            <div className="sidebar-inner" data-simplebar>
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        <li className="menu-title"><span>Main Menu</span></li>
                        <li>
                            <ul>
                                <li>
                                    <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                                        <i className="ti ti-dashboard"></i>
                                        <span>Overview</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
