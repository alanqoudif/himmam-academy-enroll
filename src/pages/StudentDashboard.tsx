import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, FileText, ExternalLink, Play, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProfile {
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
  teacher_id: string;
  views_count?: number;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
    
    // فحص الجلسات الأخرى للطلاب كل 30 ثانية
    const sessionCheck = setInterval(() => {
      const userSession = localStorage.getItem('user_session');
      if (userSession) {
        const sessionData = JSON.parse(userSession);
        if (sessionData.profile?.role === 'student') {
          // فحص إذا كان هناك جلسة أخرى أحدث
          const currentDeviceSession = localStorage.getItem(`user_session_${sessionData.user_id}`);
          if (currentDeviceSession) {
            const currentSession = JSON.parse(currentDeviceSession);
            if (currentSession.device_id !== sessionData.device_id && 
                currentSession.login_time > sessionData.login_time) {
              // توجد جلسة أحدث، قم بتسجيل الخروج
              localStorage.clear();
              window.location.href = '/login';
              return;
            }
          }
        }
      }
    }, 30000);

    return () => clearInterval(sessionCheck);
  }, []);

  const fetchStudentData = async () => {
    try {
      // محاولة الحصول على البيانات من session storage أولاً
      const userSession = localStorage.getItem('user_session');
      let currentUser = null;
      
      if (userSession) {
        const sessionData = JSON.parse(userSession);
        if (sessionData.profile && sessionData.profile.role === 'student') {
          currentUser = sessionData;
        }
      }
      
      if (!currentUser) {
        throw new Error('لا توجد بيانات طالب');
      }

      // جلب بيانات الطالب من قاعدة البيانات
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUser.user_id)
        .eq("role", "student")
        .single();

      if (profileError) {
        console.error('خطأ في جلب ملف الطالب:', profileError);
        throw new Error('فشل في جلب بيانات الطالب');
      }

      if (profileData) {
        setProfile(profileData);
        
        // جلب الدروس للمواد المسجل فيها الطالب
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("grade", profileData.grade)
          .in("subject", profileData.subjects || [])
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (lessonsData) {
          setLessons(lessonsData);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recordView = async (lessonId: string) => {
    try {
      const userSession = localStorage.getItem('user_session');
      if (!userSession) return;
      
      const sessionData = JSON.parse(userSession);
      if (!sessionData.user_id) return;

      // تسجيل مشاهدة الدرس
      await supabase.from("lesson_views").upsert({
        lesson_id: lessonId,
        student_id: sessionData.user_id,
        completed: false,
        watch_duration_minutes: 0
      });

      // تحديث عدد المشاهدات - سنقوم بذلك يدوياً
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('views_count')
        .eq('id', lessonId)
        .single();
      
      if (currentLesson) {
        await supabase
          .from('lessons')
          .update({ 
            views_count: (currentLesson.views_count || 0) + 1 
          })
          .eq('id', lessonId);
      }
    } catch (error) {
      console.error("خطأ في تسجيل المشاهدة:", error);
    }
  };

  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    recordView(lesson.id);
  };

  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
              <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                إغلاق
              </Button>
            </div>
            
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                {selectedLesson.subject}
              </Badge>
              <p className="text-muted-foreground">{selectedLesson.description}</p>
            </div>

            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {selectedLesson.content_type === 'youtube_link' && selectedLesson.video_url && (
                <iframe
                  src={`${selectedLesson.video_url.replace('watch?v=', 'embed/')}?modestbranding=1&rel=0&showinfo=0&disablekb=1`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={selectedLesson.title}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                />
              )}
              
              {selectedLesson.content_type === 'video' && selectedLesson.video_url && (
                <video
                  src={selectedLesson.video_url}
                  controls
                  className="w-full h-full rounded-lg"
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  متصفحك لا يدعم عرض الفيديو
                </video>
              )}
              
              {selectedLesson.content_type === 'pdf' && selectedLesson.pdf_url && (
                <iframe
                  src={`${selectedLesson.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full rounded-lg pointer-events-none select-none"
                  title={selectedLesson.title}
                  sandbox="allow-scripts allow-same-origin"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  if (!profile) {
    return <div className="p-6">لم يتم العثور على بيانات الطالب</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">منصة التعلم</h1>
            <p className="text-muted-foreground mt-2">مرحباً {profile.full_name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/change-password'}
            >
              <Lock className="h-4 w-4 mr-2" />
              تغيير كلمة المرور
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* معلومات الطالب */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>بياناتي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">الاسم</label>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">الصف</label>
                <p className="font-medium">الصف {profile.grade}</p>
              </div>
              <div>
                <label className="text-sm font-medium">المواد المسجلة</label>
                <p className="font-medium">{profile.subjects?.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الدروس المتاحة */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">الدروس المتاحة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="cursor-pointer hover:shadow-lg transition-shadow">
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
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    المدة: {lesson.duration_minutes} دقيقة
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {lesson.views_count || 0}
                  </div>
                </div>
                <Button 
                  onClick={() => openLesson(lesson)}
                  className="w-full"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  مشاهدة الدرس
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد دروس متاحة</h3>
              <p className="text-muted-foreground">
                لم يتم إضافة دروس للمواد المسجل فيها بعد
              </p>
            </CardContent>
          </Card>
        )}

        {/* عارض الدروس */}
        {renderLessonContent()}
      </div>
    </div>
  );
}