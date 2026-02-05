import React, {useEffect, useState} from 'react'
import { deleteAllEmployees, deleteEmployee, listEmployees, searchEmployees } from '../services/EmployeeService'
import { useNavigate } from 'react-router-dom'
import { getAuth, isAuthenticated } from '../services/AuthStorage'

const ListEmployeeComponent = () => {

    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const pageSize = 20
    const [employeeToDelete, setEmployeeToDelete] = useState(null)
    const [deleteAllInput, setDeleteAllInput] = useState('')
    const [deleteAllError, setDeleteAllError] = useState('')
    const [deletingAll, setDeletingAll] = useState(false)

    const navigator = useNavigate();
    const isAdmin = getAuth()?.role === 'ADMIN'

    useEffect(() => {
        getAllEmployees(0);
    }, [])

    useEffect(() => {
        if (!isAuthenticated()) {
            return undefined
        }

        const handlePopState = () => {
            const modalElement = document.getElementById('logoutModal')
            if (modalElement && window.bootstrap?.Modal) {
                const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement)
                modal.show()
                window.history.pushState(null, '', window.location.href)
            } else {
                window.history.pushState(null, '', window.location.href)
            }
        }

        window.history.pushState(null, '', window.location.href)
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmedQuery = searchQuery.trim();
            if (!trimmedQuery) {
                getAllEmployees(0);
                return;
            }

            searchEmployees(trimmedQuery, 0, pageSize).then((response) => {
                const { content, totalPages } = normalizePageResponse(response, pageSize);
                setEmployees(content);
                setTotalPages(totalPages);
                setCurrentPage(0);
            }).catch(error => {
                console.error(error);
            })
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery])

    function getAllEmployees(page = 0) {
        listEmployees(page, pageSize).then((response) => {
            const { content, totalPages } = normalizePageResponse(response, pageSize);
            setEmployees(content);
            setTotalPages(totalPages);
            setCurrentPage(page);
        }).catch(error => {
            console.error(error);
        })
    }

    function clearSearch() {
        setSearchQuery('');
        getAllEmployees(0);
    }
    function addNewEmployee(){
        navigator('/add-employee')
    }

    function updateEmployee(id) {
        navigator(`/edit-employee/${id}`)
    }

    function removeEmployee(id){
        deleteEmployee(id).then((response) =>{
            if (searchQuery.trim()) {
                handleSearchPage(currentPage)
            } else {
                getAllEmployees(currentPage);
            }
        }).catch(error => {
            console.error(error);
        })
    }

    function confirmDeleteEmployee() {
        if (!employeeToDelete) {
            return
        }
        removeEmployee(employeeToDelete.id)
        setEmployeeToDelete(null)
    }

    function handleSearchPage(page) {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            getAllEmployees(page);
            return;
        }

        searchEmployees(trimmedQuery, page, pageSize).then((response) => {
            const { content, totalPages } = normalizePageResponse(response, pageSize);
            setEmployees(content);
            setTotalPages(totalPages);
            setCurrentPage(page);
        }).catch(error => {
            console.error(error);
        })
    }

    function normalizePageResponse(response, fallbackSize) {
        const data = response?.data || {};
        const content = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
        const pageMeta = data.page || {};
        const totalElements = typeof data.totalElements === 'number'
            ? data.totalElements
            : (typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : content.length);
        const size = typeof data.size === 'number' && data.size > 0
            ? data.size
            : (typeof pageMeta.size === 'number' && pageMeta.size > 0 ? pageMeta.size : fallbackSize);
        const computedPages = Math.max(1, Math.ceil(totalElements / size));
        const apiTotalPages = typeof data.totalPages === 'number'
            ? data.totalPages
            : (typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 0);
        const totalPages = Math.max(computedPages, apiTotalPages);
        return { content, totalPages };
    }

    function handlePageChange(page) {
        if (searchQuery.trim()) {
            handleSearchPage(page);
        } else {
            getAllEmployees(page);
        }
    }


    function resetDeleteAllState() {
        setDeleteAllInput('');
        setDeleteAllError('');
        setDeletingAll(false);
    }

    function handleDeleteAllConfirm() {
        if (deleteAllInput.trim() !== 'Delete all employees') {
            setDeleteAllError('Type "Delete all employees" to confirm.');
            return;
        }
        setDeletingAll(true);
        setDeleteAllError('');

        deleteAllEmployees()
            .then(() => {
                resetDeleteAllState();
                closeModal('deleteAllEmployeesModal');
                getAllEmployees(0);
            })
            .catch((error) => {
                const message = error?.response?.data?.message || 'Failed to delete employees. Please try again.';
                setDeleteAllError(message);
            })
            .finally(() => setDeletingAll(false));
    }

    function closeModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            return;
        }

        if (window.bootstrap?.Modal) {
            const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.hide();
            return;
        }

        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    }

  return (
    <div className='page-card'>
        <div className='page-header'>
            <div>
                <h2 className='page-title'>All Employees</h2>
                <p className='page-subtitle'>
                    {isAdmin
                        ? 'Manage your team, update records, and keep everything organized.'
                        : 'Browse employee details and stay up to date.'}
                </p>
            </div>
            
        </div>
        <div className='d-flex flex-wrap gap-2 align-items-center mb-3'>
            <div className={`animated-search ${searchQuery ? 'is-active' : ''}`}>
                <span className='animated-search__icon' aria-hidden='true'>
                    <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
                        <path d='M11 4a7 7 0 0 1 5.65 11.22l3.57 3.58a1 1 0 0 1-1.42 1.41l-3.58-3.57A7 7 0 1 1 11 4m0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10' />
                    </svg>
                </span>
                <input
                    type='text'
                    className='animated-search__input'
                    placeholder='Search by id, first name, last name, email, or phone'
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>
            <button className='btn btn-outline-secondary' onClick={clearSearch}>Clear</button>
            {isAdmin && (
                <button
                    className='btn btn-outline-danger ms-auto'
                    type='button'
                    data-bs-toggle='modal'
                    data-bs-target='#deleteAllEmployeesModal'
                    onClick={resetDeleteAllState}
                >
                    Delete All
                </button>
            )}
        </div>
        <div className='table-responsive'>
        <table className='table table-hover align-middle table-theme'>
            <thead>
                <tr>
                    <th>Employee Id</th>
                    <th>Employee First Name</th>
                    <th>Employee Last Name</th>
                    <th>Employee Email Id</th>
                    <th>Employee Phone</th>
                    <th>Department</th>
                    {isAdmin && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {
                    employees.map(employee => 
                        <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>{employee.firstName}</td>
                            <td>{employee.lastName}</td>
                            <td>{employee.email}</td>
                            <td>{employee.phoneNumber}</td>
                            <td>{employee.department}</td>
                            {isAdmin && (
                                <td>
                                    <div className='d-flex gap-2 flex-wrap'>
                                        <button className='btn btn-outline-primary btn-sm' onClick={() => updateEmployee(employee.id)}>Update</button>
                                        <button
                                            className='btn btn-outline-danger btn-sm'
                                            type='button'
                                            data-bs-toggle='modal'
                                            data-bs-target='#deleteEmployeeModal'
                                            onClick={() => setEmployeeToDelete({ id: employee.id, name: `${employee.firstName} ${employee.lastName}` })}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>)
                }
            </tbody>
        </table>
        </div>
        {totalPages > 1 && (
            <nav className='d-flex justify-content-center mt-3'>
                <ul className='pagination pagination-sm mb-0'>
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <button className='page-link' onClick={() => handlePageChange(currentPage - 1)}>
                            Prev
                        </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
                            <button className='page-link' onClick={() => handlePageChange(index)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                        <button className='page-link' onClick={() => handlePageChange(currentPage + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        )}
        {isAdmin && (
            <div className='modal fade' id='deleteEmployeeModal' tabIndex='-1' aria-hidden='true'>
                <div className='modal-dialog modal-dialog-centered'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Confirm delete</h5>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div className='modal-body'>
                            {employeeToDelete?.name
                                ? `Are you sure you want to delete ${employeeToDelete.name}?`
                                : 'Are you sure you want to delete this employee?'}
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-outline-secondary' data-bs-dismiss='modal'>Cancel</button>
                            <button
                                type='button'
                                className='btn btn-danger'
                                data-bs-dismiss='modal'
                                onClick={confirmDeleteEmployee}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {isAdmin && (
            <div className='modal fade' id='deleteAllEmployeesModal' tabIndex='-1' aria-hidden='true'>
                <div className='modal-dialog modal-dialog-centered'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title text-danger'>Delete All Employees</h5>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div className='modal-body'>
                            <p className='mb-3'>This action cannot be undone. To confirm, type <strong>Delete all employees</strong> below.</p>
                            <input
                                type='text'
                                className={`form-control ${deleteAllError ? 'is-invalid' : ''}`}
                                value={deleteAllInput}
                                onChange={(event) => setDeleteAllInput(event.target.value)}
                                onPaste={(event) => event.preventDefault()}
                                onCopy={(event) => event.preventDefault()}
                                onCut={(event) => event.preventDefault()}
                                placeholder='Type here to confirm'
                            />
                            {deleteAllError && <div className='invalid-feedback'>{deleteAllError}</div>}
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-outline-secondary' data-bs-dismiss='modal'>Cancel</button>
                            <button
                                type='button'
                                className='btn btn-danger'
                                onClick={handleDeleteAllConfirm}
                                disabled={deletingAll}
                            >
                                {deletingAll ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default ListEmployeeComponent