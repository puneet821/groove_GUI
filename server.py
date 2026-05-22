#!/usr/bin/env python3
import http.server, urllib.request, urllib.parse, os, json, ssl, re, socketserver

PORT = 3030
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
ssl_context = ssl._create_unverified_context()

class GrooveCMDHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *args): pass
    
    def fetch_url(self, url, headers=None):
        h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        if headers: h.update(headers)
        try:
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, context=ssl_context, timeout=10) as r:
                return r.read()
        except: return None

    def do_GET(self):
        print(f"  [SERVER] GET {self.path}")
        p = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(p.query)

        # ── Ultimate Search (Scrapes YouTube Results Directly) ──
        if p.path.startswith("/api/yt/search"):
            query = q.get("q", [""])[0]
            # Use a very stable public scraper endpoint
            search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}&sp=EgIQAQ%253D%253D"
            html = self.fetch_url(search_url).decode('utf-8', errors='ignore')
            
            # Extract video IDs and Titles using Regex (Hardcore Scraping)
            ids = re.findall(r"\"videoId\":\"([^\"]+)\"", html)
            titles = re.findall(r"\"title\":\{\"runs\":\[\{\"text\":\"([^\"]+)\"\}\]", html)
            
            results = []
            for i in range(min(len(ids), 10)):
                results.append({
                    "videoId": ids[i],
                    "title": titles[i] if i < len(titles) else "Unknown",
                    "author": "YouTube",
                    "lengthSeconds": 0
                })
            
            response_bytes = json.dumps(results).encode('utf-8')
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        # ── Audio Proxy ──
        if p.path == "/audio":
            u = q.get("url", [None])[0]
            if not u: return self.send_error(400)
            
            h = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://www.jiosaavn.com/"
            }
            range_header = self.headers.get("Range")
            if range_header:
                h["Range"] = range_header
                
            try:
                req = urllib.request.Request(u, headers=h)
                with urllib.request.urlopen(req, context=ssl_context, timeout=15) as r:
                    status = r.status if hasattr(r, 'status') else 200
                    self.send_response(status)
                    
                    for key, val in r.getheaders():
                        if key.lower() in ["content-type", "content-range", "content-length", "accept-ranges"]:
                            self.send_header(key, val)
                            
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Access-Control-Allow-Headers", "Range")
                    self.end_headers()
                    
                    try:
                        while True:
                            chunk = r.read(8192)
                            if not chunk:
                                break
                            self.wfile.write(chunk)
                    except Exception as write_err:
                        pass
                return
            except Exception as e:
                try:
                    self.send_error(502)
                except:
                    pass
                return

        # ── Saavn Proxy ──
        if p.path.startswith("/api/saavn"):
            sub = p.path.replace("/api/saavn", "", 1)
            qs = f"?{p.query}" if p.query else ""
            data = None
            if "search/songs" in sub:
                data = self.fetch_url(f"https://saavnapi-nine.vercel.app/result/{qs}")
                if not data:
                    print("  [PROXY FAILOVER] saavnapi-nine failed. Trying jiosaavn-api-2...")
                    data = self.fetch_url(f"https://jiosaavn-api-2.vercel.app/search/songs{qs}")
            else:
                data = self.fetch_url(f"https://saavnapi-nine.vercel.app{sub}{qs}")
                if not data:
                    print("  [PROXY FAILOVER] saavnapi-nine failed. Trying jiosaavn-api-2...")
                    data = self.fetch_url(f"https://jiosaavn-api-2.vercel.app{sub}{qs}")
            
            if data:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
                return
            self.send_error(502); return

        # ── Spotify Playlist Scraper ──
        if p.path.startswith("/api/spotify/playlist"):
            playlist_id = q.get("id", [None])[0] or q.get("url", [None])[0]
            if not playlist_id:
                self.send_error(400, "Missing playlist ID or URL")
                return
            
            # Extract playlist ID if a full URL was provided
            match = re.search(r'(?:playlist/|playlist:)([a-zA-Z0-9]{22})', playlist_id)
            if match:
                playlist_id = match.group(1)
            elif len(playlist_id) != 22:
                err_data = json.dumps({"error": "Invalid Spotify Playlist ID or URL format."}).encode()
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err_data)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err_data)
                return
            
            # Fetch public Spotify embed page
            embed_url = f"https://open.spotify.com/embed/playlist/{playlist_id}"
            html_bytes = self.fetch_url(embed_url)
            if not html_bytes:
                err_data = json.dumps({"error": "Failed to fetch Spotify playlist page."}).encode()
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err_data)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err_data)
                return
                
            try:
                html = html_bytes.decode('utf-8', errors='ignore')
                json_match = re.search(r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
                if not json_match:
                    err_data = json.dumps({"error": "Could not extract metadata from Spotify playlist page."}).encode()
                    self.send_response(422)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(err_data)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(err_data)
                    return
                
                payload = json.loads(json_match.group(1))
                entity = payload.get("props", {}).get("pageProps", {}).get("state", {}).get("data", {}).get("entity", {})
                
                if not entity:
                    err_data = json.dumps({"error": "Spotify playlist not found or is private."}).encode()
                    self.send_response(404)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(err_data)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(err_data)
                    return
                
                title = entity.get("title", entity.get("name", "Imported Spotify Playlist"))
                desc = entity.get("subtitle", "") or entity.get("description", "")
                
                cover_image = "logo.svg"
                cover_art = entity.get("coverArt", {})
                if cover_art and "sources" in cover_art and cover_art["sources"]:
                    cover_image = cover_art["sources"][0].get("url", "logo.svg")
                elif "visualIdentity" in entity and "image" in entity["visualIdentity"] and entity["visualIdentity"]["image"]:
                    cover_image = entity["visualIdentity"]["image"][0].get("url", "logo.svg")
                
                tracks = []
                raw_tracks = entity.get("trackList", [])
                for idx, t in enumerate(raw_tracks):
                    t_title = t.get("title", "Unknown Title")
                    t_artist = t.get("subtitle", "Unknown Artist")
                    t_duration_ms = t.get("duration", 0)
                    t_duration_sec = int(t_duration_ms / 1000) if t_duration_ms else 180
                    t_uri = t.get("uri", "")
                    
                    tracks.append({
                        "id": t_uri.split(":")[-1] if t_uri else f"track_{idx}",
                        "title": t_title,
                        "artist": t_artist,
                        "duration": t_duration_sec,
                        "source": "spotify",
                        "image": cover_image
                    })
                
                response_data = {
                    "title": title,
                    "description": desc,
                    "image": cover_image,
                    "tracks": tracks
                }
                
                response_data_bytes = json.dumps(response_data).encode('utf-8')
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(response_data_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(response_data_bytes)
                return
            except Exception as e:
                err_data = json.dumps({"error": f"Error parsing playlist data: {str(e)}"}).encode()
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err_data)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err_data)
                return

        # Static files
        path = p.path if p.path != "/" else "/index.html"
        fp = os.path.join(STATIC_DIR, path.lstrip("/").replace("/", os.sep))
        if os.path.isfile(fp):
            try:
                file_size = os.path.getsize(fp)
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                if fp.endswith(".js"): self.send_header("Content-Type", "application/javascript")
                elif fp.endswith(".css"): self.send_header("Content-Type", "text/css")
                elif fp.endswith(".svg"): self.send_header("Content-Type", "image/svg+xml")
                elif fp.endswith(".png"): self.send_header("Content-Type", "image/png")
                elif fp.endswith(".ico"): self.send_header("Content-Type", "image/x-icon")
                self.send_header("Content-Length", str(file_size))
                self.end_headers()
                with open(fp, "rb") as f: self.wfile.write(f.read())
            except Exception as e:
                print(f"Error serving static file {fp}: {e}")
        else: self.send_error(404)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == "__main__":
    print(f"  [ABSOLUTE-FIX-V8] Ready on {PORT}...")
    ThreadedHTTPServer(("", PORT), GrooveCMDHandler).serve_forever()
