import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}