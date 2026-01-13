const CACHE_NAME = 'ijja-syllabus-v2'; // העלינו גרסה
const ASSETS = [
  './', 
  './index.html', 
  './manifest.json', 
  './Logo.png',
  './Black_belt_syllabus_IJJA.csv' // חובה להוסיף את הקובץ הזה!
];

// התקנה ושמירת הקבצים בזיכרון המטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Caching assets');
      return cache.addAll(ASSETS);
    })
  );
});

// הפעלה וניקוי מטמון ישן אם קיים
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
});

// שליפת נתונים מהמטמון (מאפשר עבודה ללא אינטרנט)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );

});



