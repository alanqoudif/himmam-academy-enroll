import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  grade: number;
  subjects: string[];
  status: string;
  created_at: string;
}

const availableSubjects = [
  "الرياضيات",
  "الفيزياء", 
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
  "التربية الإسلامية",
  "الحاسوب"
];

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTeacher, setNewTeacher] = useState({
    full_name: "",
    phone: "",
    grade: 5,
    subjects: [] as string[],
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "teacher")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error("خطأ في جلب المعلمين:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب بيانات المعلمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCredentials = (fullName: string) => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return {
      username: `teacher${randomNum}`,
      password: `Teacher${randomNum}!`
    };
  };

  const sendWhatsAppNotification = async (type: 'teacher' | 'admin', message: string, teacherName?: string, phoneNumber?: string) => {
    try {
      await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          message,
          recipient_type: type,
          teacher_name: teacherName,
          phone_number: phoneNumber,
          admin_phone: phoneNumber
        }
      });
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  };

  const addTeacher = async () => {
    try {
      if (!newTeacher.full_name || !newTeacher.phone || newTeacher.subjects.length === 0) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      console.log("بدء إضافة المعلم...", newTeacher);

      // إنشاء معرف مستخدم جديد
      const userId = crypto.randomUUID();
      console.log("معرف المستخدم الجديد:", userId);
      
      // إنشاء بيانات اعتماد للمعلم أولاً
      const credentials = generateCredentials(newTeacher.full_name);
      console.log("بيانات الاعتماد:", credentials);
      
      // إضافة المعلم إلى جدول profiles
      console.log("إضافة المعلم إلى جدول profiles...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([{
          user_id: userId,
          full_name: newTeacher.full_name,
          phone: newTeacher.phone,
          role: "teacher",
          status: "approved",
          grade: newTeacher.grade,
          subjects: newTeacher.subjects,
        }])
        .select()
        .single();

      if (profileError) {
        console.error("خطأ في إضافة الملف الشخصي:", profileError);
        throw profileError;
      }

      console.log("تم إضافة الملف الشخصي بنجاح:", profileData);

      // حفظ بيانات الاعتماد
      console.log("حفظ بيانات الاعتماد...");
      const { data: credData, error: credError } = await supabase
        .from("user_credentials")
        .insert([{
          user_id: userId,
          username: credentials.username,
          password_hash: credentials.password // سيتم تشفيرها في قاعدة البيانات
        }])
        .select()
        .single();

      if (credError) {
        console.error("خطأ في إنشاء بيانات الاعتماد:", credError);
        // لا نوقف العملية، بل نسجل الخطأ فقط
      } else {
        console.log("تم حفظ بيانات الاعتماد بنجاح:", credData);
      }

      // إرسال إشعار واتساب للمعلم الجديد
      console.log("إرسال إشعار واتساب...");
      try {
        const whatsappResult = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            message: `🎓 مرحباً ${newTeacher.full_name}!\n\nتم إنشاء حساب لك في أكاديمية همم التعليمية.\n\n🔑 بيانات الدخول:\nاسم المستخدم: ${credentials.username}\nكلمة المرور: ${credentials.password}\n\nيمكنك الآن الدخول للمنصة والبدء في إضافة الدروس.\n\nرابط المنصة: ${window.location.origin}`,
            recipient_type: 'teacher',
            teacher_name: newTeacher.full_name,
            phone_number: newTeacher.phone
          }
        });
        
        if (whatsappResult.error) {
          console.error('خطأ في إرسال الواتساب:', whatsappResult.error);
        } else {
          console.log('تم إرسال الواتساب بنجاح:', whatsappResult.data);
        }
      } catch (whatsappError) {
        console.error('فشل إرسال إشعار الواتساب:', whatsappError);
      }

      // تحديث قائمة المعلمين
      setTeachers([profileData, ...teachers]);
      
      // إعادة تعيين النموذج
      setNewTeacher({
        full_name: "",
        phone: "",
        grade: 5,
        subjects: [],
      });
      setShowAddForm(false);

      toast({
        title: "✅ تم بنجاح",
        description: `تم إضافة المعلم بنجاح وإرسال بيانات الدخول عبر الواتساب\n\n📱 اسم المستخدم: ${credentials.username}\n🔐 كلمة المرور: ${credentials.password}`,
        duration: 10000,
      });

    } catch (error: any) {
      console.error("خطأ في إضافة المعلم:", error);
      
      let errorMessage = "حدث خطأ غير متوقع في إضافة المعلم";
      
      if (error?.code === "42501") {
        errorMessage = "خطأ في الصلاحيات - تأكد من أنك مسجل كمدير";
      } else if (error?.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      toast({
        title: "❌ خطأ في إضافة المعلم",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", teacherId);

      if (error) throw error;

      setTeachers(teachers.filter(t => t.id !== teacherId));
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف المعلم بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف المعلم:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف المعلم",
        variant: "destructive",
      });
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setNewTeacher({
        ...newTeacher,
        subjects: [...newTeacher.subjects, subject]
      });
    } else {
      setNewTeacher({
        ...newTeacher,
        subjects: newTeacher.subjects.filter(s => s !== subject)
      });
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
            <h1 className="text-3xl font-bold text-foreground">إدارة المعلمين</h1>
            <p className="text-muted-foreground mt-2">إدارة وإضافة المعلمين الجدد</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus className="h-4 w-4 mr-2" />
            إضافة معلم جديد
          </Button>
        </div>

        {/* نموذج إضافة معلم جديد */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>إضافة معلم جديد</CardTitle>
              <CardDescription>
                أدخل بيانات المعلم الجديد وسيتم إنشاء حساب له تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={newTeacher.full_name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    placeholder="+966xxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="grade">الصف المسؤول عنه</Label>
                <Select value={newTeacher.grade.toString()} onValueChange={(value) => setNewTeacher({ ...newTeacher, grade: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 5).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        الصف {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المواد التي يُدرِّسها</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={subject}
                        checked={newTeacher.subjects.includes(subject)}
                        onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                      />
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addTeacher}>
                  إضافة المعلم
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة المعلمين */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {teacher.full_name}
                </CardTitle>
                <CardDescription>
                  الصف {teacher.grade} - {teacher.status === 'approved' ? 'مفعل' : 'معطل'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">الهاتف:</span> {teacher.phone}
                  </div>
                  <div>
                    <span className="font-medium">المواد:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subjects?.map((subject) => (
                        <span key={subject} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-xs">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteTeacher(teacher.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teachers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا يوجد معلمين</h3>
              <p className="text-muted-foreground">ابدأ بإضافة معلم جديد</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}