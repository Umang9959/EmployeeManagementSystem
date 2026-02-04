import React, { useState, useEffect } from 'react'
import { createEmployee, getEmployee, updateEmployee } from '../services/EmployeeService'
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeComponent = () => {

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')

    const {id} = useParams();
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    const navigator = useNavigate();

    useEffect(() => {

        if(id){
            getEmployee(id).then((response) => {
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
            }).catch(error => {
                console.error(error);
            })
        }

    }, [id])

    function saveOrUpdateEmployee(e){
        e.preventDefault();

        if(validateForm()){

            const employee = {firstName, lastName, email}
            console.log(employee)

            if(id){
                updateEmployee(id, employee).then((response) => {
                    console.log(response.data);
                    navigator('/employees');
                }).catch(error => {
                    if (error?.response?.status === 409) {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            email: 'Email already taken'
                        }));
                    } else {
                        console.error(error);
                    }
                })
            } else {
                createEmployee(employee).then((response) => {
                    console.log(response.data);
                    navigator('/employees')
                }).catch(error => {
                    if (error?.response?.status === 409) {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            email: 'Email already taken'
                        }));
                    } else {
                        console.error(error);
                    }
                })
            }
        }
    }

    function validateForm(){
        let valid = true;

        const errorsCopy = {... errors}

        const namePattern = /^[a-zA-Z][a-zA-Z\s'-]*$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(firstName.trim()){
            if(!namePattern.test(firstName.trim())){
                errorsCopy.firstName = 'First name can only contain letters and spaces';
                valid = false;
            } else if(firstName.trim().length < 2){
                errorsCopy.firstName = 'First name must be at least 2 characters';
                valid = false;
            } else {
                errorsCopy.firstName = '';
            }
        } else {
            errorsCopy.firstName = 'First name is required';
            valid = false;
        }

        if(lastName.trim()){
            if(!namePattern.test(lastName.trim())){
                errorsCopy.lastName = 'Last name can only contain letters and spaces';
                valid = false;
            } else if(lastName.trim().length < 2){
                errorsCopy.lastName = 'Last name must be at least 2 characters';
                valid = false;
            } else {
                errorsCopy.lastName = '';
            }
        } else {
            errorsCopy.lastName = 'Last name is required';
            valid = false;
        }

        if(email.trim()){
            if(!emailPattern.test(email.trim())){
                errorsCopy.email = 'Enter a valid email address';
                valid = false;
            } else {
                errorsCopy.email = '';
            }
        } else {
            errorsCopy.email = 'Email is required';
            valid = false;
        }

        setErrors(errorsCopy);
        
        return valid;

    }

    function pageTitle(){
        if(id){
            return <h2 className='page-title'>Update Employee</h2>
        }else{
            return <h2 className='page-title'>Add Employee</h2>
        }
    }
  return (
    <div className='row justify-content-center'>
        <div className='col-12 col-lg-7'>
            <div className='card page-card shadow-sm'>
                <div className='card-header bg-white border-0 pt-4 px-4'>
                    {pageTitle()}
                    <p className='page-subtitle mb-0'>Keep employee details accurate and up to date.</p>
                </div>
                <div className='card-body px-4 pb-4'>
                    <form>
                        <div className='form-group mb-3'>
                            <label className='form-label'>First Name</label>
                            <input
                                type='text'
                                placeholder='Enter employee first name'
                                name='firstName'
                                value={firstName}
                                className={`form-control form-control-lg ${ errors.firstName ? 'is-invalid': '' }`}
                                onChange={(e) => setFirstName(e.target.value)}
                            >
                            </input>
                            { errors.firstName && <div className='invalid-feedback'> { errors.firstName} </div> }
                        </div>

                        <div className='form-group mb-3'>
                            <label className='form-label'>Last Name</label>
                            <input
                                type='text'
                                placeholder='Enter employee last name'
                                name='lastName'
                                value={lastName}
                                className={`form-control form-control-lg ${ errors.lastName ? 'is-invalid': '' }`}
                                onChange={(e) => setLastName(e.target.value)}
                            >
                            </input>
                            { errors.lastName && <div className='invalid-feedback'> { errors.lastName} </div> }
                        </div>

                        <div className='form-group mb-4'>
                            <label className='form-label'>Email</label>
                            <input
                                type='text'
                                placeholder='Enter employee email'
                                name='email'
                                value={email}
                                className={`form-control form-control-lg ${ errors.email ? 'is-invalid': '' }`}
                                onChange={(e) => setEmail(e.target.value)}
                            >
                            </input>
                            { errors.email && <div className='invalid-feedback'> { errors.email} </div> }
                        </div>

                        <div className='d-flex gap-2'>
                            <button className='btn btn-primary btn-lg' onClick={saveOrUpdateEmployee} >Save</button>
                            <button className='btn btn-outline-secondary btn-lg' type='button' onClick={() => navigator('/employees')}>Cancel</button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
  )
}

export default EmployeeComponent