import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-soft border-b border-neutral-200">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gradient">
            SuppStack
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/discover" className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 font-medium">
              Discover
            </Link>
            <Link href="/profile" className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 font-medium">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}