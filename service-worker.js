self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('toDoCache').then(function(cache) {
      return cache.addAll([
        '.',
        'index.html',
        'styles/main.css',
        'styles/reset.min.css',
        'styles/font-awesome.min.css'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('toDoCache').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(
          function(networkResponse) {
            if (networkResponse) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          },
          function(e) {
          }
        );
        return response || fetchPromise;
      });
    })
  );
});
