import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect unauthorized role to student chat
        router.replace('/chat');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium tracking-wide">Authenticating CampusRAG...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return null;
  }

  return children;
}
