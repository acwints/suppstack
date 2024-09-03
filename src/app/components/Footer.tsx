import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} SuppStack. All rights reserved.</p>
      </div>
    </footer>
  );
}
