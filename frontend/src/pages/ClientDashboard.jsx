import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ClientDashboard = ({ token }) => {
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    service: '',
    staff: '',
    scheduled_time: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchServices()
    fetchStaff()
  }, [token])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/appointments/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Appointments data:', response.data)
      setAppointments(response.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      alert('Error loading appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/services/')
      setServices(response.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/staff/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStaff(response.data)
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/appointments/make/', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      alert('Appointment booked successfully!')
      setShowBookingForm(false)
      setBookingData({ service: '', staff: '', scheduled_time: '', notes: '' })
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Failed to book appointment:', error)
      alert(error.response?.data?.error || 'Error booking appointment')
    }
  }

  if (loading) return <div className="page">Loading appointments...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Appointments</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowBookingForm(true)}
        >
          Book New Appointment
        </button>
      </div>

      {/* Booking Form */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Book New Appointment</h2>
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Service</label>
                <select 
                  value={bookingData.service} 
                  onChange={(e) => setBookingData({...bookingData, service: e.target.value})}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Staff Member</label>
                <select 
                  value={bookingData.staff} 
                  onChange={(e) => setBookingData({...bookingData, staff: e.target.value})}
                  required
                >
                  <option value="">Select a staff member</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} - {staffMember.expertise}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingData.scheduled_time}
                  onChange={(e) => setBookingData({...bookingData, scheduled_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  placeholder="Any special requests or notes..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Book Appointment
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h3>No appointments yet</h3>
          <p>Book your first appointment using the button above!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Staff</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.service_name}</td>
                  <td>{appointment.staff_name}</td>
                  <td>{new Date(appointment.scheduled_time).toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: appointment.status === 'booked' ? '#3B82F6' : '#10B981',
                      color: 'white',
                      fontSize: '0.8rem'
                    }}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>{appointment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard