import './App.css'
import EmployeeComponent from './components/EmployeeComponent'
import HeaderComponent from './components/HeaderComponent'
import ListEmployeeComponent from './components/ListEmployeeComponent'
import LoginComponent from './components/LoginComponent'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/AuthStorage'

const RequireAuth = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to='/login' replace />
  }
  return children
}

function App() {

  return (
    <>
      <BrowserRouter>
        <div className='app-shell'>
          <HeaderComponent />
          <main className='app-main'>
            <div className='container py-4'>
              <Routes>
                {/* // http://localhost:3000 */}
                <Route path='/' element={<Navigate to='/login' replace />} />
                {/* // http://localhost:3000/login */}
                <Route path='/login' element={<LoginComponent />} />
                {/* // http://localhost:3000/employees */}
                <Route
                  path='/employees'
                  element={
                    <RequireAuth>
                      <ListEmployeeComponent />
                    </RequireAuth>
                  }
                />
                {/* // http://localhost:3000/add-employee */}
                <Route
                  path='/add-employee'
                  element={
                    <RequireAuth>
                      <EmployeeComponent />
                    </RequireAuth>
                  }
                />

                {/* // http://localhost:3000/edit-employee/1 */}
                <Route
                  path='/edit-employee/:id'
                  element={
                    <RequireAuth>
                      <EmployeeComponent />
                    </RequireAuth>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
