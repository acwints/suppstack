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
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
            <div className="relative">
              <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300 inline-block">
                SuppStack
              </span>
                              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>
          
          <nav>
            <div className="flex items-center space-x-6">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium group"
                      >
                        {user.user_metadata.avatar_url && (
                          <div className="relative">
                            <Image
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              width={32}
                              height={32}
                              className="rounded-full border-2 border-gray-300 group-hover:border-orange-400 transition-colors duration-300"
                            />
                          </div>
                        )}
                        <span className="group-hover:translate-x-1 transition-transform duration-200">My Stack</span>
                      </Link>
                      <button 
                        onClick={handleAuth}
                        className="btn btn-ghost text-sm hover:bg-gray-100 hover:text-error-600 transition-all duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAuth} 
                      className="uber-button transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="relative z-10">Sign In with Google</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
