import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import UpdatePage from './pages/UpdatePage.tsx'

// update.yourdreambuilders.in serves the photo-management page instead of the
// marketing site -- same deployment, split by hostname. Also answers on the
// /update path so it works locally and on hosts without the subdomain set up.
const isUpdateSite =
  window.location.hostname.startsWith('update.') || window.location.pathname.startsWith('/update')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isUpdateSite ? <UpdatePage /> : <App />}
  </StrictMode>,
)
