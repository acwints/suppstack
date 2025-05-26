import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Suppstack
          </Link>
          <div className="space-x-4">
            <Link href="/discover" className="text-gray-700 hover:text-indigo-600">
              Discover
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}