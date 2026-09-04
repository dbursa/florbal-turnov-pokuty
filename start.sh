#!/bin/bash
# Spustí appku na http://localhost, aby šlo ukládat pokuty přímo do data.js
# (bez toho appka běží jen přes file://, kde prohlížeč nesmí zapisovat na disk).
cd "$(dirname "$0")"

PORT=8787
URL="http://localhost:$PORT/index.html"

python3 -m http.server "$PORT" &
SERVER_PID=$!

sleep 1
xdg-open "$URL" 2>/dev/null &

echo "Appka běží na $URL"
echo "Pro automatické ukládání do data.js použij Chrome, Edge nebo Chromium (Firefox to nepodporuje)."
echo "Zavřením tohoto okna nebo Ctrl+C appku vypneš."
wait $SERVER_PID
