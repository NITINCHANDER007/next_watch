import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function netmirrorStreamPlugin() {
  return {
    name: 'netmirror-stream-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:5173');

          // CORS pre-flight
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.statusCode = 204;
            res.end();
            return;
          }

          // 1. Master Playlist proxy: /api/stream/master/:ott/:id or /api/stream/master/:id
          if (parsedUrl.pathname.startsWith('/api/stream/master/')) {
            const cleanPath = parsedUrl.pathname.replace('/api/stream/master/', '').replace('.m3u8', '');
            const pathParts = cleanPath.split('/');
            let ott = 'nf';
            let id = '';
            if (pathParts.length >= 2) {
              ott = pathParts[0];
              id = pathParts[1];
            } else {
              id = pathParts[0];
            }
            const masterUrl = `https://tv.imgcdn.kim/newtv/hls/${ott}/${id}.m3u8`;

            const upstreamRes = await fetch(masterUrl, {
              headers: {
                'Referer': 'https://net52.cc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (!upstreamRes.ok) {
              res.statusCode = upstreamRes.status;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end('Upstream stream error');
              return;
            }

            let masterText = await upstreamRes.text();

            // Detect upstream rate-limit / abuse placeholder video (clip 220884)
            if (masterText.includes('/220884/') || masterText.includes('220884')) {
              res.statusCode = 404;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end('Upstream stream unreleased or rate-limited placeholder');
              return;
            }

            // 1a. Remove separate audio track definitions (audio is multiplexed inside the MPEG-TS video chunks)
            masterText = masterText.replace(/^#EXT-X-MEDIA:TYPE=AUDIO[^\r\n]*\r?\n?/gm, '');

            // 1b. Remove AUDIO="..." attribute from stream definitions so HLS.js uses the multiplexed audio
            masterText = masterText.replace(/,AUDIO="[^"]*"/g, '');

            // 1c. Normalize any CDN hosts or triple slashes pointing to /files/ to s21.freecdn4.top
            masterText = masterText.replace(/https?:\/\/[^/]*\/+(?:[^/\s"'\n\r]+\/)?files\//g, 'https://s21.freecdn4.top/files/');

            // 1d. Rewrite all absolute URLs to route through /api/stream-proxy?url=...
            const rewritten = masterText.replace(/https?:\/\/[^\s"\n\r]+/g, (matchUrl) => {
              return `/api/stream-proxy?url=${encodeURIComponent(matchUrl)}`;
            });

            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(rewritten);
            return;
          }

          // 2. Chunks, Sub-playlists, and Subtitles proxy: /api/stream-proxy?url=...
          if (parsedUrl.pathname === '/api/stream-proxy') {
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url param');
              return;
            }

            // Normalize targetUrl if needed
            let normalizedUrl = targetUrl;
            if (normalizedUrl.includes('/files/')) {
              normalizedUrl = normalizedUrl.replace(/https?:\/\/[^/]*\/+(?:[^/\s"'\n\r]+\/)?files\//g, 'https://s21.freecdn4.top/files/');
            }

            const upstreamRes = await fetch(normalizedUrl, {
              headers: {
                'Referer': 'https://net52.cc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (!upstreamRes.ok) {
              res.statusCode = upstreamRes.status;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(`Proxy error: ${upstreamRes.status}`);
              return;
            }

            const rawContentType = upstreamRes.headers.get('content-type') || '';
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

            // Handle Sub-playlists (.m3u8)
            if (
              normalizedUrl.includes('.m3u8') ||
              rawContentType.includes('mpegurl') ||
              rawContentType.includes('application/x-mpegURL')
            ) {
              const text = await upstreamRes.text();
              const subBase = normalizedUrl.substring(0, normalizedUrl.lastIndexOf('/') + 1);
              const rewritten = text.replace(/^([^#\r\n][^\r\n]*)/gm, (line) => {
                const trimmed = line.trim();
                if (!trimmed) return line;
                let chunkUrl = trimmed.startsWith('http') ? trimmed : subBase + trimmed;
                if (chunkUrl.includes('/files/')) {
                  chunkUrl = chunkUrl.replace(/https?:\/\/[^/]*\/+(?:[^/\s"'\n\r]+\/)?files\//g, 'https://s21.freecdn4.top/files/');
                }
                return `/api/stream-proxy?url=${encodeURIComponent(chunkUrl)}`;
              });

              res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(rewritten);
              return;
            }

            // Handle Subtitles (.vtt)
            if (normalizedUrl.includes('.vtt') || rawContentType.includes('text/vtt')) {
              res.setHeader('Content-Type', 'text/vtt');
              const text = await upstreamRes.text();
              res.end(text);
              return;
            }

            // Handle Video Chunks disguised as .jpg or ending with .ts / .mp2t
            // Crucial: upstream serves video chunks disguised as .jpg with Content-Type: image/jpeg
            // We MUST override this to video/mp2t so MSE / HLS.js demuxes it properly!
            const isVideoChunk = normalizedUrl.includes('/files/') ||
              normalizedUrl.endsWith('.ts') ||
              normalizedUrl.endsWith('.mp2t') ||
              (normalizedUrl.includes('.jpg') && normalizedUrl.includes('/1080p/')) ||
              (normalizedUrl.includes('.jpg') && normalizedUrl.includes('/720p/')) ||
              (normalizedUrl.includes('.jpg') && normalizedUrl.includes('/480p/'));

            if (isVideoChunk) {
              res.setHeader('Content-Type', 'video/mp2t');
            } else {
              res.setHeader('Content-Type', rawContentType || 'application/octet-stream');
            }

            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            const arrayBuffer = await upstreamRes.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
            return;
          }

          // 3. Image Proxy: /api/image-proxy?url=...
          if (parsedUrl.pathname === '/api/image-proxy') {
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url param');
              return;
            }

            const upstreamRes = await fetch(targetUrl, {
              headers: {
                'Referer': 'https://net52.cc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (!upstreamRes.ok) {
              res.statusCode = upstreamRes.status;
              res.end(`Image error: ${upstreamRes.status}`);
              return;
            }

            const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            const arrayBuffer = await upstreamRes.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
            return;
          }

          // 4. IMDB ID Quick Title Lookup: /api/imdb/lookup?title=...
          if (parsedUrl.pathname === '/api/imdb/lookup') {
            const rawTitle = parsedUrl.searchParams.get('title') || '';
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');

            if (!rawTitle.trim()) {
              res.end(JSON.stringify({ imdbId: null }));
              return;
            }

            const clean = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const firstChar = clean[0] || 'a';

            try {
              const imdbRes = await fetch(`https://v3.sg.media-imdb.com/suggestion/${firstChar}/${clean}.json`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
              });
              if (imdbRes.ok) {
                const data = await imdbRes.json();
                const match = data.d?.find((x) => x.id && x.id.startsWith('tt'));
                if (match) {
                  res.end(JSON.stringify({ imdbId: match.id, title: match.l, year: match.y, type: match.q }));
                  return;
                }
              }
            } catch (err) {
              console.warn('[IMDB Suggestion Lookup Error]', err.message);
            }

            res.end(JSON.stringify({ imdbId: null }));
            return;
          }
        } catch (err) {
          console.error('[NetMirror Proxy Plugin Error]', err);
          res.statusCode = 500;
          res.end(`Internal Stream Proxy Error: ${err.message}`);
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), netmirrorStreamPlugin()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/netmirror': {
        target: 'https://tv.imgcdn.kim',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/netmirror/, '/newtv'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('X-Requested-With', 'NetmirrorNewTV v1.0');
            proxyReq.setHeader('Referer', 'https://net52.cc');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0');
            if (req.headers['ott']) {
              proxyReq.setHeader('Ott', req.headers['ott']);
            } else {
              proxyReq.setHeader('Ott', 'nf');
            }
          });
        }
      },
      '/api/imdb': {
        target: 'https://api2.imdb4.shop',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/imdb/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://netmirror.center/'
        }
      }
    }
  }
});
