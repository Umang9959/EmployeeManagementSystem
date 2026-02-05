import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/AuthService'
import { setAuth } from '../services/AuthStorage'

const LoginComponent = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [apiError, setApiError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const navigator = useNavigate()

  function validateForm() {
    let valid = true
    const errorsCopy = { ...errors }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email.trim()) {
      if (!emailPattern.test(email.trim())) {
        errorsCopy.email = 'Enter a valid email address'
        valid = false
      } else {
        errorsCopy.email = ''
      }
    } else {
      errorsCopy.email = 'Email is required'
      valid = false
    }

    if (password.trim()) {
      if (password.trim().length < 6) {
        errorsCopy.password = 'Password must be at least 6 characters'
        valid = false
      } else {
        errorsCopy.password = ''
      }
    } else {
      errorsCopy.password = 'Password is required'
      valid = false
    }

    if (isSignUp) {
      if (confirmPassword.trim()) {
        if (confirmPassword.trim() !== password.trim()) {
          errorsCopy.confirmPassword = 'Passwords do not match'
          valid = false
        } else {
          errorsCopy.confirmPassword = ''
        }
      } else {
        errorsCopy.confirmPassword = 'Please re-enter your password'
        valid = false
      }
    } else {
      errorsCopy.confirmPassword = ''
    }

    setErrors(errorsCopy)
    return valid
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (validateForm()) {
      setApiError('')
      const action = isSignUp ? registerUser : loginUser
      action({ email, password }).then((response) => {
        if (isSignUp) {
          setIsSignUp(false)
          setPassword('')
          setConfirmPassword('')
          setApiError('Account created. Please sign in.')
          return
        }

        setAuth({
          email: response?.data?.email || email,
          role: response?.data?.role,
          token: response?.data?.token
        })
        navigator('/employees')
      }).catch((error) => {
        if (error?.response?.status === 401) {
          setApiError('Invalid email or password')
        } else if (error?.response?.status === 409) {
          setApiError('Email already taken')
        } else {
          setApiError('Something went wrong. Please try again.')
        }
      })
    }
  }

  return (
    <div className='row justify-content-center mt-6' style={{ marginTop: '6rem' }}>
      <div className='col-12 col-md-8 col-lg-5'>
        <div className='page-card login-card'>
          
          <div className='page-header d-flex justify-content-center text-center'>
            <div className='w-100'>
              <h2 className='page-title text-center'>
                Welcome to <span className='brand-gradient'>WorkSphere</span>
              </h2>
              <p className='page-subtitle mb-0 text-center'>Sign in to access your dashboard.</p>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              {apiError && (
                <div
                  className={`alert ${apiError === 'Account created. Please sign in.' ? 'alert-success' : 'alert-danger'}`}
                  role='alert'
                >
                  {apiError}
                </div>
              )}
              <div className='form-group mb-3'>
                <label className='form-label'>Email</label>
                <input
                  type='email'
                  placeholder='Enter your email'
                  name='email'
                  value={email}
                  className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email && <div className='invalid-feedback'>{errors.email}</div>}
              </div>

              <div className='form-group mb-4'>
                <label className='form-label'>Password</label>
                <div className='password-field'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isSignUp ? 'Enter password' : 'Enter your password'}
                    name='password'
                    value={password}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className='password-toggle'
                    type='button'
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
                        <path d='M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7S2.73 15.89 1 12c1.73-3.89 6-7 11-7m0 2c-3.87 0-7.2 2.1-8.74 5 1.54 2.9 4.87 5 8.74 5s7.2-2.1 8.74-5c-1.54-2.9-4.87-5-8.74-5m0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5' />
                      </svg>
                    ) : (
                      <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
                        <path d='M2.1 3.51 3.51 2.1l18.39 18.39-1.41 1.41-3.25-3.25A11.8 11.8 0 0 1 12 19c-5 0-9.27-3.11-11-7a12.4 12.4 0 0 1 4.2-4.97L2.1 3.51m9.9 5.99 3.5 3.5a2.5 2.5 0 0 0-3.5-3.5m-6.1-1.7A10.5 10.5 0 0 0 3.26 12c1.54 2.9 4.87 5 8.74 5 1.44 0 2.8-.28 4.03-.78l-1.62-1.62a4.5 4.5 0 0 1-6.03-6.03l-2.48-2.48Z' />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <div className='invalid-feedback'>{errors.password}</div>}
              </div>

              {isSignUp && (
                <div className='form-group mb-4'>
                  <label className='form-label'>Re-enter Password</label>
                  <div className='password-field'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Re-enter password'
                      name='confirmPassword'
                      value={confirmPassword}
                      className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <button
                      className='password-toggle'
                      type='button'
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
                          <path d='M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7S2.73 15.89 1 12c1.73-3.89 6-7 11-7m0 2c-3.87 0-7.2 2.1-8.74 5 1.54 2.9 4.87 5 8.74 5s7.2-2.1 8.74-5c-1.54-2.9-4.87-5-8.74-5m0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5' />
                        </svg>
                      ) : (
                        <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
                          <path d='M2.1 3.51 3.51 2.1l18.39 18.39-1.41 1.41-3.25-3.25A11.8 11.8 0 0 1 12 19c-5 0-9.27-3.11-11-7a12.4 12.4 0 0 1 4.2-4.97L2.1 3.51m9.9 5.99 3.5 3.5a2.5 2.5 0 0 0-3.5-3.5m-6.1-1.7A10.5 10.5 0 0 0 3.26 12c1.54 2.9 4.87 5 8.74 5 1.44 0 2.8-.28 4.03-.78l-1.62-1.62a4.5 4.5 0 0 1-6.03-6.03l-2.48-2.48Z' />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className='invalid-feedback'>{errors.confirmPassword}</div>}
                </div>
              )}

              <div className='d-grid'>
                <button className='btn btn-primary btn-lg' type='submit'>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </div>
            </form>
            <div className='text-center mt-3'>
              {isSignUp ? (
                <button
                  type='button'
                  className='btn btn-link'
                  onClick={() => setIsSignUp(false)}
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  type='button'
                  className='btn btn-link'
                  onClick={() => setIsSignUp(true)}
                >
                  Create new account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent
