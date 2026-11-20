import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Page not found</h1>
      <p className="text-ink-muted mb-4">There is nothing at this address.</p>
      <Link to="/" className="text-acc hover:underline">Back to home</Link>
    </div>
  )
}
