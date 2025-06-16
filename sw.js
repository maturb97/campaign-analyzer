/**
 * Service Worker for Campaign Analyzer PWA
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'campaign-analyzer-v1.0.0';
const STATIC_CACHE_NAME = 'campaign-analyzer-static-v1.0.0';

// Files to cache for offline use
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/components.css', 
  './css/responsive.css',
  './js/app.js',
  './js/data-processor.js',
  './js/charts.js',
  './js/tables.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache successful responses
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Service Worker: Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for data processing
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'process-campaign-data') {
    event.waitUntil(processPendingData());
  }
});

// Push notifications (for future use)
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Campaign analysis complete',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: './assets/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './assets/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Campaign Analyzer', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Helper function to process pending data
async function processPendingData() {
  try {
    console.log('Service Worker: Processing pending campaign data');
    
    // Get pending data from IndexedDB or cache
    const cache = await caches.open(CACHE_NAME);
    const pendingData = await cache.match('pending-data');
    
    if (pendingData) {
      const data = await pendingData.json();
      console.log('Service Worker: Found pending data:', data);
      
      // Process the data (this would typically involve API calls)
      // For now, just log that we would process it
      console.log('Service Worker: Would process data in background');
      
      // Remove pending data after processing
      await cache.delete('pending-data');
    }
  } catch (error) {
    console.error('Service Worker: Failed to process pending data:', error);
  }
}

// Cache management
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(name => 
    name.startsWith('campaign-analyzer-') && 
    name !== STATIC_CACHE_NAME && 
    name !== CACHE_NAME
  );
  
  await Promise.all(
    cachesToDelete.map(name => caches.delete(name))
  );
  
  console.log('Service Worker: Cleaned up old caches');
}

// Periodic cache cleanup
setInterval(cleanupCaches, 24 * 60 * 60 * 1000); // Daily cleanup