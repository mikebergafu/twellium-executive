import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from '../context/AuthContext';

const Login = React.lazy(() => import('../pages/auth/Login'));
const DashboardLayout = React.lazy(() => import('../components/layout/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('../pages/dashboard/Overview'));

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
};

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <React.Suspense fallback={<div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading...</div>}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<DashboardOverview />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </React.Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
};
