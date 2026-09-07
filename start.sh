#!/bin/bash
# Spustí appku na http://localhost, aby šlo ukládat pokuty přímo do data.js
# (bez toho appka běží jen přes file://, kde prohlížeč nesmí zapisovat na disk).
cd "$(dirname "$0")"

PORT=8787
URL="http://localhost:$PORT/index.html"

# Ukonči jakýkoli starý proces, co drží tenhle port (např. zapomenutý běh
# appky z předchozí session) - jinak by nový server nešel nastartovat a
# prohlížeč by se připojil na starý (bez ukládání do data.js).
OLD_PID=$(lsof -ti tcp:$PORT -sTCP:LISTEN 2>/dev/null)
if [ -n "$OLD_PID" ]; then
  echo "Na portu $PORT už něco běží (PID $OLD_PID), ukončuji to."
  kill $OLD_PID 2>/dev/null
  sleep 1
fi

python3 server.py &
SERVER_PID=$!

sleep 1
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server se nepodařilo spustit - zkontroluj, jestli port $PORT není pořád obsazený."
  exit 1
fi

xdg-open "$URL" 2>/dev/null &

echo "Appka běží na $URL"
echo "Změny se ukládají do data.js automaticky, žádné stahování ani drag&drop."
echo "Pokud se prohlížeč neotevřel sám, otevři $URL ručně."
echo "Zavřením tohoto okna nebo Ctrl+C appku vypneš."
wait $SERVER_PID
