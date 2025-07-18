const CACHE_NAME = 'himmam-academy-v1';
const OFFLINE_CACHE = 'himmam-offline-v1';
const VIDEO_CACHE = 'himmam-videos-v1';

// ملفات أساسية للـ cache
const ESSENTIAL_FILES = [
  '/',
  '/student-dashboard',
  '/login',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/ad6d0aa7-ee9b-4c8b-8205-791c0b7943c8.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_FILES);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== VIDEO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// التعامل مع الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تخزين الفيديوهات
  if (request.url.includes('.mp4') || request.url.includes('.webm') || request.url.includes('video')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // تخزين الملفات والمواد التعليمية
  if (request.url.includes('.pdf') || request.url.includes('.doc') || request.url.includes('.ppt') || request.url.includes('.xlsx') || request.url.includes('/storage/')) {
    event.respondWith(
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // التعامل مع الطلبات العادية
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // تخزين الردود الناجحة
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // في حالة عدم وجود اتصال
        if (request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline content not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// رسائل من التطبيق
self.addEventListener('message', (event) => {
  console.log('SW received message:', event.data);
  
  if (event.data && event.data.type === 'CACHE_LESSON') {
    const { lessonData } = event.data;
    console.log('Caching lesson:', lessonData.title);
    cacheLesson(lessonData);
  }
  
  if (event.data && event.data.type === 'GET_CACHED_LESSONS') {
    console.log('Getting cached lessons');
    getCachedLessons().then((lessons) => {
      event.ports[0].postMessage({ lessons });
    });
  }
});

// تخزين درس للاستخدام offline
async function cacheLesson(lessonData) {
  let success = false;
  
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    
    // تخزين بيانات الدرس
    const lessonResponse = new Response(JSON.stringify(lessonData), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`lesson-${lessonData.id}`, lessonResponse);
    console.log('Lesson data cached successfully');

    // تخزين الفيديو إذا كان موجوداً
    if (lessonData.video_url && !lessonData.video_url.includes('youtube')) {
      try {
        console.log('Caching video:', lessonData.video_url);
        const videoResponse = await fetch(lessonData.video_url);
        if (videoResponse.ok) {
          const videoCache = await caches.open(VIDEO_CACHE);
          await videoCache.put(lessonData.video_url, videoResponse.clone());
          console.log('Video cached successfully');
        }
      } catch (error) {
        console.log('Failed to cache video:', error);
      }
    }

    // تخزين PDF إذا كان موجوداً
    if (lessonData.pdf_url) {
      try {
        console.log('Caching PDF:', lessonData.pdf_url);
        const pdfResponse = await fetch(lessonData.pdf_url);
        if (pdfResponse.ok) {
          await cache.put(lessonData.pdf_url, pdfResponse.clone());
          console.log('PDF cached successfully');
        }
      } catch (error) {
        console.log('Failed to cache PDF:', error);
      }
    }

    // تخزين المواد الإضافية
    if (lessonData.materials && lessonData.materials.length > 0) {
      for (const materialUrl of lessonData.materials) {
        try {
          console.log('Caching material:', materialUrl);
          const materialResponse = await fetch(materialUrl);
          if (materialResponse.ok) {
            await cache.put(materialUrl, materialResponse.clone());
            console.log('Material cached successfully');
          }
        } catch (error) {
          console.log('Failed to cache material:', error);
        }
      }
    }

    success = true;
    console.log('All lesson content cached successfully');
  } catch (error) {
    console.error('Error caching lesson:', error);
  }

  // إشعار النجاح أو الفشل
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'LESSON_CACHED',
        lessonId: lessonData.id,
        success: success
      });
    });
  } catch (error) {
    console.error('Error sending message to clients:', error);
  }
}

// جلب الدروس المخزنة
async function getCachedLessons() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const keys = await cache.keys();
    const lessons = [];

    for (const key of keys) {
      if (key.url.includes('lesson-')) {
        const response = await cache.match(key);
        const lessonData = await response.json();
        lessons.push(lessonData);
      }
    }

    return lessons;
  } catch (error) {
    console.error('Error getting cached lessons:', error);
    return [];
  }
}