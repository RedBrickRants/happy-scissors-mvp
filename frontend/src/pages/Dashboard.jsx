import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [token])

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (!stats) return <div>Failed to load dashboard</div>

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <p className="stat-value">{stats.today_appointments_count}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Revenue</h3>
          <p className="stat-value">${stats.today_revenue}</p>
        </div>
        <div className="stat-card">
          <h3>Total Staff</h3>
          <p className="stat-value">{stats.total_staff}</p>
        </div>
        <div className="stat-card">
          <h3>Total Services</h3>
          <p className="stat-value">{stats.total_services}</p>
        </div>
      </div>

      <h2>Recent Appointments</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stats.appointments_sample.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.client_name}</td>
              <td>{appointment.service_name}</td>
              <td>{new Date(appointment.scheduled_time).toLocaleString()}</td>
              <td>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard