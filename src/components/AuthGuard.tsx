import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserSession {
  user_id: string;
  profile: {
    id: string;
    full_name: string;
    role: string;
    status: string;
    phone: string;
    grade?: number;
    subjects?: string[];
  };
}

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem('user_session');
        
        if (!sessionData) {
          console.log('No session found, redirecting to login');
          navigate(redirectTo);
          return;
        }

        const session: UserSession = JSON.parse(sessionData);
        
        if (!session.profile || !session.profile.role) {
          console.log('Invalid session data, redirecting to login');
          localStorage.removeItem('user_session');
          navigate(redirectTo);
          return;
        }

        if (!allowedRoles.includes(session.profile.role)) {
          console.log(`Role ${session.profile.role} not allowed, redirecting`);
          navigate('/');
          return;
        }

        if (session.profile.status !== 'approved') {
          console.log('Account not approved, redirecting');
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('user_session');
        navigate(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Hook للحصول على بيانات المستخدم الحالي
export function useCurrentUser(): UserSession | null {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_session');
    if (sessionData) {
      try {
        setUser(JSON.parse(sessionData));
      } catch (error) {
        console.error('Error parsing user session:', error);
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  return user;
}

// دالة تسجيل الخروج
export function logout() {
  localStorage.removeItem('user_session');
  window.location.href = '/login';
}