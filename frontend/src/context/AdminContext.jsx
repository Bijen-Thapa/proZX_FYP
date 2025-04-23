import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AdminContext = createContext();

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token) {
                api.defaults.headers.common['Admin-Authorization'] = `Bearer ${token}`;
                const response = await api.get('/api/admin/verify');
                setAdmin(response.data.admin);
            }
        } catch (err) {
            localStorage.removeItem('adminToken');
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const response = await api.post('/api/admin/login', { email, password });
            const { token, admin } = response.data;
            localStorage.setItem('adminToken', token);
            api.defaults.headers.common['Admin-Authorization'] = `Bearer ${token}`;
            setAdmin(admin);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed');
            return false;
        }
    };

    const adminLogout = async () => {
        try {
            await api.post('/api/admin/logout');
        } finally {
            localStorage.removeItem('adminToken');
            delete api.defaults.headers.common['Admin-Authorization'];
            setAdmin(null);
        }
    };

    const value = {
        admin,
        loading,
        error,
        adminLogin,
        adminLogout,
        setError
    };

    return (
        <AdminContext.Provider value={value}>
            {!loading && children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};