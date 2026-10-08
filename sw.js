// 꼬북이 키우기: 오프라인에서도 열리게 게임 파일을 기기에 저장해 두는 도우미 (서비스 워커)
// 게임을 고쳐서 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요.
const CACHE = 'kkobuk-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'start.json',
  'icon-180.png', 'icon-192.png', 'icon-512.png',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // 게임 화면(index.html)은 인터넷이 되면 새 버전을, 안 되면 저장해 둔 것을 써요
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put('index.html', copy));
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  // 나머지(3D 프로그램, 그림)는 저장해 둔 것을 먼저 써요
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  })));
});
