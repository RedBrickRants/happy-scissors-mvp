import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Staff from './pages/Staff'
import Services from './pages/Services'
import Clients from './pages/Clients'
import ClientRegistration from './pages/ClientRegistration'
import ClientDashboard from './pages/ClientDashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check user type when token changes
  useEffect(() => {
    const checkUserType = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/users/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            setUserType(userData.user_type)
            // If we just logged in and were on login page, go to dashboard
            if (currentPage === 'login') {
              setCurrentPage('dashboard')
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }
      setLoading(false)
    }

    checkUserType()
  }, [token, currentPage])

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    // Don't set currentPage here - let the useEffect handle it after we get user type
  }

  const handleLogout = () => {
    setToken(null)
    setUserType(null)
    localStorage.removeItem('token')
    setCurrentPage('login')
  }

  const handleRegistrationSuccess = () => {
    setCurrentPage('login')
  }

  // Show loading while checking user type
  if (loading && token) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  // If no token, show public pages (login/register)
  if (!token) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="brand">
            <span>Happy Scissors Salon</span>
          </div>
          <div className="nav-buttons">
            <button 
              onClick={() => setCurrentPage('login')}
              className={currentPage === 'login' ? 'active' : ''}
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className={currentPage === 'register' ? 'active' : ''}
            >
              Sign Up
            </button>
          </div>
        </nav>

        <main>
          {currentPage === 'login' && <Login onLogin={handleLogin} />}
          {currentPage === 'register' && <ClientRegistration onRegistrationSuccess={handleRegistrationSuccess} />}
        </main>
      </div>
    )
  }

 // If user is a CLIENT, show client portal
if (userType === 'client') {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span>Happy Scissors Salon - Client Portal</span>
        </div>
        <div className="nav-buttons">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'active' : ''}
          >
            My Appointments
          </button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      
      <main>
        {/* This ensures ClientDashboard is always shown for clients */}
        <ClientDashboard token={token} />
      </main>
    </div>
  )
}

  // If user is ADMIN or STAFF, show admin portal
  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span>Happy Scissors Salon - Admin Portal</span>
        </div>
        <div className="nav-buttons">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('appointments')}
            className={currentPage === 'appointments' ? 'active' : ''}
          >
            Appointments
          </button>
          <button 
            onClick={() => setCurrentPage('staff')}
            className={currentPage === 'staff' ? 'active' : ''}
          >
            Staff
          </button>
          <button 
            onClick={() => setCurrentPage('services')}
            className={currentPage === 'services' ? 'active' : ''}
          >
            Services
          </button>
          <button 
            onClick={() => setCurrentPage('clients')}
            className={currentPage === 'clients' ? 'active' : ''}
          >
            Clients
          </button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      
      <main>
        {currentPage === 'dashboard' && <Dashboard token={token} />}
        {currentPage === 'appointments' && <Appointments token={token} />}
        {currentPage === 'staff' && <Staff token={token} />}
        {currentPage === 'services' && <Services token={token} />}
        {currentPage === 'clients' && <Clients token={token} />}
      </main>
    </div>
  )
}

export default App