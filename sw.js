// עדכון גרסה ל-v6 כדי שהדפדפן ירענן את הנגן החדש והעיצוב אצל המשתמש
const CACHE_NAME = 'ijja-syllabus-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Logo.png',
  './Black_belt_syllabus_IJJA.csv'
];

// התקנה: שמירת הנכסים במטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Caching assets v6');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// הפעלה: מחיקת מטמון ישן
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

// אסטרטגיית טעינה: מציג מהמטמון ומעדכן מהרשת ברקע
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

