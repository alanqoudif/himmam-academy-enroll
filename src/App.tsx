import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
