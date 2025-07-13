import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthGuard } from "@/components/AuthGuard";

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
  created_at: string;
}

function StudentApplicationsContent() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

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
    return {
      username: `student${randomNum}`,
      password: `Student${randomNum}!`
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
            message: `🎓 مبروك ${application.full_name}!\n\nتم قبول طلب التسجيل في أكاديمية همم التعليمية.\n\n🔑 بيانات الدخول:\nاسم المستخدم: ${credentials.username}\nكلمة المرور: ${credentials.password}\n\nالصف: ${application.grade}\nالمواد: ${application.selected_subjects.join(', ')}\n\nيمكنك الآن الدخول للمنصة ومتابعة الدروس.\n\nرابط المنصة: ${window.location.origin}`,
            recipient_type: 'student',
            teacher_name: application.full_name,
            phone_number: application.phone
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
        duration: 10000,
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
            teacher_name: application.full_name,
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
        </div>

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
                  الصف {application.grade} - {application.selected_subjects.length} مواد
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
                
                {application.status === "pending" && (
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => approveApplication(application)}
                      className="w-full"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      قبول
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setSelectedApp(application)}
                      className="w-full"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      رفض
                    </Button>
                    {application.receipt_url && (
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(application.receipt_url, '_blank')}
                        className="w-full"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        عرض الإيصال
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground">سيظهر هنا طلبات التسجيل الجديدة</p>
            </CardContent>
          </Card>
        )}

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
      </div>
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