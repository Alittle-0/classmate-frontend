import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Gọi vào Gateway (Port 8080)
    axios.get('http://localhost:8080/api/v1/identity/health')
      .then(response => {
        setMessage(response.data)
      })
      .catch(error => {
        console.error("Lỗi:", error)
        setMessage("Không kết nối được Backend!")
      })
  }, [])

  return (
    <div style={{ padding: '50px' }}>
      <h1>Test Microservices</h1>
      <h2>Kết quả từ Backend:</h2>
      <p style={{ color: 'blue', fontWeight: 'bold' }}>{message}</p>
    </div>
  )
}

export default App