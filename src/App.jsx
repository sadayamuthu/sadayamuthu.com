import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Research from './pages/Research'
import ProjectPage from './pages/ProjectPage'
import Publications from './pages/Publications'
import Service from './pages/Service'
import Experience from './pages/Experience'
import Coverage from './pages/Coverage'
import { data } from './data/site'
import NotFound from './pages/NotFound'
import { getMeta } from './lib/meta'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/research" element={<Research />} />
      <Route path="/research/:slug" element={<ProjectPage />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/service" element={<Service />} />
      <Route path="/experience" element={<Experience />} />
      {data.coverage.length > 0 && <Route path="/coverage" element={<Coverage />} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = getMeta(pathname).title
  }, [pathname])
  return null
}

export function AppShell() {
  return (
    <Layout>
      <DocumentTitle />
      <AppRoutes />
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
