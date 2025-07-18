import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // التحقق من تثبيت التطبيق
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // استماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
      
      // إظهار الإشعار بعد ثانيتين
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 2000);
    };

    // استماع لحدث appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // تأجيل الإشعار لمدة يوم
    localStorage.setItem('pwa-dismiss-time', Date.now().toString());
  };

  // عدم إظهار الإشعار إذا تم رفضه مؤخراً
  useEffect(() => {
    const dismissTime = localStorage.getItem('pwa-dismiss-time');
    if (dismissTime) {
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissTime) < dayInMs) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-strong">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 p-2 rounded-lg">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">تثبيت تطبيق همم</h3>
                <p className="text-xs opacity-90">
                  ثبت التطبيق للوصول السريع والتعلم offline
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 h-8 px-3 text-xs"
              >
                تثبيت
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}