const CACHE_NAME = 'ijja-syllabus-v6';
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
      console.log('PWA: Caching assets');
      return cache.addAll(ASSETS);
    })
  );
  // גורם ל-Service Worker החדש להיכנס לפעולה מיד
  self.skipWaiting();
});

// הפעלה: מחיקת מטמון ישן (חשוב מאוד כדי שהשינויים יופיעו)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  // משתלט על הדף מיד ללא צורך בריענון נוסף
  return self.clients.claim();
});

// אסטרטגיית טעינה: מציג מהמטמון ומעדכן מהרשת ברקע
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});


