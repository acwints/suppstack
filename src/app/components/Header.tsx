'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (user) {
      await logout();
      router.push('/');
    } else {
      await loginWithGoogle();
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          SuppStack
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {!loading && (
              <li>
                {user ? (
                  <Link href="/profile" className="hover:text-blue-200 transition duration-300">My Profile</Link>
                ) : (
                  <button onClick={handleAuth} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition duration-300">
                    Log In / Sign Up
                  </button>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
