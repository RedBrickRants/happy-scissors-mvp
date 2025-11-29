import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Services = ({ token }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    duration_mins: '',
    price: ''
  })

  useEffect(() => {
    fetchServices()
  }, [token])

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
      await axios.post('http://localhost:8000/api/services/create/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Clear form and refresh services list
      setFormData({
        name: '',
        duration_mins: '',
        price: ''
      })
      fetchServices()
      alert('Service created successfully!')
    } catch (error) {
      console.error('Failed to create service:', error)
      alert('Error creating service')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDeleteService = async (serviceId, serviceName) => {
  if (!window.confirm(`Are you sure you want to delete ${serviceName}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/services/${serviceId}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      alert('Service deleted successfully!');
      // Refresh the services list
      fetchServices();
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error}`);
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    alert('Failed to delete service');
  }
};


  if (loading) return <div>Loading services...</div>

  return (
    <div className="page">
      <h1>Service Catalog</h1>

      <h2>Create New Service</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="name"
          placeholder="Service Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="duration_mins"
          placeholder="Duration (minutes)"
          value={formData.duration_mins}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Service</button>
      </form>

      <h2>Services List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Duration (mins)</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.duration}</td>
              <td>${service.price}</td>
              <td>
                <button 
                  onClick={() => handleDeleteService(service.id, service.name)}
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

export default Services