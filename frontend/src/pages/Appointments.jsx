import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Appointments = ({ token }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAppointments()
  }, [token, selectedDate])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/appointments/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAppointments(response.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/appointments/${appointmentId}/`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Failed to update appointment:', error)
    }
  }

  if (loading) return <div>Loading appointments...</div>

  return (
    <div className="page">
      <h1>Appointments</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Date: </label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Client</th>
            <th>Service</th>
            <th>Staff</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{new Date(appointment.date).toLocaleDateString()}</td>
              <td>{new Date(appointment.scheduled_time).toLocaleTimeString()}</td>
              <td>{appointment.client_name}</td>
              <td>{appointment.service_name}</td>
              <td>{appointment.staff}</td>
              <td>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </td>
              <td>
                <select 
                  value={appointment.status} 
                  onChange={(e) => updateStatus(appointment.id, e.target.value)}
                >
                  <option value="booked">Booked</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Appointments