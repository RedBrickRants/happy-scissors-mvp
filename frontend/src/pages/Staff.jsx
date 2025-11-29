import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Staff = ({ token }) => {
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    expertise: '',
    services: []
  })

  useEffect(() => {
    fetchStaff()
    fetchServices()
  }, [token])

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/staff/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStaff(response.data)
    } catch (error) {
      console.error('Failed to fetch staff:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/staff/create/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Clear form and refresh staff list
      setFormData({
        username: '',
        email: '',
        password: '',
        expertise: '',
        services: []
      })
      fetchStaff()
      alert('Staff member created successfully!')
    } catch (error) {
      console.error('Failed to create staff:', error)
      alert('Error creating staff member')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleServiceChange = (e) => {
    const options = e.target.options
    const selectedServices = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedServices.push(parseInt(options[i].value))
      }
    }
    setFormData({
      ...formData,
      services: selectedServices
    })
  }

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/staff/${staffId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Staff member deleted successfully!');
        // Refresh the staff list
        fetchStaff();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  if (loading) return <div>Loading staff...</div>

  return (
    <div className="page">
      <h1>Staff Management</h1>

      <h2>Create New Staff Member</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="expertise"
          placeholder="Expertise (e.g., Hair Stylist, Color Specialist)"
          value={formData.expertise}
          onChange={handleChange}
        />
        
        <label>Services (select multiple with Ctrl/Cmd):</label>
        <select multiple name="services" onChange={handleServiceChange} style={{height: '100px'}}>
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
        <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple services</small>
        
        <button type="submit">Create Staff Member</button>
      </form>

      <h2>Staff List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Expertise</th>
            <th>Services</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((staffMember) => (
            <tr key={staffMember.id}>
              <td>{staffMember.name}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.expertise}</td>
              <td>{staffMember.services.join(', ')}</td>
              <td>{staffMember.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                  <button 
                    onClick={() => handleDeleteStaff(staffMember.id, staffMember.name)}
                    style={{
                      background: '#f56565',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Staff