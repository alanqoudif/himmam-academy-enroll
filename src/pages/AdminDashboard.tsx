import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard, logout } from "@/components/AuthGuard";
import { 
  Users, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Calendar,
  DollarSign,
  BookOpen,
  ArrowLeft,
  Download,
  MessageSquare,
  LogOut,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Enrollment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  grade: number;
  selected_subjects: string[];
  total_amount: number;
  receipt_url?: string;
  bank_transfer_details?: string;
  status: string;
  rejection_reason?: string;
  access_credentials?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

function AdminDashboardContent() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPhone, setAdminPhone] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempAdminPhone, setTempAdminPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_phone')
        .single();

      if (error) {
        console.error('Error fetching admin settings:', error);
      } else if (data) {
        setAdminPhone(data.setting_value);
        setTempAdminPhone(data.setting_value);
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  };

  const updateAdminPhone = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: tempAdminPhone })
        .eq('setting_key', 'admin_phone');

      if (error) {
        throw error;
      }

      setAdminPhone(tempAdminPhone);
      setShowSettings(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث رقم الأدمن بنجاح"
      });
    } catch (error) {
      console.error('Error updating admin phone:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث رقم الأدمن",
        variant: "destructive"
      });
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-accent font-arabic flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-academy-orange mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-accent">لوحة تحكم الأدمن</h1>
            <p className="text-muted-foreground">إدارة طلبات التسجيل في أكاديمية همم</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="text-academy-orange border-academy-orange hover:bg-academy-orange hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              إعدادات الأدمن
            </Button>
            <Button 
              onClick={logout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Button 
            onClick={() => navigate('/teacher-management')} 
            className="h-24 flex flex-col items-center justify-center"
          >
            <Users className="h-8 w-8 mb-2" />
            إدارة المعلمين
          </Button>
          
          <Button 
            onClick={() => navigate('/student-applications')} 
            className="h-24 flex flex-col items-center justify-center"
            variant="outline"
          >
            <FileText className="h-8 w-8 mb-2" />
            طلبات التسجيل
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-accent">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-academy-orange" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <FileText className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مقبولة</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مرفوضة</p>
                  <p className="text-3xl font-bold text-academy-red">{stats.rejected}</p>
                </div>
                <X className="w-10 h-10 text-academy-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md font-arabic" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl text-accent">إعدادات الأدمن</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">رقم الواتساب للأدمن</label>
                <Input
                  type="tel"
                  value={tempAdminPhone}
                  onChange={(e) => setTempAdminPhone(e.target.value)}
                  placeholder="96871234567"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم إرسال إشعارات التسجيل الجديدة على هذا الرقم
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={updateAdminPhone} className="flex-1">
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}