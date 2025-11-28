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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Services