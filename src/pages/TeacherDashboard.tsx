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
    grade: 1,
    content_type: "video",
    video_url: "",
    pdf_url: "",
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-materials')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفع الملف",
        variant: "destructive",
      });
      return null;
    }
  };

  const addLesson = async () => {
    try {
      const userSession = localStorage.getItem('user_session');
      if (!userSession || !profile) return;
      
      const sessionData = JSON.parse(userSession);
      if (!sessionData.user_id) return;

      const lessonData = {
        title: newLesson.title,
        description: newLesson.description,
        subject: newLesson.subject,
        grade: newLesson.grade,
        teacher_id: sessionData.user_id,
        content_type: newLesson.content_type,
        duration_minutes: newLesson.duration_minutes,
        video_url: newLesson.video_url,
        pdf_url: newLesson.pdf_url,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("lessons")
        .insert([lessonData])
        .select()
        .single();

      if (error) throw error;

      setLessons([data, ...lessons]);
      setNewLesson({
        title: "",
        description: "",
        subject: "",
        grade: 1,
        content_type: "video",
        video_url: "",
        pdf_url: "",
        duration_minutes: 30,
      });
      setShowAddLesson(false);

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الدرس بنجاح",
      });
    } catch (error) {
      console.error("خطأ في إضافة الدرس:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة الدرس",
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
                  <Input
                    id="grade"
                    type="number"
                    value={newLesson.grade}
                    onChange={(e) => setNewLesson({ ...newLesson, grade: parseInt(e.target.value) })}
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">مدة الدرس (دقائق)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLesson.duration_minutes}
                    onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>نوع المحتوى</Label>
                <Select value={newLesson.content_type} onValueChange={(value: any) => setNewLesson({ ...newLesson, content_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">رفع فيديو</SelectItem>
                    <SelectItem value="youtube_link">رابط يوتيوب</SelectItem>
                    <SelectItem value="pdf">ملف PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newLesson.content_type === 'youtube_link' && (
                <div>
                  <Label htmlFor="youtube_url">رابط اليوتيوب</Label>
                  <Input
                    id="youtube_url"
                    value={newLesson.video_url}
                    onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {newLesson.content_type === 'video' && (
                <div>
                  <Label htmlFor="video_file">رفع فيديو</Label>
                  <Input
                    id="video_file"
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, 'video');
                        if (url) setNewLesson({ ...newLesson, video_url: url });
                      }
                    }}
                  />
                </div>
              )}

              {newLesson.content_type === 'pdf' && (
                <div>
                  <Label htmlFor="pdf_file">رفع ملف PDF</Label>
                  <Input
                    id="pdf_file"
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, 'pdf');
                        if (url) setNewLesson({ ...newLesson, pdf_url: url });
                      }
                    }}
                  />
                </div>
              )}

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