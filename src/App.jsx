import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './pages/Login'
import { Navigate, Route, Routes } from 'react-router-dom'
import { userState } from './context/UserContext'
import Admin from './panels/admin'
import ProtectedRoute from './protecttedRoute/ProtectedRoute'
import Loader from './utils/Loader'

function App() {

  const { user, loading } = userState();

  const [count, setCount] = useState(0);

  return (
    <>
      {/* {loading && <Loader />} */}
      <Routes>
        <Route path='/' element={user?.role ? <Navigate to={`/dashboard`} /> : <Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Admin role={user?.role} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
