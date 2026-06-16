import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';

export default function Footer({ theme }) {
  const isSport = theme === 'sport';
  const [instagramUsername, setInstagramUsername] = useState('falgunipicture');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.instagram_username) {
            setInstagramUsername(data.instagram_username);
          }
        }
      } catch (err) {
        console.error("Failed to fetch instagram setting in footer:", err);
      }
    };
    fetchSettings();
  }, []);

  const instagramUrl = `https://instagram.com/${instagramUsername.replace('@', '')}`;

  return (
    <footer className={`py-12 text-center border-t transition-theme border-dynamic footer-dynamic relative z-50 ${isSport ? 'border-gray-800 bg-black text-gray-400' : 'border-gray-300 bg-white text-slate-500'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-semibold tracking-widest text-sm uppercase mb-2">
          © 2026 {isSport ? 'VeloLens' : 'Falguni'}
        </p>
        <p className={`text-xs ${isSport ? 'text-gray-600' : 'text-slate-400'}`}>
          All rights reserved. Professional Photography & Visual Storytelling.
        </p>
        
        <div className="flex justify-center space-x-6 mt-6">
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}
          >
            <span className="sr-only">Instagram</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
