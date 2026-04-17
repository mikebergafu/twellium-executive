import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import {useTheme} from "../../context/ThemeContext";
import RefreshSettings from '../ui/RefreshSettings';

const TopBar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [ setOpenSubmenus] = useState({ production: true, configs: false, definitions: false });

    const toggleSubmenu = (key) => {
        setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <header className="navbar-header">
            <div className="page-container topbar-menu">
                <div className="d-flex align-items-center gap-2">


                    <Link to="/dashboard" className="logo">

                        <span className="logo-light">
                            <span className="logo-lg"><img src="/assets/img/logo.svg" alt="logo"/></span>
                            <span className="logo-sm"><img src="/assets/img/logo-small.svg"
                                                           alt="small logo"/></span>
                        </span>


                        <span className="logo-dark">
                            <span className="logo-lg"><img src="/assets/img/logo-white.svg"
                                                           alt="dark logo"/></span>
                        </span>
                    </Link>


                    <Link id="mobile_btn" className="mobile-btn" to="#sidebar">
                        <i className="ti ti-menu-deep fs-24"></i>
                    </Link>

                    <button className="sidenav-toggle-btn btn border-0 p-0" id="toggle_btn2" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <i className="ti ti-arrow-bar-to-right"></i>
                    </button>

                    <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">

                        <div className="input-icon position-relative me-2">
                            <input type="text" className="form-control" placeholder="Search Keyword"/>
                            <span className="input-icon-addon d-inline-flex p-0 header-search-icon"><i
                                className="ti ti-command"></i></span>
                        </div>

                    </div>

                </div>

                <div className="d-flex align-items-center">

                    {/* Mobile Search */}
                    <div className="header-item d-flex d-lg-none me-2">
                        <button className="topbar-link btn" type="button">
                            <i className="ti ti-search fs-16"></i>
                        </button>
                    </div>

                    {/* Fullscreen */}
                    <div className="header-item">
                        <div className="dropdown me-2">
                            <button className="btn topbar-link btnFullscreen" type="button" onClick={() => {
                                if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                                else document.exitFullscreen();
                            }}>
                                <i className="ti ti-maximize"></i>
                            </button>
                        </div>
                    </div>

                    {/* Light/Dark Mode */}
                    <div className="header-item d-none d-sm-flex me-2">
                        <button className="topbar-link btn" type="button" onClick={toggleTheme}>
                            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} fs-16`}></i>
                        </button>
                    </div>

                    {/* Auto-Refresh Settings */}
                    <div className="header-item d-none d-sm-flex me-2">
                        <RefreshSettings />
                    </div>

                    {/* Pages Dropdown */}
                    <div className="header-item d-none d-sm-flex">
                        <div className="dropdown me-2">
                            <button className="btn topbar-link topbar-teal-link dropdown-toggle drop-arrow-none" type="button" data-bs-toggle="dropdown">
                                <i className="ti ti-layout-grid-add"></i>
                            </button>
                            <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                                <Link to="/dashboard" className="dropdown-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <span className="d-flex mb-1 fw-semibold text-dark">Overview</span>
                                            <span className="fs-13">Dashboard overview</span>
                                        </div>
                                        <i className="ti ti-chevron-right-pipe text-dark"></i>
                                    </div>
                                </Link>
                                <Link to="/dashboard/production" className="dropdown-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <span className="d-flex mb-1 fw-semibold text-dark">Production</span>
                                            <span className="fs-13">View production reports</span>
                                        </div>
                                        <i className="ti ti-chevron-right-pipe text-dark"></i>
                                    </div>
                                </Link>
                                <Link to="/dashboard/production/stoppages" className="dropdown-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <span className="d-flex mb-1 fw-semibold text-dark">Stoppages</span>
                                            <span className="fs-13">View stoppage logs</span>
                                        </div>
                                        <i className="ti ti-chevron-right-pipe text-dark"></i>
                                    </div>
                                </Link>
                                <Link to="/dashboard/inventory/products" className="dropdown-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <span className="d-flex mb-1 fw-semibold text-dark">Inventory</span>
                                            <span className="fs-13">View products</span>
                                        </div>
                                        <i className="ti ti-chevron-right-pipe text-dark"></i>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Users */}
                    <div className="header-item d-none d-sm-flex">
                        <div className="dropdown me-2">
                            <Link to="/dashboard/users" className="btn topbar-link topbar-indigo-link">
                                <i className="ti ti-users"></i>
                            </Link>
                        </div>
                    </div>

                    {/* Formulas */}
                    <div className="header-item d-none d-sm-flex">
                        <div className="dropdown me-2">
                            <Link to="/dashboard/formulas" className="btn topbar-link topbar-warning-link">
                                <i className="ti ti-calculator"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="header-line"></div>

                    {/* Notifications */}
                    <div className="header-item">
                        <div className="dropdown me-2">
                            <button className="topbar-link btn dropdown-toggle drop-arrow-none" type="button" data-bs-toggle="dropdown" data-bs-offset="0,24">
                                <i className="ti ti-bell-check fs-16 animate-ring"></i>
                            </button>
                            <div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg" style={{minHeight: 120}}>
                                <div className="p-2 border-bottom">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="m-0 fs-16 fw-semibold">Notifications</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-muted mb-0">No new notifications</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
                        <button className="topbar-link dropdown-toggle drop-arrow-none position-relative" type="button" data-bs-toggle="dropdown" data-bs-offset="0,22">
                                <span className="d-flex align-items-center justify-content-center rounded-1 bg-secondary text-white" style={{width:38, height:38}}>
                                    <i className="ti ti-circle-filled ti-user  fs-18"></i>
                                </span>
                            <span className="online text-success">
                                    <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"></i>
                                </span>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                            <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                                    <span className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white flex-shrink-0" style={{width:42, height:42}}>
                                        <i className="fa-solid fa-user fs-18"></i>
                                    </span>
                                <div className="ms-2">
                                    <p className="fw-medium text-dark mb-0">{user?.username || 'Admin'}</p>
                                    <span className="d-block fs-13">Administrator</span>
                                </div>
                            </div>

                            <a href="#" className="dropdown-item">
                                <i className="ti ti-user-circle me-1 align-middle"></i>
                                <span className="align-middle">Profile Settings</span>
                            </a>

                            <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                                <label className="form-check-label" htmlFor="notify"><i className="ti ti-bell me-1"></i>Notifications</label>
                                <input className="form-check-input me-0" type="checkbox" role="switch" id="notify" />
                            </div>

                            <a href="#" className="dropdown-item">
                                <i className="ti ti-help-circle me-1 align-middle"></i>
                                <span className="align-middle">Help & Support</span>
                            </a>

                            <a href="#" className="dropdown-item">
                                <i className="ti ti-settings me-1 align-middle"></i>
                                <span className="align-middle">Settings</span>
                            </a>

                            <div className="pt-2 mt-2 border-top">
                                <button onClick={logout} className="dropdown-item text-danger w-100 text-start">
                                    <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                                    <span className="align-middle">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default TopBar;