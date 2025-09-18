const CACHE_NAME = 'best-electronics-v1';
const urlsToCache = [
  '/',
  '/admin/dashboard',
  '/admin/users',
  '/admin/backup',
  '/globals.css',
  '/manifest.json'
];

// Установка service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию или загружаем из сети
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Активация service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push уведомления
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Best Electronics', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return fetch('/api/sync')
    .then((response) => {
      if (response.ok) {
        console.log('Background sync completed');
      }
    })
    .catch((error) => {
      console.error('Background sync failed:', error);
    });
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'UPDATE_CACHE') {
    // Обновление кэша
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Updating cache');
          return cache.addAll(urlsToCache);
        })
        .then(() => {
          // Уведомляем клиента об успешном обновлении
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'CACHE_UPDATED' });
            });
          });
        })
    );
  }
});

