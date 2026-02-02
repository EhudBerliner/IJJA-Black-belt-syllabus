// גרסת Service Worker - עדכן מספר זה כדי לאלץ עדכון
const CACHE_VERSION = 'v12.2.0';
const CACHE_NAME = `ijja-syllabus-${CACHE_VERSION}`;

// רשימת קבצים לשמירה במטמון
const urlsToCache = [
    './',
    './index.html',
    './Logo.png',
    './Black_belt_syllabus_IJJA.csv',
    './manifest.json',
    './Orange.png',
    './Yellow.png',
    './Green.png',
    './Blue.png',
    './Brown.png',
    './Black.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap'
];

// התקנה - מתרחשת בפעם הראשונה או כאשר יש גרסה חדשה
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install - Version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // אלץ את ה-SW החדש להיות אקטיבי מיד
                return self.skipWaiting();
            })
    );
});

// הפעלה - מתרחשת אחרי התקנה
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate - Version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // מחק את כל המטמון הישן
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // השתלט על כל הלקוחות הפתוחים מיד
            return self.clients.claim();
        })
    );
});

// טיפול בבקשות
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // אל תשמור במטמון בקשות של YouTube API
    if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com')) {
        return;
    }

    // אסטרטגיית Network First לקובץ CSV - תמיד ננסה לקבל את הגרסה העדכנית
    if (url.pathname.endsWith('.csv')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // שמור בכאש רק אם התגובה תקינה
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // אם אין רשת, השתמש במטמון
                    return caches.match(request);
                })
        );
        return;
    }

    // אסטרטגיית Cache First לשאר הקבצים
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // אם יש במטמון - החזר אותו
                if (response) {
                    return response;
                }

                // אם אין במטמון - טען מהרשת ושמור
                return fetch(request).then((response) => {
                    // בדוק שהתגובה תקינה לפני שמירה
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                });
            })
    );
});

// הודעה ללקוח על עדכון זמין
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[ServiceWorker] Force clearing cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});
