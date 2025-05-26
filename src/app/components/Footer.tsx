import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 p-8 mt-auto">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} <span className="text-gradient font-semibold">SuppStack</span>. 
              Science-backed supplements.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="hover:text-orange-600 transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-orange-600 transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-orange-600 transition-colors duration-200">Support</a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Trusted by health professionals and wellness enthusiasts worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
