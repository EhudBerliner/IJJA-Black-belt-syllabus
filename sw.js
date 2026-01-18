importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
    console.log(`Workbox is loaded`);

    // אסטרטגיית "Stale-While-Revalidate" לקוד האפליקציה (HTML, CSS, JS)
    // מציג מה-Cache מיד ומעדכן ברקע מהשרת
    workbox.routing.registerRoute(
        ({request}) => request.destination === 'document' || 
                       request.destination === 'script' || 
                       request.destination === 'style',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'app-assets',
        })
    );

    // אסטרטגיית "Network First" עבור קובץ ה-CSV
    // מנסה להביא את הכי מעודכן מהשרת, אם אין אינטרנט - לוקח מהזיכרון
    workbox.routing.registerRoute(
        ({url}) => url.pathname.endsWith('.csv'),
        new workbox.strategies.NetworkFirst({
            cacheName: 'data-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 10,
                }),
            ],
        })
    );

    // שמירה של תמונות (Logo וכדומה) לזמן ארוך
    workbox.routing.registerRoute(
        ({request}) => request.destination === 'image',
        new workbox.strategies.CacheFirst({
            cacheName: 'image-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 20,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 ימים
                }),
            ],
        })
    );

    // שמירה של פונטים מ-Google Fonts
    workbox.routing.registerRoute(
        ({url}) => url.origin === 'https://fonts.googleapis.com' || 
                   url.origin === 'https://fonts.gstatic.com' ||
                   url.origin === 'https://cdnjs.cloudflare.com',
        new workbox.strategies.CacheFirst({
            cacheName: 'external-resources',
        })
    );
}
