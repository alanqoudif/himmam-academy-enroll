import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Check, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
}

interface OfflineDownloadManagerProps {
  lessons: Lesson[];
  onOfflineLesson: (lesson: Lesson) => void;
}

export default function OfflineDownloadManager({ lessons, onOfflineLesson }: OfflineDownloadManagerProps) {
  const [downloadingLessons, setDownloadingLessons] = useState<Set<string>>(new Set());
  const [cachedLessons, setCachedLessons] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    // مراقبة حالة الاتصال
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // جلب الدروس المخزنة
    loadCachedLessons();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedLessons = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const { lessons: cachedLessonsData } = event.data;
        const cachedIds = new Set(cachedLessonsData.map((l: Lesson) => l.id) as string[]);
        setCachedLessons(cachedIds);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHED_LESSONS' },
        [channel.port2]
      );
    }
  };

  const downloadLesson = async (lesson: Lesson) => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: 'خطأ',
        description: 'متصفحك لا يدعم التحميل للاستخدام بدون انترنت',
        variant: 'destructive'
      });
      return;
    }

    setDownloadingLessons(prev => new Set([...prev, lesson.id]));

    try {
      // إرسال البيانات للـ Service Worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_LESSON',
          lessonData: lesson
        });

        // انتظار تأكيد النجاح
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'LESSON_CACHED' && event.data.lessonId === lesson.id) {
            if (event.data.success) {
              setCachedLessons(prev => new Set([...prev, lesson.id]));
              toast({
                title: 'تم التحميل بنجاح',
                description: `تم تحميل درس "${lesson.title}" للاستخدام بدون انترنت`,
              });
            } else {
              toast({
                title: 'فشل التحميل',
                description: 'حدث خطأ أثناء تحميل الدرس',
                variant: 'destructive'
              });
            }
            setDownloadingLessons(prev => {
              const newSet = new Set(prev);
              newSet.delete(lesson.id);
              return newSet;
            });
            navigator.serviceWorker.removeEventListener('message', handleMessage);
          }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);

        // مهلة زمنية للتحميل
        setTimeout(() => {
          setDownloadingLessons(prev => {
            const newSet = new Set(prev);
            newSet.delete(lesson.id);
            return newSet;
          });
          navigator.serviceWorker.removeEventListener('message', handleMessage);
        }, 30000); // 30 ثانية
      }
    } catch (error) {
      console.error('Error downloading lesson:', error);
      toast({
        title: 'خطأ في التحميل',
        description: 'حدث خطأ أثناء تحميل الدرس',
        variant: 'destructive'
      });
      
      setDownloadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lesson.id);
        return newSet;
      });
    }
  };

  const removeCachedLesson = async (lessonId: string) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('himmam-offline-v1');
        await cache.delete(`lesson-${lessonId}`);
        
        setCachedLessons(prev => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });

        toast({
          title: 'تم الحذف',
          description: 'تم حذف الدرس من التخزين المحلي',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الدرس',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
          التعلم بدون انترنت
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "متصل" : "غير متصل"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          حمّل الدروس لمشاهدتها بدون انترنت في أي وقت
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lessons.map((lesson) => {
            const isDownloading = downloadingLessons.has(lesson.id);
            const isCached = cachedLessons.has(lesson.id);
            const canDownload = lesson.content_type === 'video' && lesson.video_url && !lesson.video_url.includes('youtube');
            
            return (
              <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                  <p className="text-xs text-muted-foreground">{lesson.subject}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {!canDownload && (
                    <Badge variant="outline" className="text-xs">
                      فقط أونلاين
                    </Badge>
                  )}
                  
                  {canDownload && isCached && (
                    <>
                      <Badge variant="default" className="text-xs bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        محمّل
                      </Badge>
                      <Button
                        onClick={() => removeCachedLesson(lesson.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {canDownload && !isCached && (
                    <Button
                      onClick={() => downloadLesson(lesson)}
                      disabled={isDownloading || !isOnline}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                    >
                      {isDownloading ? (
                        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  {isCached && (
                    <Button
                      onClick={() => onOfflineLesson(lesson)}
                      size="sm"
                      variant="default"
                      className="h-8 px-3"
                    >
                      مشاهدة
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {lessons.filter(l => l.content_type === 'video' && l.video_url && !l.video_url.includes('youtube')).length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            لا توجد دروس قابلة للتحميل حالياً
          </p>
        )}
      </CardContent>
    </Card>
  );
}