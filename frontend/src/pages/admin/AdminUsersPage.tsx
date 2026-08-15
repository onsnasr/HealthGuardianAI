import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import {
    Search,
    UserX,
    UserCheck,
    Trash2,
    Eye,
    MoreVertical,
    Download,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    isProfileComplete: boolean;
    createdAt: string;
    phoneNumber?: string;
}

export const AdminUsersPage: React.FC = () => {
    const { user: currentUser } = useAuthStore(); // ✅ Récupérer l'utilisateur connecté
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showActionMenu, setShowActionMenu] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, roleFilter, statusFilter, users]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/admin/users');

            // ✅ FILTRE : Exclure l'utilisateur connecté
            const filteredData = response.data.filter((u: User) => u.id !== currentUser?.id);

            setUsers(filteredData);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter === 'ACTIVE') {
            filtered = filtered.filter(user => user.isActive);
        } else if (statusFilter === 'INACTIVE') {
            filtered = filtered.filter(user => !user.isActive);
        }

        setFilteredUsers(filtered);
    };

    const handleToggleActivation = async (userId: number) => {
        try {
            await apiClient.patch(`/admin/users/${userId}/toggle-activation`);
            toast.success('User status updated');
            fetchUsers();
            setShowActionMenu(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await apiClient.delete(`/admin/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
            setShowActionMenu(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const exportToCSV = () => {
        const csv = [
            ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Created At'],
            ...filteredUsers.map(user => [
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.role,
                user.isActive ? 'Active' : 'Inactive',
                new Date(user.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Users exported to CSV');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Manage all users, doctors, and administrators</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-green-700">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">
                        {users.filter(u => u.isActive).length}
                    </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-red-700">Inactive Users</p>
                    <p className="text-2xl font-bold text-red-900">
                        {users.filter(u => !u.isActive).length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-blue-700">Simple Users</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {users.filter(u => u.role === 'SIMPLE_USER').length}
                    </p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="SIMPLE_USER">Simple User</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="ADMIN">Admin</option>
                        <option value="PHARMACY">Pharmacy</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    {/* Export Button */}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={fetchUsers}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        {user.phoneNumber && (
                                            <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                user.role === 'DOCTOR' ? 'bg-green-100 text-green-800' :
                                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'PHARMACY' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                user.isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-gray-600" />
                                            </button>

                                            {showActionMenu === user.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActivation(user.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                                                    >
                                                        {user.isActive ? (
                                                            <>
                                                                <UserX className="w-4 h-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-4 h-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">User Details</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="font-medium text-gray-900">{selectedUser.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium text-gray-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Profile Status</p>
                                <p className="font-medium text-gray-900">{selectedUser.isProfileComplete ? 'Complete' : 'Incomplete'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Joined</p>
                                <p className="font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};