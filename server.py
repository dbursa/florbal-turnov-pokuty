#!/usr/bin/env python3
"""Static file server + jeden zapisovaci endpoint, aby appka mohla ukladat
zmeny primo do data.js bez rucniho stahovani (funguje ve vsech prohlizecich,
ne jen v Chrome/Edge pres File System Access API)."""
import http.server
import json
import os

PORT = 8787
DATA_FILE = "data.js"


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/ping":
            self._send_json(200, {"ok": True})
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/save":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length))
            content = body["content"]
            if not isinstance(content, str) or "window.SAVED_DATA" not in content:
                raise ValueError("unexpected content")
        except Exception as e:
            self._send_json(400, {"ok": False, "error": str(e)})
            return

        tmp_path = DATA_FILE + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp_path, DATA_FILE)
        self._send_json(200, {"ok": True})

    def _send_json(self, status, obj):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        pass  # ticho - start.sh uz vypise, ze appka bezi


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
