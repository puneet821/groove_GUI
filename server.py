#!/usr/bin/env python3
import http.server, urllib.request, urllib.parse, os, json, ssl, re

PORT = 3030
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
ssl_context = ssl._create_unverified_context()

class GrooveCMDHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    
    def fetch_url(self, url, headers=None):
        h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        if headers: h.update(headers)
        try:
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, context=ssl_context, timeout=10) as r:
                return r.read()
        except: return None

    def do_GET(self):
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
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())
            return

        # ── Audio Proxy ──
        if p.path == "/audio":
            u = q.get("url", [None])[0]
            if not u: return self.send_error(400)
            data = self.fetch_url(u, {"Referer": "https://www.jiosaavn.com/"})
            if data:
                self.send_response(200)
                self.send_header("Content-Type", "audio/mp4")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
                return
            self.send_error(502); return

        # ── Saavn Proxy ──
        if p.path.startswith("/api/saavn"):
            sub = p.path.replace("/api/saavn", "", 1)
            qs = f"?{p.query}" if p.query else ""
            data = self.fetch_url(f"https://saavn.dev/api{sub}{qs}")
            if data:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
                return
            self.send_error(502); return

        # Static files
        path = p.path if p.path != "/" else "/index.html"
        fp = os.path.join(STATIC_DIR, path.lstrip("/").replace("/", os.sep))
        if os.path.isfile(fp):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            if fp.endswith(".js"): self.send_header("Content-Type", "application/javascript")
            elif fp.endswith(".css"): self.send_header("Content-Type", "text/css")
            self.end_headers()
            with open(fp, "rb") as f: self.wfile.write(f.read())
        else: self.send_error(404)

if __name__ == "__main__":
    print(f"  [ABSOLUTE-FIX-V7] Ready on {PORT}...")
    http.server.HTTPServer(("", PORT), GrooveCMDHandler).serve_forever()
