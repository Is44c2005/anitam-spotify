import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/spotify';

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
