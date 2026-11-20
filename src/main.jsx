import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { normalizeIndexPath } from './lib/path'

const { pathname, search, hash } = window.location
const clean = normalizeIndexPath(pathname)
if (clean !== pathname) window.history.replaceState(null, '', clean + search + hash)

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
