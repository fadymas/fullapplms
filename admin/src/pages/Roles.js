// src/pages/teacher/Roles.jsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import RolesTable from '../components/RolesTable';
import RoleModal from '../components/RoleModal';
import DeleteRoleModal from '../components/DeleteRoleModal';
import Pagination from '../components/Pagination';
import { rolesData, roleOptions } from '../utils/rolesData';
import { 
    FaDownload, 
    FaPlus, 
    FaSearch,
    FaFilter,
    FaUserShield
} from 'react-icons/fa';
import '../styles/roles.css';
import '../styles/modals.css';

const Roles = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [roles, setRoles] = useState(rolesData);
    const [filteredRoles, setFilteredRoles] = useState(rolesData);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const itemsPerPage = 5;

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });

        // تصفية الأدوار
        let filtered = roles;
        
        if (searchTerm) {
            filtered = filtered.filter(role =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredRoles(filtered);
        setCurrentPage(1);
    }, [searchTerm, roles]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleAddRole = () => {
        setSelectedRole(null);
        setShowAddModal(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setShowEditModal(true);
    };

    const handleDeleteRole = (role) => {
        setRoleToDelete(role);
        setShowDeleteModal(true);
    };

    const handleSaveRole = (roleData) => {
        if (selectedRole) {
            // تعديل دور موجود
            setRoles(prevRoles =>
                prevRoles.map(role =>
                    role.id === selectedRole.id ? { 
                        ...role, 
                        ...roleData, 
                        id: selectedRole.id,
                        usersCount: selectedRole.usersCount
                    } : role
                )
            );
        } else {
            // إضافة دور جديد
            const newRole = {
                ...roleData,
                id: roles.length + 1,
                usersCount: 0
            };
            setRoles(prevRoles => [...prevRoles, newRole]);
        }
    };

    const handleConfirmDelete = () => {
        if (roleToDelete) {
            setRoles(prevRoles => prevRoles.filter(role => role.id !== roleToDelete.id));
            setShowDeleteModal(false);
            setRoleToDelete(null);
        }
    };

    const handleExport = () => {
        // محاكاة تصدير البيانات
        const dataStr = JSON.stringify(filteredRoles, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'الأدوار.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const indexOfLastRole = currentPage * itemsPerPage;
    const indexOfFirstRole = indexOfLastRole - itemsPerPage;
    const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);

    return (
        <div className={`roles-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}>
            <Header 
                sidebarCollapsed={sidebarCollapsed} 
                toggleSidebar={toggleSidebar}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
            
            <Sidebar 
                collapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                activePage="roles"
                darkMode={darkMode}
            />
            
            <div className="main-content">
                <div className="container mt-5 pt-4">
                    <div className="d-flex align-items-center mb-4">
                        <FaUserShield className="text-primary me-2" style={{ fontSize: '1.5rem' }} />
                        <h5 className="fw-bold mb-0">إدارة الأدوار</h5>
                    </div>

                    {/* Search and Actions Section */}
                    <div className="search-role-section">
                        <div className="row mb-3">
                            <div className="col-lg-8 col-md-6 col-12">
                                <div className="d-flex flex-column flex-md-row gap-2">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaSearch />
                                        </span>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="البحث عن الأدوار..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-12 mt-2 mt-md-0">
                                <div className="d-flex flex-column flex-sm-row gap-2">
                                    <button 
                                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                                        onClick={handleExport}
                                    >
                                        <FaDownload className="ms-1" />
                                        تصدير
                                    </button>
                                    <button 
                                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                        onClick={handleAddRole}
                                    >
                                        <FaPlus className="ms-1" />
                                        إضافة دور
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roles Table */}
                    <RolesTable 
                        roles={currentRoles}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        darkMode={darkMode}
                    />

                    {/* Pagination */}
                    {filteredRoles.length > 0 && (
                        <div className="pagination-roles-container">
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                darkMode={darkMode}
                            />
                        </div>
                    )}

                    {/* No Results Message */}
                    {filteredRoles.length === 0 && (
                        <div className="text-center py-5">
                            <h5 className="text-muted">لا توجد نتائج</h5>
                            <p className="text-muted">جرب مصطلحات بحث مختلفة أو أضف أدوار جديدة</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="row mt-4">
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h3 className="text-primary">{roles.length}</h3>
                                    <p className="text-muted mb-0">إجمالي الأدوار</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h3 className="text-success">
                                        {roles.reduce((sum, role) => sum + role.usersCount, 0)}
                                    </h3>
                                    <p className="text-muted mb-0">إجمالي المستخدمين</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h3 className="text-warning">
                                        {Math.round(roles.reduce((sum, role) => sum + role.usersCount, 0) / roles.length) || 0}
                                    </h3>
                                    <p className="text-muted mb-0">متوسط المستخدمين لكل دور</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />

            {/* Modals */}
            <RoleModal 
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                handleSave={handleSaveRole}
                modalType="add"
                roleData={null}
                roleOptions={roleOptions}
                darkMode={darkMode}
            />

            <RoleModal 
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                handleSave={handleSaveRole}
                modalType="edit"
                roleData={selectedRole}
                roleOptions={roleOptions}
                darkMode={darkMode}
            />

            <DeleteRoleModal 
                show={showDeleteModal}
                handleClose={() => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                }}
                handleDelete={handleConfirmDelete}
                roleName={roleToDelete?.name}
                darkMode={darkMode}
            />
        </div>
    );
};

export default Roles;