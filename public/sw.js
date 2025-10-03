if (!self.define) {
  let s,
    e = {};
  const c = (c, t) => (
    (c = new URL(c + '.js', t).href),
    e[c] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = c), (s.onload = e), document.head.appendChild(s));
        } else ((s = c), importScripts(c), e());
      }).then(() => {
        let s = e[c];
        if (!s) throw new Error(`Module ${c} didn’t register its module`);
        return s;
      })
  );
  self.define = (t, i) => {
    const a =
      s ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (e[a]) return;
    let n = {};
    const r = (s) => c(s, a),
      o = { module: { uri: a }, exports: n, require: r };
    e[a] = Promise.all(t.map((s) => o[s] || r(s))).then((s) => (i(...s), n));
  };
}
define(['./workbox-977fb9bf'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        {
          url: '/_next/app-build-manifest.json',
          revision: 'e3cfbee6586d9bb75d36964c5cad7187',
        },
        {
          url: '/_next/static/YtsmrZ5GPQsmxvcKGOwsX/_buildManifest.js',
          revision: '446e35a73c6fca7d57465ac8b4ccea2b',
        },
        {
          url: '/_next/static/YtsmrZ5GPQsmxvcKGOwsX/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1013-cbd1eeaa20359c9c.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/1265-79de35ac5fd51e5b.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/2028-5accd7d99f6debfc.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/2355-b69c6d46dc5cd7df.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/2715-d8512df92f617add.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/3145-6563eb9cbaf43920.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/3377-01ee46985214a365.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/3549-21731dbed9063a34.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/3633-c7f9f7c1052f5579.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4102-0c03dd9434165210.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4202-0a4ca25a8ba5ca8c.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4236-075fa1b483660f4b.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4612-972582951e073787.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4666-e0abe5b331f8fa4b.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4803-e0110906e3e3fd5d.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/4895-584bc3f04fc2c742.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/5277-15dfa4ef3f9725cc.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/540a570b-bf2f282f34893387.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/5413-fa9b5fa7d87b21fa.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/5733-f4176c90999834b3.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/6201-c29817c0c018e9c9.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/6446-834fd9fa77cb2378.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7255-ce24fbc7ba52ac3d.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7458-042a04fd1296d5e2.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7627-94010ec8f3f46835.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7638-6dcb16d29ead6ca4.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7907-001de9516cd4720b.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/7985-0222e5b34617cdb6.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/8214-2d565700f6e8eded.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/8370-8d2e6d3b776da9e4.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/918-71d536c1ea24716f.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/9334-cf42b48f7c27651c.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/943-00333609bd11d233.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/9549-53d4113a784ee30e.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-e486e561c4c546da.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/analytics/page-9698f0e45d966641.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/contact/page-901a827f2301b2be.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/messages/page-ee50c5af0b679c29.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/page-6d11425cfa7bdae7.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/requests/page-8ae07f837003cd4e.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/settings/page-2c89a9df3baa33d4.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/trips/page-3a24235be5f12e44.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/admin/users/page-67027dbcc0a97013.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/chats/page-235f3d82b8369639.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/community/page-08e088ffcb1b51cf.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/contact/page-095ebd3e2e106c6d.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/cookies/page-6000b9d316e7f1e2.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-2c7722661c73e054.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/drivers/%5Bid%5D/page-96f4b87b8af17131.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/drivers/page-10486c825e0d2573.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/error-97d52b03c883086f.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/faq/page-c43933b8cd73a9e0.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/global-error-61ab7ae152736a77.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/help/page-e0ab5958f72efb06.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/layout-acaf658a2d666381.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/loading-19d94568018bea18.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/login/page-b7716c7fd8cc3976.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/not-found-31ab770ad34d0820.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/page-429ac471e4fee7a5.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/privacy/page-36b2296f1d63055f.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/profile/page-385a378c22d7c2b9.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/publish/page-393786619c5382dc.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/register/page-f9920958228387ab.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/requests/page-513504a80bec8dda.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/reviews/page-e29088c6970dcc70.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/safety/page-85ecfaea03385d3d.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/terms/page-fdbc99cdd23174a8.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/trips/%5Bid%5D/page-183e6270370ace60.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/app/trips/page-9afba3e6080cd5c4.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/f7ff2f9f-9e777332128c107a.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/framework-88e9ea07bc40a02f.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/main-47d4b80755590608.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/main-app-ad78f04fa14d333e.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/pages/_app-b14e7eee5ac1a769.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/pages/_error-f6a3c680ea6538a0.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-4cd77c8fb5f6aa4b.js',
          revision: 'YtsmrZ5GPQsmxvcKGOwsX',
        },
        {
          url: '/_next/static/css/3d04648548dde867.css',
          revision: '3d04648548dde867',
        },
        {
          url: '/_next/static/media/028c0d39d2e8f589-s.p.woff2',
          revision: 'c47061a6ce9601b5dea8da0c9e847f79',
        },
        {
          url: '/_next/static/media/5b01f339abf2f1a5.p.woff2',
          revision: 'c36289c8eb40b089247060459534962c',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '2bce4532ab759e7515e2abc0e2a6c2a7',
        },
        {
          url: '/diverse-user-avatars.png',
          revision: '1c11eaa8121f2f610347538b84425a66',
        },
        { url: '/favicon.ico', revision: 'bba0a71b6b05009964e9fafb167d3cd0' },
        {
          url: '/icon-128x128.png',
          revision: '456ad330d07579c2f772b9b325a79554',
        },
        {
          url: '/icon-144x144.png',
          revision: '4f0d6f011916d59d6fbe99f2cee82eb7',
        },
        {
          url: '/icon-152x152.png',
          revision: '63f01f65a775fb3719c08caeb2d98197',
        },
        {
          url: '/icon-16x16.png',
          revision: 'a6a46b4898451ffc3cc1a3e3617aeba9',
        },
        {
          url: '/icon-192x192.png',
          revision: '6e8df6cd2725bb842b9607b42183c35d',
        },
        {
          url: '/icon-32x32.png',
          revision: '655de79e6100ba21304dca0de4595bb6',
        },
        {
          url: '/icon-384x384.png',
          revision: 'a556e365add9e5b02896996ae086f0f9',
        },
        {
          url: '/icon-512x512.png',
          revision: '58c9e53ac31984da7877952c04eb176a',
        },
        {
          url: '/icon-72x72.png',
          revision: '3c3a08d19532650fe5a5403fd99ec8ec',
        },
        {
          url: '/icon-96x96.png',
          revision: 'e40f83a80c520d64c13ce8e5ae1e4d10',
        },
        {
          url: '/icon-maskable-512x512.png',
          revision: 'efbc9858472d61d89391fe421743eb31',
        },
        {
          url: '/images/icons/map-pin.jpg',
          revision: '32440148d8c9b214329275f19072c870',
        },
        {
          url: '/images/logo-bg-white.png',
          revision: '05584a802ef4e35fae21be0dab9524da',
        },
        {
          url: '/images/logo-symbol.png',
          revision: '8d75db3919a75db38788cd583bea3744',
        },
        {
          url: '/images/logo.png',
          revision: '8f17396bd4c8d49e6617bbf4b9f93dc7',
        },
        {
          url: '/location-pin-1-svgrepo-com.svg',
          revision: '5038d57bb3993903b02a9bc590b40836',
        },
        {
          url: '/man-driver.jpg',
          revision: '6416ed7938eb90b7e6791a2bd262c552',
        },
        { url: '/manifest.json', revision: '210d532fa8505ad48ac8980293add4ef' },
        { url: '/og-image.png', revision: 'eeeb8f8176cb977efcfa48b81ddb7554' },
        {
          url: '/placeholder-logo.png',
          revision: '95d8d1a4a9bbcccc875e2c381e74064a',
        },
        {
          url: '/placeholder-logo.svg',
          revision: '1e16dc7df824652c5906a2ab44aef78c',
        },
        {
          url: '/placeholder-user.jpg',
          revision: '7ee6562646feae6d6d77e2c72e204591',
        },
        {
          url: '/placeholder.jpg',
          revision: '1e533b7b4545d1d605144ce893afc601',
        },
        {
          url: '/placeholder.svg',
          revision: '35707bd9960ba5281c72af927b79291f',
        },
        { url: '/robots.txt', revision: '80f6713895d8117ff3ae6dfe96d53d42' },
        {
          url: '/user-hands-svgrepo-com.svg',
          revision: '176cbb851a135d4bff9012246b34cf4f',
        },
        {
          url: '/woman-driver-professional.jpg',
          revision: '9a1aa5f98ec73ecf2ae1c6dc6e32b333',
        },
        {
          url: '/woman-driver.png',
          revision: '2bbb600181c7f32ecea5f5c345503b2d',
        },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: s,
              response: e,
              event: c,
              state: t,
            }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'gstatic-fonts-cache',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:js)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:css|less)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https:\/\/.*\.(?:json)$/i,
      new s.StaleWhileRevalidate({ cacheName: 'json-cache', plugins: [] }),
      'GET',
    ),
    s.registerRoute(
      /\/api\/.*$/i,
      new s.NetworkFirst({
        cacheName: 'apis-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET',
    ));
});
