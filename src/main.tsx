import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Flag for fail-safe preloader script
(window as unknown as { __MAHEKH_MOUNTED__: boolean }).__MAHEKH_MOUNTED__ = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
