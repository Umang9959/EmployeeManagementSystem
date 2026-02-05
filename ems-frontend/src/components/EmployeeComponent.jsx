import React, { useState, useEffect } from 'react'
import { bulkUploadEmployees, createEmployee, getEmployee, updateEmployee } from '../services/EmployeeService'
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from '../services/AuthStorage'

const EmployeeComponent = () => {

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [countryCode, setCountryCode] = useState('+91')
    const [department, setDepartment] = useState('')
    const [uploadFile, setUploadFile] = useState(null)
    const [uploadResult, setUploadResult] = useState(null)
    const [uploadError, setUploadError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [fileInputKey, setFileInputKey] = useState(0)
    const [redirectCountdown, setRedirectCountdown] = useState(null)

    const {id} = useParams();
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        department: ''
    })

    const navigator = useNavigate();
    const isAdmin = getAuth()?.role === 'ADMIN'

    useEffect(() => {

        if(id){
            getEmployee(id).then((response) => {
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
                setDepartment(response.data.department || '');
                const phoneValue = response.data.phoneNumber || '';
                const codes = ['+91', '+1', '+44', '+61', '+81', '+49', '+971'];
                const matchedCode = codes.find((code) => phoneValue.startsWith(code));
                if (matchedCode) {
                    setCountryCode(matchedCode);
                    setPhoneNumber(phoneValue.replace(matchedCode, ''));
                } else {
                    setCountryCode('+91');
                    setPhoneNumber(phoneValue.replace(/^\+/, ''));
                }
            }).catch(error => {
                console.error(error);
            })
        }

    }, [id])

    useEffect(() => {
        if (redirectCountdown === null) {
            return undefined
        }

        if (redirectCountdown <= 0) {
            navigator('/employees')
            return undefined
        }

        const timer = setTimeout(() => {
            setRedirectCountdown((prev) => (prev === null ? null : prev - 1))
        }, 1000)

        return () => clearTimeout(timer)
    }, [redirectCountdown, navigator])

    useEffect(() => {
        return () => {
            releaseBodyScrollLock()
        }
    }, [])

    function saveOrUpdateEmployee(e){
        e.preventDefault();

        if(validateForm()){

            const employee = {
                firstName,
                lastName,
                email,
                phoneNumber: `${countryCode}${phoneNumber.trim()}`,
                department
            }
            console.log(employee)

            if(id){
                updateEmployee(id, employee).then((response) => {
                    console.log(response.data);
                    navigator('/employees');
                }).catch(error => {
                    if (error?.response?.status === 409) {
                        const message = (error?.response?.data?.message || '').toLowerCase()
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            email: message.includes('email') ? 'Email already taken' : prevErrors.email,
                            phoneNumber: message.includes('phone') ? 'Phone number already exists' : prevErrors.phoneNumber
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
                        const message = (error?.response?.data?.message || '').toLowerCase()
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            email: message.includes('email') ? 'Email already taken' : prevErrors.email,
                            phoneNumber: message.includes('phone') ? 'Phone number already exists' : prevErrors.phoneNumber
                        }));
                    } else {
                        console.error(error);
                    }
                })
            }
        }
    }

    function handleUpload() {
        if (!uploadFile) {
            setUploadError('Please select an Excel file to upload.');
            return;
        }
        setUploading(true);
        setUploadError('');
        setUploadResult(null);

        bulkUploadEmployees(uploadFile)
            .then((response) => {
                const result = response.data;
                setUploadResult(result);
                setUploadFile(null);
                setFileInputKey((prev) => prev + 1);
                if (result?.failureCount === 0) {
                    setRedirectCountdown(5);
                } else {
                    setRedirectCountdown(null);
                }
            })
            .catch((error) => {
                const message = error?.response?.data?.message || 'Upload failed. Please try again.';
                setUploadError(message);
                setRedirectCountdown(null);
            })
            .finally(() => setUploading(false));
    }

    function releaseBodyScrollLock() {
        document.body.classList.remove('modal-open')
        document.body.style.removeProperty('padding-right')
        document.body.style.removeProperty('overflow')
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
    }

    function validateForm(){
        let valid = true;

        const errorsCopy = {... errors}

        const namePattern = /^[a-zA-Z][a-zA-Z\s'-]*$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePatterns = {
            '+91': /^[6-9]\d{9}$/,
            '+1': /^\d{10}$/,
            '+44': /^\d{10,11}$/,
            '+61': /^\d{9}$/,
            '+81': /^\d{9,10}$/,
            '+49': /^\d{10,11}$/,
            '+971': /^\d{9}$/
        };
        const selectedPattern = phonePatterns[countryCode] || /^\d{7,15}$/;

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

        if(phoneNumber.trim()){
            if(!selectedPattern.test(phoneNumber.trim())){
                errorsCopy.phoneNumber = `Enter a valid phone number for ${countryCode}`;
                valid = false;
            } else {
                errorsCopy.phoneNumber = '';
            }
        } else {
            errorsCopy.phoneNumber = 'Phone number is required';
            valid = false;
        }

        if(department.trim()){
            errorsCopy.department = '';
        } else {
            errorsCopy.department = 'Department is required';
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
            {isAdmin && !id && (
                <div className='page-card mb-4'>
                    <div className='page-header'>
                        <div>
                            <h2 className='page-title'>Bulk upload employees</h2>
                            <p className='page-subtitle mb-0'>Upload an Excel file (.xlsx or .xls) with First Name, Last Name, Email, Phone Number, and Department.</p>
                        </div>
                    </div>
                    <div className='d-flex flex-column flex-lg-row gap-3 align-items-lg-center'>
                        <div className='flex-grow-1'>
                            <input
                                key={fileInputKey}
                                className='form-control'
                                type='file'
                                accept='.xlsx,.xls'
                                onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                            />
                        </div>
                        <div className='d-flex gap-2'>
                            <button className='btn btn-primary' type='button' onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                    {uploadError && (
                        <div className='alert alert-danger mt-3 mb-0'>{uploadError}</div>
                    )}
                    {uploadResult && (
                        <div className='alert alert-success mt-3 mb-0'>
                            Uploaded {uploadResult.successCount} of {uploadResult.totalRows} rows. {uploadResult.failureCount} failed.
                            {uploadResult.errors?.length > 0 && (
                                <ul className='mt-2 mb-0'>
                                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                                        <li key={`${error.rowNumber}-${index}`}>Row {error.rowNumber}: {error.message}</li>
                                    ))}
                                    {uploadResult.errors.length > 5 && (
                                        <li>And {uploadResult.errors.length - 5} more errors...</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
            {redirectCountdown !== null && (
                <div className='text-center text-danger fw-semibold mb-4'>
                    Redirecting you to the home page in {redirectCountdown} seconds...
                </div>
            )}
            <div className='page-card'>
                <div className='page-header'>
                    <div>
                        {pageTitle()}
                        <p className='page-subtitle mb-0'>Keep employee details accurate and up to date.</p>
                    </div>
                </div>
                <div>
                    <form>
                        <div className='form-group mb-3'>
                            <label className='form-label'>First Name</label>
                            <input
                                type='text'
                                placeholder='Enter employee first name'
                                name='firstName'
                                value={firstName}
                                className={`form-control ${ errors.firstName ? 'is-invalid': '' }`}
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
                                className={`form-control ${ errors.lastName ? 'is-invalid': '' }`}
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
                                className={`form-control ${ errors.email ? 'is-invalid': '' }`}
                                onChange={(e) => setEmail(e.target.value)}
                            >
                            </input>
                            { errors.email && <div className='invalid-feedback'> { errors.email} </div> }
                        </div>

                        <div className='form-group mb-4'>
                            <label className='form-label'>Phone Number</label>
                            <div className='input-group'>
                                <select
                                    className='form-select form-select-sm'
                                    value={countryCode}
                                    onChange={(event) => setCountryCode(event.target.value)}
                                    style={{ maxWidth: '160px' }}
                                >
                                    <option value='+91'>+91 (IN)</option>
                                    <option value='+1'>+1 (US/CA)</option>
                                    <option value='+44'>+44 (UK)</option>
                                    <option value='+61'>+61 (AU)</option>
                                    <option value='+81'>+81 (JP)</option>
                                    <option value='+49'>+49 (DE)</option>
                                    <option value='+971'>+971 (UAE)</option>
                                </select>
                                <input
                                    type='text'
                                    placeholder='Enter employee phone number'
                                    name='phoneNumber'
                                    value={phoneNumber}
                                    className={`form-control ${ errors.phoneNumber ? 'is-invalid': '' }`}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                >
                                </input>
                            </div>
                            { errors.phoneNumber && <div className='invalid-feedback'> { errors.phoneNumber} </div> }
                        </div>

                        <div className='form-group mb-4'>
                            <label className='form-label'>Department</label>
                            <select
                                className={`form-select ${ errors.department ? 'is-invalid': '' }`}
                                name='department'
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value=''>Select department</option>
                                <option value='Engineering & Tech'>Engineering & Tech</option>
                                <option value='Finance'>Finance</option>
                                <option value='Business Development'>Business Development</option>
                                <option value='CEO & Director'>CEO & Director</option>
                                <option value='HR'>HR</option>
                                <option value='IT & Admin'>IT & Admin</option>
                                <option value='Sales'>Sales</option>
                            </select>
                            { errors.department && <div className='invalid-feedback'> { errors.department} </div> }
                        </div>

                        <div className='d-flex gap-2 justify-content-center'>
                            <button className='btn btn-primary' onClick={saveOrUpdateEmployee} >Save</button>
                            <button className='btn btn-outline-secondary' type='button' onClick={() => navigator('/employees')}>Cancel</button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
  )
}

export default EmployeeComponent