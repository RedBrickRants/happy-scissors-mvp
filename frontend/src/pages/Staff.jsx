import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Staff = ({ token }) => {
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [formMode, setFormMode] = useState('create')
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
      if (formMode === 'edit' && editingStaffId) {
        await axios.put(`http://localhost:8000/api/staff/${editingStaffId}/edit/`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        alert('Staff member updated successfully!')
        setFormMode('create')
        setEditingStaffId(null)
      } else {
        await axios.post('http://localhost:8000/api/staff/create/', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        alert('Staff member created successfully!')
      }
      
      // Clear form and refresh staff list
      setFormData({
        username: '',
        email: '',
        password: '',
        expertise: '',
        services: []
      })
      fetchStaff()
      
    } catch (error) {
      console.error('Failed to save staff:', error)
      alert(error.response?.data?.error || 'Error saving staff member')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle checkbox change for services
  const handleServiceCheckboxChange = (e) => {
    const serviceId = parseInt(e.target.value)
    const isChecked = e.target.checked
    
    setFormData(prevFormData => {
      if (isChecked) {
        // Add service ID if checked
        return {
          ...prevFormData,
          services: [...prevFormData.services, serviceId]
        }
      } else {
        // Remove service ID if unchecked
        return {
          ...prevFormData,
          services: prevFormData.services.filter(id => id !== serviceId)
        }
      }
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

  const handleEditStaff = async (staffId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/staff/${staffId}/edit/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const staffData = response.data
      setFormData({
        username: staffData.username,
        email: staffData.email,
        password: '', // Don't show current password
        expertise: staffData.expertise || '',
        services: staffData.services || []
      })
      setEditingStaffId(staffId)
      setFormMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to fetch staff for editing:', error)
      alert('Error loading staff data for editing')
    }
  }

  const handleCancelEdit = () => {
    setFormMode('create')
    setEditingStaffId(null)
    setFormData({
      username: '',
      email: '',
      password: '',
      expertise: '',
      services: []
    })
  }

  if (loading) return <div>Loading staff...</div>

  return (
    <div className="page">
      <h1>Staff Management</h1>

      <h2>{formMode === 'edit' ? 'Edit Staff Member' : 'Create New Staff Member'}</h2>
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
          required={formMode === 'create'}
        />
        <small style={{color: '#666', fontSize: '0.9rem'}}>
          {formMode === 'edit' ? '(Leave blank to keep current password)' : ''}
        </small>
        <input
          type="text"
          name="expertise"
          placeholder="Expertise (e.g., Hair Stylist, Color Specialist)"
          value={formData.expertise}
          onChange={handleChange}
        />
        
        <label>Services:</label>
        <div style={{
          marginBottom: '20px',
          maxHeight: '250px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '0'  // No padding on container, we'll pad the items
        }}>
          {services.map(service => (
            <div key={service.id} style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: formData.services.includes(service.id) ? '#f0f9ff' : 'white'
            }}>
              <input
                type="checkbox"
                id={`service-${service.id}`}
                value={service.id}
                checked={formData.services.includes(service.id)}
                onChange={handleServiceCheckboxChange}
                style={{ marginRight: '12px', width: '18px', height: '18px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#000'  }}>{service.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  ${service.price} • {service.duration} mins
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">
            {formMode === 'edit' ? 'Update Staff Member' : 'Create Staff Member'}
          </button>
          
          {formMode === 'edit' && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
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
            <th>Actions</th>
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
                  onClick={() => handleEditStaff(staffMember.id)}
                  style={{
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  Edit
                </button>
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