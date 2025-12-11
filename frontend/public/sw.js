// Simple service worker that avoids Response.clone() errors
// This is a minimal service worker for development

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Don't try to cache API requests - just pass them through
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // For other requests, just fetch normally without caching
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a basic offline response if fetch fails
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    })
  );
});
