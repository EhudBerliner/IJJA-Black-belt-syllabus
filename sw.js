const CACHE_NAME = 'ijja-syllabus-v2'; // שינוי גרסה כדי לרענן את המטמון
const ASSETS = [
  './', 
  './index.html', 
  './manifest.json', 
  './Logo.png',
  './Black_belt_syllabus_IJJA.csv', // הוספת קובץ הנתונים
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js', // מומלץ לשמור גם את הספרייה באופליין
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap'
];

// התקנה ושמירת הקבצים בזיכרון המטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
  // גורם ל-SW החדש להיכנס לתוקף מיד
  self.skipWaiting();
});

// הפעלה וניקוי מטמון ישן
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// אסטרטגיית Cache First - מחפש במטמון, ואם אין, פונה לרשת
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
