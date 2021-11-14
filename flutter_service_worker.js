'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "00201e014a4e3533bc9102ade5c2c6e8",
"assets/assets/images/Beach_Front.jpg": "14c85f8332cd97969d2a560d94725152",
"assets/assets/images/bg.jpg": "be094934b34cf7249ec45565a298f409",
"assets/assets/images/bg2.jpg": "da7660e65ce2c01fcf9be70b11d94a9a",
"assets/assets/images/bg22.jpg": "ed77ca62141ba7165966211f9db1b60e",
"assets/assets/images/bg3.jpg": "ee47b360177325ac32333e119cc3cf53",
"assets/assets/images/bgg.jpg": "c9cecd15254aaee58d4676b09f1a2c72",
"assets/assets/images/Blue_Ocean_Villa.jpg": "ee084700bf0e5236f95896974f3e2184",
"assets/assets/images/boat.jpg": "5c6d7c08b98ee2be473e9070cc23d526",
"assets/assets/images/boatt.jpg": "50504cd6b9a775614025ae1de83909c6",
"assets/assets/images/cover.jpg": "43d02be02f8ebb52ed2a70cf856f3376",
"assets/assets/images/Green_Ocean_Villa.jpg": "d1350e2e558f4d092b2d0202cff0aec8",
"assets/assets/images/indigo.jpg": "c58958a3a8db995bc768ec1de632ae02",
"assets/assets/images/Ocean_Front.jpg": "a27087f9627a402e4768b30592a074dd",
"assets/assets/images/Pano_Mini_Sea_View.jpg": "ee0252d55604960aa2631b24210d29a5",
"assets/assets/images/Pano_Sea_Ocean_View.jpg": "c9c871792ed81f71728dc7791983fa2e",
"assets/assets/images/pat.jpg": "0a594892e7f9287d2ebce424ff6e548d",
"assets/assets/images/profile.png": "31c10c20d326b9ab4937a675d0a9bcd6",
"assets/assets/images/rimta.jpg": "6e3a9c08f2a691919413bdd5c29d2421",
"assets/assets/images/Seaside_View.jpg": "d31be7b81be3353f2a0ef3058454c5cc",
"assets/assets/images/summer.jpg": "75b5698887aaa67c6c5719104da37c8b",
"assets/assets/images/Superior_Room.jpg": "7168e218d54096ff20fc04e8c14df6b7",
"assets/assets/images/weather.jpg": "f04b38a1f76b29b78343d42bc3a515ad",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "11259c18ef8980d1968250b1f17ddb83",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "1d4f72210120257e87206e98d7d5653d",
"/": "1d4f72210120257e87206e98d7d5653d",
"main.dart.js": "94c7782a3223d5bb8b2dfcaa2c3084b6",
"manifest.json": "817ce5a1a409414d441a8aa740a36991",
"version.json": "54637c1295e7b7b96e4d0e768313aa61"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
