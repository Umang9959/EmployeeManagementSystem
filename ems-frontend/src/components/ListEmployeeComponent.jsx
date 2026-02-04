import React, {useEffect, useState} from 'react'
import { deleteEmployee, listEmployees, searchEmployees } from '../services/EmployeeService'
import { useNavigate } from 'react-router-dom'

const ListEmployeeComponent = () => {

    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const pageSize = 20
    const [employeeToDelete, setEmployeeToDelete] = useState(null)

    const navigator = useNavigate();

    useEffect(() => {
        getAllEmployees(0);
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmedQuery = searchQuery.trim();
            if (!trimmedQuery) {
                getAllEmployees(0);
                return;
            }

            searchEmployees(trimmedQuery, 0, pageSize).then((response) => {
                setEmployees(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(0);
            }).catch(error => {
                console.error(error);
            })
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery])

    function getAllEmployees(page = 0) {
        listEmployees(page, pageSize).then((response) => {
            setEmployees(response.data.content);
            setTotalPages(response.data.totalPages);
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
            setEmployees(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        }).catch(error => {
            console.error(error);
        })
    }

    function handlePageChange(page) {
        if (searchQuery.trim()) {
            handleSearchPage(page);
        } else {
            getAllEmployees(page);
        }
    }

  return (
    <div className='page-card'>
        <div className='page-header'>
            <div>
                <h2 className='page-title'>Employees</h2>
                <p className='page-subtitle'>Manage your team, update records, and keep everything organized.</p>
            </div>
            <button className='btn btn-primary btn-lg shadow-sm' onClick={addNewEmployee}>Add Employee</button>
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
                    <th>Actions</th>
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
    </div>
  )
}

export default ListEmployeeComponent