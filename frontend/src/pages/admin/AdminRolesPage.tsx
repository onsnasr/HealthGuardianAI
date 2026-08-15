import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';
import {
    Shield,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Save,
    AlertCircle,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Role {
    id: number;
    name: string;
    description?: string;
    canBeDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export const AdminRolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        filterRoles();
    }, [searchQuery, roles]);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/admin/roles');
            setRoles(response.data);
        } catch (error) {
            toast.error('Failed to load roles');
        } finally {
            setIsLoading(false);
        }
    };

    const filterRoles = () => {
        if (searchQuery) {
            const filtered = roles.filter(role =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                role.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredRoles(filtered);
        } else {
            setFilteredRoles(roles);
        }
    };

    const handleCreateRole = async () => {
        if (!formData.name.trim()) {
            toast.error('Role name is required');
            return;
        }

        try {
            await apiClient.post('/admin/roles', formData);
            toast.success('Role created successfully!');
            setShowCreateModal(false);
            setFormData({ name: '', description: '' });
            fetchRoles();
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to create role');
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedRole || !formData.name.trim()) {
            toast.error('Role name is required');
            return;
        }

        try {
            await apiClient.put(`/admin/roles/${selectedRole.id}`, formData);
            toast.success('Role updated successfully!');
            setShowEditModal(false);
            setSelectedRole(null);
            setFormData({ name: '', description: '' });
            fetchRoles();
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to update role');
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (!role.canBeDeleted) {
            toast.error('System roles cannot be deleted');
            return;
        }

        if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            try {
                await apiClient.delete(`/admin/roles/${role.id}`);
                toast.success('Role deleted successfully!');
                fetchRoles();
            } catch (error: any) {
                toast.error(error.response?.data || 'Failed to delete role');
            }
        }
    };

    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || ''
        });
        setShowEditModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading roles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
                    <p className="text-gray-600">Manage system roles and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Role
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600">Total Roles</p>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-purple-700">System Roles</p>
                    <p className="text-2xl font-bold text-purple-900">
                        {roles.filter(r => !r.canBeDeleted).length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-blue-700">Custom Roles</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {roles.filter(r => r.canBeDeleted).length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search roles by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                                    {role.canBeDeleted ? <Shield className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <div className="flex gap-2">
                                    {!role.canBeDeleted && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                            System
                                        </span>
                                    )}
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Edit role"
                                    >
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </button>
                                    {role.canBeDeleted && (
                                        <button
                                            onClick={() => handleDeleteRole(role)}
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete role"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{role.name}</h3>

                            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                                {role.description || 'No description provided'}
                            </p>

                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Created:</span>
                                    <span>{new Date(role.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Updated:</span>
                                    <span>{new Date(role.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No roles found</p>
                    </div>
                )}
            </div>

            {/* Create Role Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900">Create New Role</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            placeholder="MANAGER"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            placeholder="Describe the role's purpose..."
                                        />
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-medium mb-1">Role Naming Convention</p>
                                            <p className="text-blue-700">Use uppercase letters with underscores for consistency (e.g., SUPER_ADMIN, CONTENT_MANAGER)</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateRole}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            <Save className="w-4 h-4" />
                                            Create Role
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Role Modal */}
            <AnimatePresence>
                {showEditModal && selectedRole && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900">Edit Role</h2>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            disabled={!selectedRole.canBeDeleted}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="MANAGER"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            placeholder="Describe the role's purpose..."
                                        />
                                    </div>

                                    {!selectedRole.canBeDeleted && (
                                        <div className="bg-yellow-50 rounded-lg p-4 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-yellow-900">
                                                <p className="font-medium">System Role</p>
                                                <p className="text-yellow-700">System roles cannot have their names changed</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateRole}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            <Save className="w-4 h-4" />
                                            Update Role
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};