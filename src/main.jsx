import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style/style.scss'
import RouterCustom from './router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterCustom />
  </StrictMode>,
)
