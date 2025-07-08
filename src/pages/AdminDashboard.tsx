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

export default function AdminDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [adminPhone, setAdminPhone] = useState("");
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [tempAdminPhone, setTempAdminPhone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADMIN_PASSWORD = "admin2025";

  useEffect(() => {
    // فحص إذا كان المستخدم مسجل دخول من localStorage
    const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    if (isLoggedIn) {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
      fetchEnrollments();
      fetchAdminSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
      localStorage.setItem('admin_authenticated', 'true');
      fetchEnrollments();
      fetchAdminSettings();
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة تحكم الأدمن"
      });
    } else {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPasswordForm(true);
    localStorage.removeItem('admin_authenticated');
    toast({
      title: "تم تسجيل الخروج",
      description: "شكراً لك"
    });
  };

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
      setShowAdminSettings(false);
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

  const sendWhatsAppNotification = async (type: 'student' | 'admin', message: string, studentName?: string, phoneNumber?: string) => {
    try {
      await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          message,
          recipient_type: type,
          student_name: studentName,
          phone_number: phoneNumber,
          admin_phone: adminPhone || "96871234567"
        }
      });
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  };

  const updateEnrollmentStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setIsProcessing(true);
    
    try {
      const enrollment = enrollments.find(e => e.id === id);
      
      if (!enrollment) return;

      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString()
      };

      if (status === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      }

      if (status === 'approved') {
        updateData.access_credentials = `تم قبول طلبك! يمكنك الآن الوصول للدروس عبر الرابط...`;
      }

      const { error } = await supabase
        .from('student_enrollments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // إرسال إشعار واتساب للطالب
      if (status === 'approved') {
        await sendWhatsAppNotification(
          'student',
          `🎉 مبروك ${enrollment.full_name}!\n\nتم قبول طلب التسجيل الخاص بك في أكاديمية همم التعليمية.\n\nالصف: ${enrollment.grade}\nالمواد: ${enrollment.selected_subjects.join(', ')}\n\nيمكنك الآن الوصول للدروس والمواد التعليمية.\n\nمرحباً بك في عائلة أكاديمية همم! 📚`,
          enrollment.full_name,
          enrollment.phone
        );
      } else if (status === 'rejected') {
        await sendWhatsAppNotification(
          'student',
          `نأسف ${enrollment.full_name},\n\nتم رفض طلب التسجيل الخاص بك في أكاديمية همم التعليمية.\n\nسبب الرفض: ${reason || 'لم يتم تحديد السبب'}\n\nيمكنك تقديم طلب جديد بعد تصحيح المطلوب.\n\nشكراً لتفهمك.`,
          enrollment.full_name,
          enrollment.phone
        );
      }

      toast({
        title: "تم التحديث",
        description: `تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب وإرسال إشعار للطالب`
      });

      // تحديث الحالة في القائمة فوراً
      setEnrollments(prev => prev.map(e => 
        e.id === id ? { 
          ...e, 
          status, 
          reviewed_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? reason : null,
          access_credentials: status === 'approved' ? `تم قبول طلبك! يمكنك الآن الوصول للدروس عبر الرابط...` : null
        } : e
      ));
      setIsDetailModalOpen(false);
      setRejectionReason("");

    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const viewEnrollmentDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDetailModalOpen(true);
  };

  const downloadReceipt = (receiptUrl: string, studentName: string) => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt_${studentName.replace(/\s+/g, '_')}_${Date.now()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewReceiptInModal = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length
  };

  if (showPasswordForm) {
    return (
      <div className="min-h-screen bg-gradient-accent font-arabic flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-accent">تسجيل دخول الأدمن</CardTitle>
            <p className="text-muted-foreground">أدخل كلمة المرور للوصول للوحة التحكم</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-center"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 text-white">
                دخول
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                العودة للصفحة الرئيسية
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              onClick={() => setShowAdminSettings(true)}
              variant="outline"
              className="text-academy-orange border-academy-orange hover:bg-academy-orange hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              إعدادات الأدمن
            </Button>
            <Button 
              onClick={handleLogout}
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

        {/* Admin Settings Card */}
        {adminPhone && (
          <Card className="shadow-soft mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الأدمن الحالي</p>
                  <p className="font-medium">{adminPhone}</p>
                </div>
                <MessageSquare className="w-5 h-5 text-academy-orange" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
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

        {/* Enrollments Table */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-xl">طلبات التسجيل</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">لا توجد طلبات تسجيل حتى الآن</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الطالب</TableHead>
                      <TableHead>الإيميل</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.full_name}</TableCell>
                        <TableCell>{enrollment.email}</TableCell>
                        <TableCell>{enrollment.phone}</TableCell>
                        <TableCell>{enrollment.grade}</TableCell>
                        <TableCell>{enrollment.total_amount} ر.ع</TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell>
                          {format(new Date(enrollment.created_at), 'dd/MM/yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewEnrollmentDetails(enrollment)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Settings Modal */}
        <Dialog open={showAdminSettings} onOpenChange={setShowAdminSettings}>
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
                <Button variant="outline" onClick={() => setShowAdminSettings(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enrollment Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-arabic" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-accent">
                تفاصيل طلب التسجيل - {selectedEnrollment?.full_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEnrollment && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">الاسم:</span> {selectedEnrollment.full_name}
                      </div>
                      <div>
                        <span className="font-medium">الإيميل:</span> {selectedEnrollment.email}
                      </div>
                      <div>
                        <span className="font-medium">الهاتف:</span> {selectedEnrollment.phone}
                      </div>
                      <div>
                        <span className="font-medium">الصف:</span> {selectedEnrollment.grade}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">تفاصيل التسجيل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">الحالة:</span> {getStatusBadge(selectedEnrollment.status)}
                      </div>
                      <div>
                        <span className="font-medium">إجمالي المبلغ:</span> 
                        <span className="text-lg font-bold text-academy-orange mr-2">
                          {selectedEnrollment.total_amount} ر.ع
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">تاريخ التقديم:</span> 
                        {format(new Date(selectedEnrollment.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Selected Subjects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <BookOpen className="w-5 h-5 inline-block mr-2" />
                      المواد المختارة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnrollment.selected_subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Transfer Details */}
                {selectedEnrollment.bank_transfer_details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">تفاصيل التحويل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedEnrollment.bank_transfer_details}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Receipt */}
                {selectedEnrollment.receipt_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">إيصال التحويل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => downloadReceipt(selectedEnrollment.receipt_url!, selectedEnrollment.full_name)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          تحميل الإيصال
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => viewReceiptInModal(selectedEnrollment.receipt_url!)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          عرض الإيصال
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rejection Reason */}
                {selectedEnrollment.status === 'rejected' && selectedEnrollment.rejection_reason && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-700">سبب الرفض</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-600">{selectedEnrollment.rejection_reason}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                {selectedEnrollment.status === 'pending' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">إجراءات المراجعة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Button
                          onClick={() => updateEnrollmentStatus(selectedEnrollment.id, 'approved')}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          قبول الطلب
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">سبب الرفض (اختياري):</label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="اكتب سبب رفض الطلب..."
                          rows={3}
                        />
                        <Button
                          onClick={() => updateEnrollmentStatus(selectedEnrollment.id, 'rejected', rejectionReason)}
                          disabled={isProcessing}
                          variant="destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          رفض الطلب
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}