import React, { useState } from 'react'
import axios from 'axios'

const ClientRegistration = ({ onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',           // REMOVED: username
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedUsername, setGeneratedUsername] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      // Send registration request WITHOUT username
      const response = await axios.post('http://localhost:8000/api/users/register/', {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      })

      // Show success modal with generated username
      setGeneratedUsername(response.data.generated_username)
      setShowSuccessModal(true)
      
      // Clear form
      setFormData({
        email: '', 
        password: '', 
        confirmPassword: '',
        first_name: '', 
        last_name: '', 
        phone: ''
      })
      
    } catch (error) {
      console.error('Registration failed:', error)
      setError(error.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setGeneratedUsername('')
    
    // If callback provided, call it
    if (onRegistrationSuccess) {
      onRegistrationSuccess()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUsername)
      .then(() => {
        alert('Username copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }

  return (
    <div className="page">
      <div className="auth-container">
        <h1>Create Client Account</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
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
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '1rem' }}>
            <em>Note: Your username will be automatically generated from your name</em>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{ marginTop: 0, color: '#10B981' }}> Account Created Successfully!</h2>
            
            <p>Your username has been automatically generated:</p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '6px',
              margin: '1.5rem 0',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#8B5CF6' }}>
                {generatedUsername}
              </strong>
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: '#fef3c7', 
              padding: '1rem', 
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, color: '#92400E' }}>
                 <strong>Important:</strong> Please save this username. 
                You'll need it along with your password to log in.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Go to Login
              </button>
              
              <button
                onClick={closeSuccessModal}
                style={{
                  flex: 1,
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientRegistration