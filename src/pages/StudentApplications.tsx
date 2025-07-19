import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Clock, Users, MoreHorizontal, UserCheck, UserX, FileText, Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthGuard } from "@/components/AuthGuard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';

// دالة آمنة لتحليل بيانات الاعتماد
const safeParseCredentials = (credentialsString: string) => {
  try {
    return JSON.parse(credentialsString);
  } catch (error) {
    console.error('خطأ في تحليل بيانات الاعتماد:', error);
    return null;
  }
};

interface StudentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  grade: number;
  selected_subjects: string[];
  total_amount: number;
  status: string;
  receipt_url?: string;
  rejection_reason?: string;
  access_credentials?: string;
  bank_transfer_details?: string;
  gender?: string;
  social_security_eligible?: boolean;
  social_security_proof_url?: string;
  created_at: string;
}

function StudentApplicationsContent() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedAppDetails, setSelectedAppDetails] = useState<StudentApplication | null>(null);
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  // استخراج المواد المتاحة من الطلبات
  useEffect(() => {
    const subjects = new Set<string>();
    applications.forEach(app => {
      app.selected_subjects.forEach(subject => subjects.add(subject));
    });
    setAvailableSubjects(Array.from(subjects).sort());
  }, [applications]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("خطأ في جلب الطلبات:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب طلبات التسجيل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStudentCredentials = (fullName: string) => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // تحويل الأسماء العربية إلى حروف إنجليزية
    const arabicToEnglish: { [key: string]: string } = {
      'أ': 'A', 'ا': 'A', 'إ': 'A', 'آ': 'A',
      'ب': 'B', 'ت': 'T', 'ث': 'TH', 'ج': 'J', 'ح': 'H', 'خ': 'KH',
      'د': 'D', 'ذ': 'TH', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'SH',
      'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A', 'غ': 'GH',
      'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
      'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'Y', 'ة': 'H'
    };
    
    const convertArabicToEnglish = (text: string) => {
      return text.split('').map(char => arabicToEnglish[char] || char).join('');
    };
    
    const nameWords = fullName.trim().split(' ');
    const firstName = convertArabicToEnglish(nameWords[0] || 'Student');
    const lastName = nameWords.length > 1 ? convertArabicToEnglish(nameWords[nameWords.length - 1]) : '';
    
    // إنشاء كلمة مرور باللغة الإنجليزية
    const passwordBase = firstName + (lastName ? lastName.charAt(0).toUpperCase() : '') + randomNum;
    
    return {
      username: `student${randomNum}`,
      password: passwordBase + '@2024'
    };
  };

  const approveApplication = async (application: StudentApplication) => {
    try {
      const credentials = generateStudentCredentials(application.full_name);
      const userId = crypto.randomUUID();

      // إنشاء ملف شخصي للطالب
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{
          user_id: userId,
          full_name: application.full_name,
          phone: application.phone,
          role: "student",
          status: "approved",
          grade: application.grade,
          subjects: application.selected_subjects,
        }]);

      if (profileError) throw profileError;

      // حفظ بيانات الاعتماد
      const { error: credError } = await supabase
        .from("user_credentials")
        .insert([{
          user_id: userId,
          username: credentials.username,
          password_hash: credentials.password
        }]);

      if (credError) {
        console.error("خطأ في إنشاء بيانات الاعتماد:", credError);
      }

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from("student_enrollments")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          access_credentials: JSON.stringify(credentials)
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      // إرسال رسالة واتساب بالبيانات
      try {
        await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            message: `🎓 مبروك ${application.full_name}!\n\nتم قبول طلب التسجيل في أكاديمية همم التعليمية.\n\n🔑 بيانات الدخول:\n👤 اسم المستخدم: ${credentials.username}\n🔐 كلمة المرور: ${credentials.password}\n\n📚 الصف: ${application.grade}\n📖 المواد: ${application.selected_subjects.join(', ')}\n\nيمكنك الآن الدخول للمنصة ومتابعة الدروس.`,
            recipient_type: 'student',
            student_name: application.full_name,
            phone_number: application.phone,
            grade: application.grade,
            subjects: application.selected_subjects,
            gender: application.gender
          }
        });
      } catch (whatsappError) {
        console.error('فشل إرسال الواتساب:', whatsappError);
      }

      // تحديث القائمة
      setApplications(applications.map(app => 
        app.id === application.id 
          ? { ...app, status: "approved" }
          : app
      ));

      toast({
        title: "✅ تم قبول الطلب",
        description: `تم قبول طلب ${application.full_name} وإرسال بيانات الدخول\n\nاسم المستخدم: ${credentials.username}\nكلمة المرور: ${credentials.password}`,
        
      });

    } catch (error: any) {
      console.error("خطأ في قبول الطلب:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في قبول الطلب",
        variant: "destructive",
      });
    }
  };

  const rejectApplication = async (application: StudentApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("student_enrollments")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq("id", application.id);

      if (error) throw error;

      // إرسال رسالة واتساب بالرفض والسبب
      try {
        await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            message: `عذراً ${application.full_name},\n\nتم رفض طلب التسجيل في أكاديمية همم التعليمية.\n\nسبب الرفض: ${rejectionReason}\n\nيمكنك التواصل معنا لمزيد من التوضيح أو إعادة التقديم.`,
            recipient_type: 'student',
            student_name: application.full_name,
            phone_number: application.phone
          }
        });
      } catch (whatsappError) {
        console.error('فشل إرسال الواتساب:', whatsappError);
      }

      setApplications(applications.map(app => 
        app.id === application.id 
          ? { ...app, status: "rejected", rejection_reason: rejectionReason }
          : app
      ));

      setSelectedApp(null);
      setRejectionReason("");

      toast({
        title: "تم رفض الطلب",
        description: `تم رفض طلب ${application.full_name} وإرسال إشعار`,
      });

    } catch (error: any) {
      console.error("خطأ في رفض الطلب:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفض الطلب",
        variant: "destructive",
      });
    }
  };

  // إلغاء تفعيل حساب الطالب
  const deactivateStudent = async (application: StudentApplication) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("full_name", application.full_name)
        .eq("phone", application.phone);

      if (error) throw error;

      toast({
        title: "تم إلغاء تفعيل الحساب",
        description: `تم إلغاء تفعيل حساب ${application.full_name}`,
      });
    } catch (error) {
      console.error("خطأ في إلغاء التفعيل:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إلغاء تفعيل الحساب",
        variant: "destructive",
      });
    }
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = (data: StudentApplication[], filename: string) => {
    const exportData = data.map(app => ({
      'الاسم': app.full_name,
      'البريد الإلكتروني': app.email,
      'رقم الهاتف': app.phone,
      'الصف': app.grade,
      'الجنس': app.gender === 'male' ? 'ذكر' : 'أنثى',
      'المواد': app.selected_subjects.join(', '),
      'المبلغ الإجمالي': `${app.total_amount} ريال عماني`,
      'الحالة': app.status === 'approved' ? 'مقبول' : app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة',
      'تاريخ التقديم': new Date(app.created_at).toLocaleDateString('ar-SA'),
      'سبب الرفض': app.rejection_reason || '',
      'اسم المستخدم': app.access_credentials ? (safeParseCredentials(app.access_credentials)?.username || '') : '',
      'كلمة المرور': app.access_credentials ? (safeParseCredentials(app.access_credentials)?.password || '') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلاب');
    XLSX.writeFile(wb, filename);
  };

  // تصدير جميع الطلاب
  const exportAllStudents = () => {
    exportToExcel(filteredApplications, `جميع_الطلاب_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`);
    toast({
      title: "تم التصدير",
      description: `تم تصدير ${filteredApplications.length} طالب إلى ملف Excel`,
    });
  };

  // تصدير حسب الحالة
  const exportByStatus = (status: string) => {
    const statusData = filteredApplications.filter(app => app.status === status);
    const statusName = status === 'approved' ? 'المقبولين' : status === 'rejected' ? 'المرفوضين' : 'قيد_المراجعة';
    exportToExcel(statusData, `الطلاب_${statusName}_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`);
    toast({
      title: "تم التصدير",
      description: `تم تصدير ${statusData.length} طالب إلى ملف Excel`,
    });
  };
  const reactivateStudent = async (application: StudentApplication) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved" })
        .eq("full_name", application.full_name)
        .eq("phone", application.phone);

      if (error) throw error;

      toast({
        title: "تم إعادة تفعيل الحساب",
        description: `تم إعادة تفعيل حساب ${application.full_name}`,
      });
    } catch (error) {
      console.error("خطأ في إعادة التفعيل:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إعادة تفعيل الحساب",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">قيد المراجعة</Badge>;
    }
  };

  // فلترة الطلبات
  const filteredApplications = applications.filter(app => {
    if (filterGrade !== "all" && app.grade.toString() !== filterGrade) return false;
    if (filterGender !== "all" && app.gender !== filterGender) return false;
    if (filterSubject !== "all" && !app.selected_subjects.includes(filterSubject)) return false;
    return true;
  });

  // تجميع الطلبات حسب الحالة
  const pendingApplications = filteredApplications.filter(app => app.status === "pending");
  const approvedApplications = filteredApplications.filter(app => app.status === "approved");
  const rejectedApplications = filteredApplications.filter(app => app.status === "rejected");

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">طلبات التسجيل</h1>
            <p className="text-muted-foreground mt-2">مراجعة وإدارة طلبات تسجيل الطلاب</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير البيانات
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAllStudents}>
                  <FileText className="h-4 w-4 mr-2" />
                  تصدير جميع الطلاب
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportByStatus('approved')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  تصدير المقبولين فقط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportByStatus('rejected')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  تصدير المرفوضين فقط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportByStatus('pending')}>
                  <Clock className="h-4 w-4 mr-2" />
                  تصدير قيد المراجعة فقط
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* عوامل التصفية */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              عوامل التصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>الصف الدراسي</Label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الصفوف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الصفوف</SelectItem>
                    {[5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        الصف {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الجنس</Label>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="الجميع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>المادة</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المواد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المواد</SelectItem>
                    {availableSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تبويب الطلبات */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              قيد المراجعة ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              مقبولة ({approvedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              مرفوضة ({rejectedApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ApplicationGrid applications={pendingApplications} 
              onApprove={approveApplication}
              onReject={setSelectedApp}
              onViewDetails={setSelectedAppDetails}
              onDeactivate={deactivateStudent}
              onReactivate={reactivateStudent}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="approved">
            <ApplicationGrid applications={approvedApplications} 
              onApprove={approveApplication}
              onReject={setSelectedApp}
              onViewDetails={setSelectedAppDetails}
              onDeactivate={deactivateStudent}
              onReactivate={reactivateStudent}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <ApplicationGrid applications={rejectedApplications} 
              onApprove={approveApplication}
              onReject={setSelectedApp}
              onViewDetails={setSelectedAppDetails}
              onDeactivate={deactivateStudent}
              onReactivate={reactivateStudent}
              toast={toast}
            />
          </TabsContent>
        </Tabs>

        {/* نافذة رفض الطلب */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>رفض طلب {selectedApp.full_name}</CardTitle>
                <CardDescription>
                  يرجى إدخال سبب رفض الطلب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>سبب الرفض</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="أدخل سبب رفض الطلب..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    onClick={() => rejectApplication(selectedApp)}
                    className="flex-1"
                  >
                    رفض الطلب
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(null);
                      setRejectionReason("");
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* نافذة التفاصيل الكاملة */}
        {selectedAppDetails && (
          <Dialog open={!!selectedAppDetails} onOpenChange={() => setSelectedAppDetails(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  التفاصيل الكاملة - {selectedAppDetails.full_name}
                </DialogTitle>
                <DialogDescription>
                  جميع المعلومات المتعلقة بطلب التسجيل
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* المعلومات الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الاسم الكامل</Label>
                    <p className="text-sm bg-secondary p-2 rounded">{selectedAppDetails.full_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                    <p className="text-sm bg-secondary p-2 rounded">{selectedAppDetails.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم الهاتف</Label>
                    <p className="text-sm bg-secondary p-2 rounded">{selectedAppDetails.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الصف</Label>
                    <p className="text-sm bg-secondary p-2 rounded">الصف {selectedAppDetails.grade}</p>
                  </div>
                </div>

                {/* المواد المختارة */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">المواد المختارة</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppDetails.selected_subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                </div>

                {/* المعلومات المالية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المبلغ الإجمالي</Label>
                    <p className="text-lg font-bold text-green-600">{selectedAppDetails.total_amount} ريال عماني</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">حالة الطلب</Label>
                    <div>{getStatusBadge(selectedAppDetails.status)}</div>
                  </div>
                </div>

                {/* بيانات التحويل البنكي */}
                {selectedAppDetails.bank_transfer_details && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">تفاصيل التحويل البنكي</Label>
                    <p className="text-sm bg-secondary p-3 rounded whitespace-pre-wrap">
                      {selectedAppDetails.bank_transfer_details}
                    </p>
                  </div>
                )}

                {/* بيانات الدخول (للطلبات المقبولة) */}
                {selectedAppDetails.access_credentials && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">بيانات الدخول</Label>
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      {(() => {
                        const credentials = safeParseCredentials(selectedAppDetails.access_credentials);
                        if (!credentials) {
                          return (
                            <p className="text-sm text-red-600">خطأ في قراءة بيانات الدخول</p>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <p><span className="font-medium">اسم المستخدم:</span> {credentials.username}</p>
                            <p><span className="font-medium">كلمة المرور:</span> {credentials.password}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* معلومات الضمان الاجتماعي */}
                {selectedAppDetails.social_security_eligible && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الضمان الاجتماعي</Label>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <p className="text-sm text-blue-800 mb-2">
                        <span className="font-medium">مستفيد من الضمان الاجتماعي:</span> نعم
                      </p>
                      {selectedAppDetails.social_security_proof_url && (
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(selectedAppDetails.social_security_proof_url, '_blank')}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          عرض إثبات الضمان الاجتماعي
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* سبب الرفض */}
                {selectedAppDetails.rejection_reason && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">سبب الرفض</Label>
                    <p className="text-sm bg-red-50 border border-red-200 p-3 rounded text-red-700">
                      {selectedAppDetails.rejection_reason}
                    </p>
                  </div>
                )}

                {/* تاريخ التقديم */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">تاريخ التقديم</Label>
                  <p className="text-sm bg-secondary p-2 rounded">
                    {new Date(selectedAppDetails.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>

                {/* الإجراءات المتاحة */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedAppDetails.receipt_url && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(selectedAppDetails.receipt_url, '_blank')}
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      عرض الإيصال
                    </Button>
                  )}
                  
                  {selectedAppDetails.access_credentials && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const credentials = safeParseCredentials(selectedAppDetails.access_credentials);
                        if (credentials) {
                          navigator.clipboard.writeText(`اسم المستخدم: ${credentials.username}\nكلمة المرور: ${credentials.password}`);
                          toast({
                            title: "تم النسخ",
                            description: "تم نسخ بيانات الدخول للحافظة",
                          });
                        } else {
                          toast({
                            title: "خطأ",
                            description: "لا يمكن قراءة بيانات الدخول",
                            variant: "destructive",
                          });
                        }
                      }}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      نسخ بيانات الدخول
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// مكون لعرض شبكة الطلبات
interface ApplicationGridProps {
  applications: StudentApplication[];
  onApprove: (application: StudentApplication) => void;
  onReject: (application: StudentApplication) => void;
  onViewDetails: (application: StudentApplication) => void;
  onDeactivate: (application: StudentApplication) => void;
  onReactivate: (application: StudentApplication) => void;
  toast: any;
}

function ApplicationGrid({ 
  applications, 
  onApprove, 
  onReject, 
  onViewDetails, 
  onDeactivate, 
  onReactivate, 
  toast 
}: ApplicationGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">قيد المراجعة</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
          <p className="text-muted-foreground">لا توجد طلبات تطابق الفلتر المحدد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {application.full_name}
              </span>
              {getStatusBadge(application.status)}
            </CardTitle>
            <CardDescription>
              الصف {application.grade} - {application.selected_subjects.length} مواد - {application.gender === 'male' ? 'ذكر' : 'أنثى'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div>
                <span className="font-medium">الإيميل:</span> {application.email}
              </div>
              <div>
                <span className="font-medium">الهاتف:</span> {application.phone}
              </div>
              <div>
                <span className="font-medium">المواد:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {application.selected_subjects.map((subject) => (
                    <span key={subject} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-xs">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">المبلغ:</span> {application.total_amount} ريال عماني
              </div>
              {application.rejection_reason && (
                <div>
                  <span className="font-medium text-red-500">سبب الرفض:</span>
                  <p className="text-red-500 text-xs mt-1">{application.rejection_reason}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {/* أزرار للطلبات قيد المراجعة */}
              {application.status === "pending" && (
                <>
                  <Button 
                    onClick={() => onApprove(application)}
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    قبول
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => onReject(application)}
                    className="w-full"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    رفض
                  </Button>
                </>
              )}
              
              {/* أزرار مشتركة لجميع الطلبات */}
              <div className="flex gap-2">
                {application.receipt_url && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(application.receipt_url, '_blank')}
                    className="flex-1"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    عرض الإيصال
                  </Button>
                )}
                
                {/* زر المزيد مع قائمة منسدلة */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(application)}>
                      <FileText className="h-4 w-4 mr-2" />
                      عرض التفاصيل الكاملة
                    </DropdownMenuItem>
                    
                    {application.status === "approved" && (
                      <DropdownMenuItem onClick={() => onDeactivate(application)}>
                        <UserX className="h-4 w-4 mr-2" />
                        إلغاء تفعيل الحساب
                      </DropdownMenuItem>
                    )}
                    
                    {application.status !== "approved" && (
                      <DropdownMenuItem onClick={() => onReactivate(application)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        إعادة تفعيل الحساب
                      </DropdownMenuItem>
                    )}
                    
                    {application.access_credentials && (
                      <DropdownMenuItem onClick={() => {
                        const credentials = safeParseCredentials(application.access_credentials);
                        if (credentials) {
                          navigator.clipboard.writeText(`اسم المستخدم: ${credentials.username}\nكلمة المرور: ${credentials.password}`);
                          toast({
                            title: "تم النسخ",
                            description: "تم نسخ بيانات الدخول للحافظة",
                          });
                        } else {
                          toast({
                            title: "خطأ",
                            description: "لا يمكن قراءة بيانات الدخول",
                            variant: "destructive",
                          });
                        }
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        نسخ بيانات الدخول
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StudentApplications() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <StudentApplicationsContent />
    </AuthGuard>
  );
}