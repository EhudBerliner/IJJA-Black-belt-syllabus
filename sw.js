const CACHE_NAME = 'ijja-syllabus-v4'; // עדכון גרסה לריענון המערכת
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Logo.png',
  './Black_belt_syllabus_IJJA.csv'
];

// התקנה: שמירת הנכסים הבסיסיים במטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Caching critical assets');
      return cache.addAll(ASSETS);
    })
  );
  // גורם ל-Service Worker החדש להיכנס לפעולה מיד
  self.skipWaiting();
});

// הפעלה: ניקוי גרסאות מטמון ישנות (חשוב מאוד להופעת הודעת ההתקנה)
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

// אסטרטגיית Stale-While-Revalidate:
// מציג מהמטמון מיד למהירות מקסימלית, ומעדכן מהרשת ברקע.
self.addEventListener('fetch', (event) => {
  // אנחנו מטפלים רק בבקשות GET (לא כולל פונקציות חיצוניות אם יש)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // אם התגובה תקינה, נשמור עותק מעודכן במטמון
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // במקרה של חוסר אינטרנט מוחלט ואין במטמון
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
