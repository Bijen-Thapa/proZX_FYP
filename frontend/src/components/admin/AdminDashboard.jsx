import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

function AdminDashboard() {
    const { admin, adminLogout } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                    <p className="text-sm text-gray-400 mt-1">{admin?.adminname}</p>
                </div>
                <nav className="mt-8">
                    <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-700">
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700">
                        Users Management
                    </Link>
                    <Link to="/admin/posts" className="block px-4 py-2 hover:bg-gray-700">
                        Content Management
                    </Link>
                    <Link to="/admin/artists" className="block px-4 py-2 hover:bg-gray-700">
                        Artist Verification
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow">
                    <div className="px-4 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;