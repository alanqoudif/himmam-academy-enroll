
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import Index from "./pages/Index";
import EnrollmentForm from "./pages/EnrollmentForm";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Grades from "./pages/Grades";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherManagement from "./pages/TeacherManagement";
import StudentApplications from "./pages/StudentApplications";
import ChangePassword from "./pages/ChangePassword";
import { AuthGuard } from "./components/AuthGuard";

// Create QueryClient with stable configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error boundary for query errors
class QueryErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Query Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">خطأ في تحميل البيانات</h2>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/enroll" element={<EnrollmentForm />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route 
                path="/teacher-dashboard" 
                element={
                  <AuthGuard allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/student-dashboard" 
                element={
                  <AuthGuard allowedRoles={['student']}>
                    <StudentDashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/teacher-management" 
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <TeacherManagement />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/student-applications" 
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <StudentApplications />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </AuthGuard>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </QueryErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
