import React, { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Staff from './pages/Staff'
import Services from './pages/Services'
import Clients from './pages/Clients'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setCurrentPage('login')
  }

  if (!token && currentPage !== 'login') {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {token && (
        <nav className="navbar">
          <div className="brand">
            <span>Happy Scissors Salon</span>
          </div>
          <div className="nav-buttons">
            <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentPage('appointments')}>Appointments</button>
            <button onClick={() => setCurrentPage('staff')}>Staff</button>
            <button onClick={() => setCurrentPage('services')}>Services</button>
            <button onClick={() => setCurrentPage('clients')}>Clients</button>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}
      
      {currentPage === 'login' && <Login onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <Dashboard token={token} />}
      {currentPage === 'appointments' && <Appointments token={token} />}
      {currentPage === 'staff' && <Staff token={token} />}
      {currentPage === 'services' && <Services token={token} />}
      {currentPage === 'clients' && <Clients token={token} />}
    </div>
  )
}

export default App