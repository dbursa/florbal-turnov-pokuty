# Pokuty – Florbal Turnov

Malá appka na správu pokut v týmu. Žádný framework, žádný build, jen HTML/CSS/JS.
Data jsou v [`data.js`](./data.js).

## Spuštění

```bash
/home/kanal/work/015_florbal-turnov/florbal-turnov-pokuty/start.sh
```

Otevře appku na `http://localhost:8787` a rovnou ji spustí v prohlížeči.
Zastavíš ji `Ctrl+C` v terminálu, kde `start.sh` běží.

Pro automatické ukládání změn přímo do `data.js` (bez stahování) použij
**Chrome, Edge nebo Chromium** a v appce klikni na **„🔗 Propojit data.js“**
– v dialogu vyber soubor `data.js` v tomto adresáři. Firefox tuhle funkci
nepodporuje, appka pak jen nabídne stažení souboru k ručnímu nahrazení.

Po úpravách pokut nezapomeň:

```bash
git add data.js
git commit -m "Aktualizace pokut"
```

## Otevření bez spuštění serveru

Appku jde otevřít i dvojklikem na `index.html` bez `start.sh` – data se
načtou stejně, jen automatické ukládání do souboru nebude fungovat
(prohlížeč nesmí zapisovat na disk bez lokálního serveru).
