import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => setMessage('Backend not reachable'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-blue-600">{message}</h1>
    </div>
  )
}

export default App