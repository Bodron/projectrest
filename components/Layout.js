import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="py-12 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
