import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Services = ({ token }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [formData, setFormData] = useState({ name: '', duration_mins: '', price: '' })

  useEffect(() => { fetchServices() }, [token])

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/services/')
      setServices(response.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formMode === 'edit' && editingServiceId) {
        await axios.put(`http://localhost:8000/api/services/${editingServiceId}/edit/`, {
          name: formData.name, duration: formData.duration_mins, price: formData.price
        }, { headers: { Authorization: `Bearer ${token}` } })
        alert('Service updated!')
        setFormMode('create')
        setEditingServiceId(null)
      } else {
        await axios.post('http://localhost:8000/api/services/create/', {
          name: formData.name, duration: formData.duration_mins, price: formData.price
        }, { headers: { Authorization: `Bearer ${token}` } })
        alert('Service created!')
      }
      setFormData({ name: '', duration_mins: '', price: '' })
      fetchServices()
    } catch (error) {
      console.error('Failed to save:', error)
      alert(error.response?.data?.error || 'Error saving')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Delete ${serviceName}?`)) return
    try {
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        alert('Service deleted!')
        fetchServices()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete')
    }
  }

  const handleEditService = (serviceId) => {
    const serviceToEdit = services.find(s => s.id === serviceId)
    if (serviceToEdit) {
      setFormData({ 
        name: serviceToEdit.name, 
        duration_mins: serviceToEdit.duration_mins, 
        price: serviceToEdit.price 
      })
      setEditingServiceId(serviceId)
      setFormMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="page">
      <h1>Service Catalog</h1>
      <h2>{formMode === 'edit' ? 'Edit Service' : 'Create Service'}</h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="duration_mins" placeholder="Duration (mins)" value={formData.duration_mins} onChange={handleChange} required />
        <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <button type="submit">{formMode === 'edit' ? 'Update' : 'Create'}</button>
        {formMode === 'edit' && (
          <button type="button" onClick={() => { 
            setFormMode('create'); setEditingServiceId(null); setFormData({ name: '', duration_mins: '', price: '' }) 
          }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }}>
            Cancel
          </button>
        )}
      </form>
      <h2>Services List</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Duration</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.duration} min</td>
              <td>${service.price}</td>
              <td>
                <button onClick={() => handleEditService(service.id)} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                <button onClick={() => handleDeleteService(service.id, service.name)} style={{ background: '#f56565', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Services