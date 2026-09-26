import React from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import Users from '../pages/Users'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Users />
  </React.StrictMode>
)
