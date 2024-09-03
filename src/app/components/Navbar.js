import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <a className="text-xl font-bold text-indigo-600">Suppstack</a>
          </Link>
          <div className="space-x-4">
            <Link href="/discover">
              <a className="text-gray-700 hover:text-indigo-600">Discover</a>
            </Link>
            <Link href="/profile">
              <a className="text-gray-700 hover:text-indigo-600">Profile</a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}