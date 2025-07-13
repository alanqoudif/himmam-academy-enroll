import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Video, FileText, ExternalLink } from "lucide-react";

interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  subjects: string[];
  grade: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  video_url?: string;
  pdf_url?: string;
  content_type: string;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  teacher_id: string;
  is_active?: boolean;
  views_count?: number;
  file_size_mb?: number;
  thumbnail_url?: string;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // بيانات الدرس الجديد
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    subject: "",
    grade: 5,
    content_types: [] as string[], // تغيير لدعم أنواع متعددة
    video_url: "",
    pdf_url: "",
    youtube_url: "",
    duration_minutes: 30,
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      // محاولة الحصول على البيانات من session storage أولاً
      const userSession = localStorage.getItem('user_session');
      console.log('User session from localStorage:', userSession);
      
      if (!userSession) {
        throw new Error('لا توجد جلسة مستخدم');
      }
      
      const sessionData = JSON.parse(userSession);
      console.log('Session data parsed:', sessionData);
      
      if (!sessionData.profile || sessionData.profile.role !== 'teacher') {
        throw new Error('المستخدم ليس معلماً');
      }
      
      if (!sessionData.user_id) {
        throw new Error('معرف المستخدم غير موجود');
      }

      // جلب بيانات المعلم من قاعدة البيانات مباشرة
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sessionData.user_id)
        .eq("role", "teacher")
        .single();

      if (profileError) {
        console.error('خطأ في جلب ملف المعلم:', profileError);
        
        // إذا لم نجد البيانات بـ user_id، جرب البحث بالاسم والهاتف
        const { data: backupProfileData, error: backupError } = await supabase
          .from("profiles")
          .select("*")
          .eq("full_name", sessionData.profile.full_name)
          .eq("phone", sessionData.profile.phone)
          .eq("role", "teacher")
          .single();
          
        if (backupError || !backupProfileData) {
          throw new Error('فشل في جلب بيانات المعلم من قاعدة البيانات');
        }
        
        // تحديث session بالمعرف الصحيح
        sessionData.user_id = backupProfileData.user_id;
        localStorage.setItem('user_session', JSON.stringify(sessionData));
        
        setProfile(backupProfileData);
        
        // جلب الدروس
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("teacher_id", backupProfileData.user_id)
          .order("created_at", { ascending: false });

        if (lessonsData) {
          setLessons(lessonsData);
        }
        
        return;
      }

      if (profileData) {
        console.log('Profile data found:', profileData);
        setProfile(profileData);
        
        // جلب الدروس الخاصة بالمعلم
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("teacher_id", sessionData.user_id)
          .order("created_at", { ascending: false });

        if (lessonsData) {
          console.log('Lessons found:', lessonsData.length);
          setLessons(lessonsData);
        }
      }
    } catch (error: any) {
      console.error("خطأ في جلب البيانات:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'video' | 'pdf') => {
    try {
      console.log(`بدء رفع ملف ${type}:`, file.name, file.size);
      
      // التحقق من بيانات المستخدم أولاً
      if (!profile?.user_id) {
        throw new Error('لا توجد بيانات مستخدم صحيحة');
      }

      // إنشاء session token مؤقت للمصادقة
      const userSession = localStorage.getItem('user_session');
      if (!userSession) {
        throw new Error('جلسة المستخدم غير موجودة');
      }

      const sessionData = JSON.parse(userSession);
      
      // إنشاء supabase client مع session token
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(
        'https://othnpzfrtsesvwfwjfpr.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aG5wemZydHNlc3Z3ZndqZnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjU1MDcsImV4cCI6MjA2NzUwMTUwN30.quhOcQUmerWlmg-dXqIF9TCi3P_XP0DNSDyCo6b-ejc',
        {
          auth: {
            persistSession: false
          }
        }
      );

      // تسجيل دخول مؤقت باستخدام بيانات المستخدم
      const { data: authData, error: authError } = await tempClient.auth.signInAnonymously();
      
      if (authError) {
        console.error('خطأ في المصادقة:', authError);
        // المتابعة بدون مصادقة مؤقتة - استخدام العميل الأساسي
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      console.log('مسار الملف:', filePath);
      console.log('بيانات المستخدم:', profile.user_id);

      let { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('خطأ في رفع الملف:', uploadError);
        
        // إذا كان الخطأ متعلق بالصلاحيات، جرب مرة أخرى مع معاملات مختلفة
        if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('Unauthorized')) {
          console.log('محاولة رفع الملف مرة أخرى مع معاملات مختلفة...');
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from('lesson-materials')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (retryError) {
            throw retryError;
          }
          
          uploadData = retryData;
        } else {
          throw uploadError;
        }
      }

      console.log('تم رفع الملف بنجاح:', uploadData);

      const { data: urlData } = supabase.storage
        .from('lesson-materials')
        .getPublicUrl(filePath);

      console.log('رابط الملف:', urlData.publicUrl);
      
      toast({
        title: "تم بنجاح",
        description: `تم رفع ملف ${type === 'video' ? 'الفيديو' : 'PDF'} بنجاح`,
      });

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('خطأ في رفع الملف:', error);
      
      let errorMessage = `حدث خطأ في رفع ملف ${type === 'video' ? 'الفيديو' : 'PDF'}`;
      
      if (error.message?.includes('row-level security')) {
        errorMessage = 'ليس لديك صلاحية لرفع الملفات. يرجى التواصل مع الإدارة.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "خطأ في رفع الملف",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const addLesson = async () => {
    try {
      console.log('بدء إضافة درس جديد...');
      console.log('بيانات الدرس:', newLesson);
      
      // التحقق من بيانات المستخدم
      if (!profile?.user_id) {
        console.error('لا يوجد معرف مستخدم');
        toast({
          title: "خطأ",
          description: "لا توجد بيانات مستخدم صحيحة",
          variant: "destructive",
        });
        return;
      }

      // التحقق من الحقول المطلوبة
      if (!newLesson.title.trim() || !newLesson.subject || !newLesson.description.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة (العنوان، المادة، الوصف)",
          variant: "destructive",
        });
        return;
      }

      // التحقق من وجود محتوى واحد على الأقل
      const hasVideoFile = !!newLesson.video_url && !newLesson.video_url.includes('youtube.com');
      const hasPdfFile = !!newLesson.pdf_url;
      const hasYoutubeLink = !!newLesson.youtube_url && newLesson.youtube_url.includes('youtube.com');
      
      console.log('التحقق من المحتوى:', {
        hasVideoFile,
        hasPdfFile, 
        hasYoutubeLink,
        video_url: newLesson.video_url,
        pdf_url: newLesson.pdf_url,
        youtube_url: newLesson.youtube_url
      });
      
      if (!hasVideoFile && !hasPdfFile && !hasYoutubeLink) {
        toast({
          title: "خطأ",
          description: "يرجى إضافة محتوى واحد على الأقل (فيديو، PDF، أو رابط يوتيوب)",
          variant: "destructive",
        });
        return;
      }

      // تحديد أنواع المحتوى المتاحة
      const contentTypes = [];
      if (hasVideoFile) contentTypes.push('video');
      if (hasPdfFile) contentTypes.push('pdf');
      if (hasYoutubeLink) contentTypes.push('youtube_link');

      console.log('أنواع المحتوى:', contentTypes);

      const lessonData = {
        title: newLesson.title.trim(),
        description: newLesson.description.trim(),
        subject: newLesson.subject,
        grade: newLesson.grade,
        teacher_id: profile.user_id,
        content_type: contentTypes.join(','),
        duration_minutes: newLesson.duration_minutes,
        video_url: hasYoutubeLink ? newLesson.youtube_url : (hasVideoFile ? newLesson.video_url : null),
        pdf_url: hasPdfFile ? newLesson.pdf_url : null,
        thumbnail_url: null,
        is_active: true,
        views_count: 0,
        file_size_mb: 0
      };

      console.log('بيانات الدرس النهائية:', lessonData);

      const { data, error } = await supabase
        .from("lessons")
        .insert([lessonData])
        .select()
        .single();

      if (error) {
        console.error("خطأ في قاعدة البيانات:", error);
        throw error;
      }

      console.log("تم إنشاء الدرس بنجاح:", data);
      
      // تحديث قائمة الدروس
      await fetchTeacherData();
      
      // إعادة تعيين النموذج
      setNewLesson({
        title: "",
        description: "",
        subject: "",
        grade: profile.grade || 5,
        content_types: [],
        video_url: "",
        pdf_url: "",
        youtube_url: "",
        duration_minutes: 30,
      });
      setShowAddLesson(false);

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الدرس بنجاح",
      });
      
    } catch (error: any) {
      console.error("خطأ في إضافة الدرس:", error);
      
      let errorMessage = "حدث خطأ في إضافة الدرس";
      if (error?.message?.includes('row-level security')) {
        errorMessage = "ليس لديك صلاحية لإضافة الدروس. يرجى التواصل مع الإدارة.";
      } else if (error?.message) {
        errorMessage = `خطأ: ${error.message}`;
      } else if (error?.details) {
        errorMessage = `تفاصيل الخطأ: ${error.details}`;
      }
      
      toast({
        title: "خطأ في إضافة الدرس",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">لم يتم العثور على بيانات المعلم</h3>
            <p className="text-muted-foreground mb-4">
              يرجى التواصل مع الإدارة للتأكد من صحة بياناتك
            </p>
            <Button onClick={() => {
              localStorage.removeItem('user_session');
              window.location.href = '/login';
            }}>
              العودة لتسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المعلم</h1>
          <p className="text-muted-foreground mt-2">مرحباً {profile.full_name}</p>
        </div>

        {/* معلومات المعلم */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>بياناتي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>الاسم</Label>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div>
                <Label>الصف</Label>
                <p className="font-medium">الصف {profile.grade}</p>
              </div>
              <div>
                <Label>المواد</Label>
                <p className="font-medium">{profile.subjects?.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الدروس */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">دروسي</h2>
          <Button onClick={() => setShowAddLesson(!showAddLesson)}>
            إضافة درس جديد
          </Button>
        </div>

        {/* إضافة درس جديد */}
        {showAddLesson && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>إضافة درس جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">عنوان الدرس</Label>
                  <Input
                    id="title"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    placeholder="أدخل عنوان الدرس"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">المادة</Label>
                  <Select value={newLesson.subject} onValueChange={(value) => setNewLesson({ ...newLesson, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {profile.subjects?.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">وصف الدرس</Label>
                <Textarea
                  id="description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="أدخل وصف الدرس"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">الصف</Label>
                  <Select value={newLesson.grade.toString()} onValueChange={(value) => setNewLesson({ ...newLesson, grade: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* عرض الصفوف التي يدرسها المعلم فقط */}
                      {profile.grade && (
                        <SelectItem value={profile.grade.toString()}>
                          الصف {profile.grade}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">مدة الدرس (دقائق)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLesson.duration_minutes}
                    onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) || 30 })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>أنواع المحتوى المتاحة</Label>
                <p className="text-sm text-muted-foreground mb-4">يمكنك إضافة أكثر من نوع محتوى في نفس الدرس</p>
                
                <div className="space-y-4 border rounded-lg p-4">
                  {/* رابط يوتيوب */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="youtube_check"
                        checked={!!newLesson.youtube_url}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewLesson({ ...newLesson, youtube_url: "https://www.youtube.com/watch?v=" });
                          } else {
                            setNewLesson({ ...newLesson, youtube_url: "" });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="youtube_check" className="font-medium">رابط يوتيوب</Label>
                    </div>
                    {!!newLesson.youtube_url && (
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newLesson.youtube_url}
                        onChange={(e) => setNewLesson({ ...newLesson, youtube_url: e.target.value })}
                      />
                    )}
                  </div>

                  {/* رفع فيديو */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="video_check"
                        checked={!!newLesson.video_url && !newLesson.youtube_url}
                        onChange={(e) => {
                          if (e.target.checked && !newLesson.youtube_url) {
                            // تفعيل حقل رفع الفيديو
                            document.getElementById('video_file_input')?.click();
                          } else {
                            setNewLesson({ ...newLesson, video_url: "" });
                          }
                        }}
                        className="w-4 h-4"
                        disabled={!!newLesson.youtube_url}
                      />
                      <Label htmlFor="video_check" className="font-medium">رفع ملف فيديو</Label>
                      {!!newLesson.youtube_url && (
                        <span className="text-sm text-muted-foreground">(معطل - يوجد رابط يوتيوب)</span>
                      )}
                    </div>
                    
                    <Input
                      id="video_file_input"
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('ملف فيديو محدد:', file.name);
                          const url = await handleFileUpload(file, 'video');
                          if (url) {
                            setNewLesson({ ...newLesson, video_url: url });
                            console.log('تم حفظ رابط الفيديو:', url);
                          }
                        }
                      }}
                      className={!newLesson.youtube_url ? "" : "hidden"}
                    />
                    
                    {!!newLesson.video_url && !newLesson.youtube_url && (
                      <p className="text-sm text-green-600 mt-1">✓ تم رفع الفيديو بنجاح</p>
                    )}
                  </div>

                  {/* رفع PDF */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="pdf_check"
                        checked={!!newLesson.pdf_url}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // تفعيل حقل رفع الـ PDF
                            document.getElementById('pdf_file_input')?.click();
                          } else {
                            setNewLesson({ ...newLesson, pdf_url: "" });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="pdf_check" className="font-medium">رفع ملف PDF</Label>
                    </div>
                    
                    <Input
                      id="pdf_file_input"
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('ملف PDF محدد:', file.name);
                          const url = await handleFileUpload(file, 'pdf');
                          if (url) {
                            setNewLesson({ ...newLesson, pdf_url: url });
                            console.log('تم حفظ رابط PDF:', url);
                          }
                        }
                      }}
                    />
                    
                    {!!newLesson.pdf_url && (
                      <p className="text-sm text-green-600 mt-1">✓ تم رفع ملف PDF بنجاح</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addLesson}>إضافة الدرس</Button>
                <Button variant="outline" onClick={() => setShowAddLesson(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة الدروس */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lesson.content_type === 'video' && <Video className="h-5 w-5" />}
                  {lesson.content_type === 'pdf' && <FileText className="h-5 w-5" />}
                  {lesson.content_type === 'youtube_link' && <ExternalLink className="h-5 w-5" />}
                  {lesson.title}
                </CardTitle>
                <CardDescription>
                  {lesson.subject} - الصف {lesson.grade}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {lesson.description}
                </p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>المدة: {lesson.duration_minutes} دقيقة</span>
                  <span>النوع: {lesson.content_type}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد دروس بعد</h3>
              <p className="text-muted-foreground">ابدأ بإضافة درسك الأول</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}