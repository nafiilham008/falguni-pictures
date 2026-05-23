import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('falguni_admin_token');

  // Jika tidak ada token, tendang ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, izinkan masuk ke komponen di dalamnya (Outlet)
  return <Outlet />;
}
