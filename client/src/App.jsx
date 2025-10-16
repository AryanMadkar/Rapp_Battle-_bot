import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from './pages/Regester'
import Login from './pages/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/signup" element={<Register />} />
        <Route path="/signin" element={<Login />} />

      </Routes>
    </>
  )
}

export default App
