import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './pages/Login'
import { Navigate, Route, Routes } from 'react-router-dom'
import { userState } from './context/UserContext'
import Admin from './panels/admin'
import ProtectedRoute from './utils/ProtectedRoute'

function App() {

  const { user } = userState();

  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path='/' element={user?.role ? <Navigate to={`/dashboard`} /> : <Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin role='admin' />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
