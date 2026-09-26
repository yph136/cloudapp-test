import React from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import Todos from '../pages/Todos'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Todos />
  </React.StrictMode>
)
