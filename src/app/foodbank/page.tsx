'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

// Function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : undefined
}

// Function to set a cookie with form data
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export default function FoodBankForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    orphansCount: '',
    foodBankLocation: '',
    missionStatement: '',
  })
  
  const [submitted, setSubmitted] = useState(false)

  // Load form data from cookies when the component mounts
  useEffect(() => {
    const savedData = getCookie('foodBankData')
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    toast.success('Form submitted successfully!')

    // Store form data in cookies
    setCookie('foodBankData', JSON.stringify(formData))

    // Simulate form submission logic (e.g., API call)
    setSubmitted(true) // Trigger conditional navigation
    
    // Navigate to the home page using window.location
    window.location.href = '/collect' // Redirects the user to the homepage

    // Reset form after submission
    setFormData({
      name: '',
      contact: '',
      orphansCount: '',
      foodBankLocation: '',
      missionStatement: '',
    })
  }

  // Check if form data exists in cookies
  const savedData = getCookie('foodBankData')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-8">Food Bank Information Form</h1>

        {savedData ? (
          // Show the registered data if it exists in cookies
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-6">Registered Food Bank Information</h2>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 border text-lg font-medium text-gray-700">Field</th>
                  <th className="px-4 py-2 border text-lg font-medium text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(JSON.parse(savedData)).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-4 py-2 border text-gray-600">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                    <td className="px-4 py-2 border text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Show the form if no data is saved in cookies
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">
                Food Bank Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter food bank name"
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-lg font-semibold text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter contact information (e.g., phone or email)"
                required
              />
            </div>

            <div>
              <label htmlFor="orphansCount" className="block text-lg font-semibold text-gray-700 mb-2">
                Number of Orphans Served
              </label>
              <input
                type="number"
                id="orphansCount"
                name="orphansCount"
                value={formData.orphansCount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter the number of orphans"
                required
              />
            </div>

            <div>
              <label htmlFor="foodBankLocation" className="block text-lg font-semibold text-gray-700 mb-2">
                Food Bank Location
              </label>
              <input
                type="text"
                id="foodBankLocation"
                name="foodBankLocation"
                value={formData.foodBankLocation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter food bank location"
                required
              />
            </div>

            <div>
              <label htmlFor="missionStatement" className="block text-lg font-semibold text-gray-700 mb-2">
                Mission Statement
              </label>
              <textarea
                id="missionStatement"
                name="missionStatement"
                value={formData.missionStatement}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter your food bank's mission statement"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white font-semibold text-xl rounded-md hover:bg-purple-700 transition duration-300"
            >
              Submit Information
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

