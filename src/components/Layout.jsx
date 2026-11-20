import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="max-w-page mx-auto w-full flex-1 lg:grid lg:grid-cols-[230px_1fr] lg:gap-8 lg:px-6">
        <Sidebar />
        <main className="px-4 lg:px-0 py-6">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
