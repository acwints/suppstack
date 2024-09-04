'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <header className="bg-gradient-dark text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image src="/suppstack.png" alt="Suppstack Logo" width={100} height={100} className="cursor-pointer" />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {!loading && (
              <li>
                {user ? (
                  <Link href="/profile" className="hover:text-gray-400 transition duration-300">My Stack</Link>
                ) : (
                  <button onClick={handleAuth} className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition duration-300">
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
