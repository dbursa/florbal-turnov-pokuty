# Pokuty – Florbal Turnov

Malá appka na správu pokut v týmu. Žádný framework, žádný build, jen HTML/CSS/JS.
Data jsou v [`data.js`](./data.js).

## Spuštění

```bash
/home/kanal/work/015_florbal-turnov/florbal-turnov-pokuty/start.sh
```

Otevře appku na `http://localhost:8787` a rovnou ji spustí v prohlížeči.
Zastavíš ji `Ctrl+C` v terminálu, kde `start.sh` běží.

`start.sh` spouští `server.py` místo obyčejného `python3 -m http.server` –
ten kromě servírování souborů umí i zapisovat změny rovnou do `data.js`.
Appka tak ukládá automaticky v libovolném prohlížeči, bez stahování a bez
ručního přetahování souboru.

Po úpravách pokut nezapomeň:

```bash
git add data.js
git commit -m "Aktualizace pokut"
```

## Otevření bez spuštění serveru

Appku jde otevřít i dvojklikem na `index.html` bez `start.sh` – data se
načtou stejně, jen automatické ukládání do souboru nebude fungovat
(prohlížeč nesmí zapisovat na disk bez lokálního serveru).
