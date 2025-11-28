import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Clients = ({ token }) => {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientAppointments, setClientAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [token])

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(response.data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientAppointments = async (clientId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/users/${clientId}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClientAppointments(response.data)
      setSelectedClient(clientId)
    } catch (error) {
      console.error('Failed to fetch client appointments:', error)
    }
  }

  if (loading) return <div>Loading clients...</div>

  return (
    <div className="page">
      <h1>Clients</h1>

      <h2>Client List</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.username}</td>
              <td>{client.email}</td>
              <td>{client.phone || 'Not provided'}</td>
              <td>
                <button onClick={() => fetchClientAppointments(client.id)}>
                  View Appointments
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedClient && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Appointment History for Client #{selectedClient}</h2>
          {clientAppointments.length === 0 ? (
            <p>No appointments found for this client.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {clientAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.service_name}</td>
                    <td>{appointment.staff_name}</td>
                    <td>{new Date(appointment.scheduled_time).toLocaleString()}</td>
                    <td>{appointment.status}</td>
                    <td>${appointment.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default Clients